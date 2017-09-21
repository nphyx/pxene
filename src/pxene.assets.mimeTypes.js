/**
 * @module pxene.assets.mimeTypes
 * Manages the collection of mime type handlers used by the {@link pxene.assets} module to process
 * fetched assets.
 */
const mimeHandlers = {
	"default":(response) => new Promise(resolve => response.blob().then(blob => resolve(blob)))
};

/**
 * Adds a specialized handler for a given mime type. Can be used as a plugin system or to handle
 * specialized asset types. See {@link mimeTimeHandler} for information about the callback.
 *
 * @Example
 * ```javascript
 * addMimeHandler("some-type/subtype", fn(originalUrl, response, resolve) {
*   res.text().then(text => resolve(text, originalUrl, type));
 * });
 * @param {string} mimeType
 * @param {mimeTypeHandler} cb callback
 */
export function addHandler(mimeType, cb) {
	if(mimeHandlers[mimeType] === undefined) mimeHandlers[mimeType] = cb;
	else throw new Error("tried to add a mimeType but there's already a handler for it");
}

/**
 * Looks up a mime type handler, returning the default handler if none is found.
 */
export function getHandler(mimeType) {
	if(typeof mimeHandlers[mimeType] === "function") return mimeHandlers[mimeType];
	else return mimeHandlers.default;
}

/**
 * A mime type handler callback function. This is a sort of middleware that does some preprocessing
 * on certain asset types before passing them on to the storage system.
 * @callback mimeTypeHandler
 * @param {Response} the Response object returned from a fetch()
 * @return {Promise} which resolves() with the final form of the asset to be stored
 */

/**
 * A mime handler for image types.
 */
function mimeTypeHandlerImages(response) {
	return new Promise((resolve) => {
		response.blob().then((blob) => {
			let img = document.createElement("img");
			img.addEventListener("load", () => resolve(img));
			img.src = URL.createObjectURL(blob);
		});
	});
}

/**
 * A mime type handler for plain text.
 */
function mimeTypeHandlerText(response) {
	return new Promise((resolve) => response.text().then(text => resolve(text)));
}

/**
 * A mime type handler for json objects.
 */
function mimeTypeHandlerJSON(response) {
	return new Promise((resolve) => response.json().then(json => resolve(json)));
}

addHandler("image/jpeg", mimeTypeHandlerImages);
addHandler("image/gif",  mimeTypeHandlerImages);
addHandler("image/png",  mimeTypeHandlerImages);
addHandler("text/html", mimeTypeHandlerText);
addHandler("text/plain", mimeTypeHandlerText);
addHandler("application/json", mimeTypeHandlerJSON);
