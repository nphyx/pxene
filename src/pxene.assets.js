"use strict";
/**
 * Asset handler.
 */
const enqueuedURIs = [
];

const fetchingURIs = [
];

const completedURIs = [
];

var globalAssetPrefix = "";

const loadedAssets = {
}

let fetching = 0;

/**
 * Sets the globalAssetPrefix, which is prepended to all fetch URIs.
 */
export function setGlobalAssetPrefix(prefix) {
	globalAssetPrefix = prefix;
}

function moveItem(item, oldList, newList) {
	let i = oldList.indexOf(item);
	if(i !== -1) newList.push(oldList.splice(i, 1));
	else return false;
}


export function enqueueAsset(uri, defer = false) {
	if(enqueuedURIs.indexOf(uri) === -1 && completedURIs.indexOf(uri) === -1) {
		fetching++;
		if(defer) enqueuedURIs.push(uri);
		else {
			fetchingURIs.push(uri);
			return fetch(globalAssetPrefix+uri).then(processFetchResponse).then(storeAsset);
		}
	}

	else if(completedURIs.indexOf(uri)) {
		if(!defer) return new Promise(resolve => resolve(loadedAssets[uri]));
	}
}

/**
 * Process any deferred items in the queue.
 * @return {Promise} a promise that resolves when all the items are fetched with an array of all the fetched items
 */
export function processQueue() {
	return Promise.all(enqueuedURIs.slice(0).map((uri) => {
		moveItem(uri, enqueuedURIs, fetchingURIs);
		return fetch(globalAssetPrefix+uri).then(processFetchResponse).then(storeAsset)
	}));
}

/**
 * Processes a response from a fetch request.
 */
function processFetchResponse(res) {
	return new Promise(resolve => {
		let origUrl = res.url.replace(globalAssetPrefix, "");
		if(res.ok) {
			let type = res.headers.get("Content-type");
			console.log(origUrl, type);
			switch(type) {
				case "image/jpeg":
				case "image/webp":
				case "image/gif":
				case "image/png":
					res.blob().then((blob) => {
						let img = document.createElement("img");
						img.src = URL.createObjectURL(blob);
						resolve(img, origUrl, type);
					});
				break;
				case "text/html":
					res.text().then(text => resolve(text, origUrl, type));
				break;
				case "application/json":
					res.json().then(obj => resolve(obj, origUrl, type));
				break;
				default:
					res.blob().then(blob => resolve(blob, origUrl, type));
			}
		}
		else resolve(undefined, origUrl, undefined);
	});
}

function storeAsset(processedAsset, uri, type) {
	let item = {type:type, content:processedAsset}; 
	loadedAssets[uri] = item;
	fetching--;
	moveItem(uri, fetchingURIs, completedURIs);
	return new Promise(resolve => resolve(item));
}

export function getAsset(uri) {
	let item = loadedAssets[uri];
	if(item === undefined) return enqueueAsset(uri);
	else return new Promise((resolve) => resolve(item));
}
