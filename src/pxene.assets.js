"use strict";
import * as mimeTypes from "./pxene.assets.mimeTypes";

/**
 * @Module pxene.assets
 * Handles loading, pre-processing, and caching of remote assets.
 */
/** @const {Array} list of deferred asset URIs **/
const enqueuedURIs = [];
/** @const {Array} list of currently fetching URIs **/
const fetchingURIs = [];
/** @const {Array} list of completed URIs which should be in the cache **/
const completedURIs = [];
/** @const {Object} a hash of uri->{@link Asset} **/
const cache = {};
/** @const {Object} a hash of handlers by mime type **/

let globalAssetPrefix = "";
let fetching = 0;

/**
 * Safely attempt to move an item from one array to another.
 * @return {bool} true if an item was found or moved, otherwise false
 */
function moveItem(item, oldList, newList) {
	let i = oldList.indexOf(item);
	if(i !== -1) {
		newList.push(oldList.splice(i, 1));
		return true;
	}
	else return false;
}

/**
 * An object representing a loaded asset.
 * @property uri the uri originally requested for the object (not including global prefixes, domain names, etc)
 * @property {Object} content the processed response, which may be an Image, a string, an SVG, a decoded JSON object, or any other supported value type
 * @property {String} type
 */
function Asset(uri, content, type) {
	this.uri = uri;
	this.content = content;
	this.type = type;
	return this;
}

/**
 * Fetches an asset from a remote source.
 * @param {String} uri
 */
function fetchAsset(uri) {
	if(fetchingURIs.indexOf(uri) === -1 && completedURIs.indexOf(uri) === -1) {
		fetching++;
		// add to the fetching list, moving it from enqueuedURIs if needed
		if(!moveItem(uri, enqueuedURIs, fetchingURIs)) fetchingURIs.push(uri);
		return fetch(globalAssetPrefix+uri).then(makeProcessFetchResponse(uri))	
	}
}


/**
 * Makes a processFetchResponse binding to ensure the original uri stays in scope.
 */
function makeProcessFetchResponse(uri) {
	return processFetchResponse.bind(null, uri);
}

/**
 * Processes a response from a fetch request.
 */
function processFetchResponse(uri, response) {
	return new Promise((resolve, reject) => {
		if(response.ok) {
			let type = response.headers.get("Content-type");
			return mimeTypes.getHandler(type)(response)
				.then((content) => storeAsset(uri, content, type, resolve));
		}
		else reject("failed to fetch asset "+uri);
	});
}

/**
 * Stores an asset in the cache.
 * @param {String} uri the originally requested URI
 * @param {mixed} content the processed response content
 * @param {String} type the mime type of the response
 * @param {function} resolve promise callback for the original fetch request
 */
function storeAsset(uri, content, type, resolve) {
	let item = new Asset(uri, content, type); 
	cache[uri] = item;
	fetching--;
	moveItem(uri, fetchingURIs, completedURIs);
	resolve(item);
}

/**
 * Gets an asset from the cache if available, or else fetches it from a remote source.
 * Returns a promise which resolves with the {@link Asset} requested.
 * @param {String} uri 
 * @return Promise
 */
export function requestAsset(uri) {
	let item = cache[uri];
	if(item === undefined) return fetchAsset(uri);
	else return new Promise((resolve) => resolve(item));
}

export function requestAssetList(list) {
	return Promise.all(list.map((item) => requestAsset(item)));
}

/**
 * Enqueues an asset to be fetched. Enqueued assets are fetched later when processQueue is called.
 */
export function enqueueAsset(uri) {
	if(enqueuedURIs.indexOf(uri) === -1 && fetchingURIs.indexOf(uri) === -1 && cache[uri] === undefined) enqueuedURIs.push(uri);
}

/**
 * Enqueues a list of assets to be fetched layer during a processQueue() call.
 * @param {Array} list array of URIs to load
 * @returns {Promise|undefined}
 */
export function enqueueAssetList(list) {
	list.forEach(item => enqueueAsset(item)); 
}

/**
 * Process any deferred items in the queue.
 * @return {Promise} a promise that resolves when all the items are fetched with an array of all the fetched items
 */
export function processQueue() {
	return Promise.all(enqueuedURIs.map((uri) => fetchAsset(uri)));
}

/**
 * Sets the globalAssetPrefix, which is prepended to all fetch URIs.
 * @param {string} prefix a string representing a path or filename prefix
 */
export function setGlobalAssetPrefix(prefix) {
	globalAssetPrefix = prefix;
}
