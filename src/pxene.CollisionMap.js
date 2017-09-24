"use strict";
import BooleanArray from "./pxene.BooleanArray";
/**
 * @module pxene.CollisionMap
 *
 * Module containing {@link CollisionMap} prototype.
 */

const internal_array = Symbol();

/**
 * @constructor
 * A collision map is a 2d grid of boolean true/false values, meant to be
 * used for collision testing.
 *
 * @param {int} width the width of the grid
 * @param {int} height the height of the grid
 * @return {CollisionMap}
 */
export default function CollisionMap(width = 0, height = 0) {
	if(width && height) this.init(width, height);
	return this;
}

/* helpful(?) constants */
/** pixel array index offset for the red channel **/
CollisionMap.CHANNEL_RED = 0;
/** pixel array index offset for the green channel **/
CollisionMap.CHANNEL_GREEN = 1;
/** pixel array index offset for the blue channel **/
CollisionMap.CHANNEL_BLUE = 2;
/** pixel array index offset for the alpha channel **/
CollisionMap.CHANNEL_AlPHA = 3;

/**
 * Creates a per-pixel collision map from a Canvas.
 * @param {Canvas} canvas the canvas to read pixel data from
 * @param {int} threshold the threshold above which a pixel will be considered solid (default 0) 
 * @param {int} channel the channel to check against (default {@link CollisionMap.CHANNEL_ALPHA}) 
 * @return {CollisionMap} 
 *
 * @note internal canvas pixel data stores alpha in a range of 0 to 255, so
 * convert from [0 - 1] to [0 - 255] if providing a threshold 
 */
CollisionMap.fromCanvasPixels = function(canvas, threshold = 0, channel = CollisionMap.CHANNEL_ALPHA) {
	let ppcm = new CollisionMap(canvas.width, canvas.height);
	let pixels;
	let context = canvas.getContext("2d");
	for(let y = 0, h = canvas.height; y < h; ++y) {
		// go one row at a time with the image data for sanity/memory use
		try {
			pixels = context.getImageData(0, y, canvas.width, 1).data;
		}
		catch(e) {
			throw new Error("CollisionData:failed to get image data :(");
		}
		for(let i = 0, len = pixels.length; i < len; i+=4) {
			let x = i / 4;
			if(pixels[i+channel] > threshold) ppcm.set(x, y, true);
		}
	}
}

/**
 * Reinitializes the map with a new width and height.
 * @param {int} width
 * @param {int} height
 * @return {self}
 */
CollisionMap.prototype.init = function(width, height) {
	this.width = ~~width;
	this.height = ~~height;
	let newlen = this.width * this.height;
	if(this.length !== newlen) {
		this.length = newlen;
		if(this.length) {
			this[internal_array] = new BooleanArray(this.length);
		}
	}
	else if(this[internal_array]) this[internal_array].fill(0);
	return this;
}

CollisionMap.prototype.get = function get(x, y) {
	return this[internal_array].get((y * this.width) + x);
}

CollisionMap.prototype.set = function set(x, y, v) {
	this[internal_array].set((y * this.width) + x, v);
}

/**
 * Checks a rectangular area of the CollisionMap, returning a count of solid
 * grid sections within.
 *
 * @param {int} x start x coordinate
 * @param {int} y start y coordinate
 * @param {int} w width of rectangle
 * @param {int} h height of rectangle 
 * @return {int}
 */
CollisionMap.prototype.checkRect = function checkRect(x, y, w, h) {
	let sum = 0;
	for(let cx = x; cx < x + w; ++cx) {
		for(let cy = y; cy < y + h; ++cy) {
			sum += this.get(cx, cy)?1:0;
		}
	}
	return sum;
}

/**
 * Intersects two CollisionMaps, returning a sum of the count of overlapping
 * solid areas.
 * @param {CollisionMap} target the map to intersect with
 * @param {int} sx start x of this map
 * @param {int} sy start y of this map
 * @param {int} tx start x of the target map
 * @param {int} ty start y of the target map
 * @param {int} w width of area to collide
 * @param {int} h height of area to collide
 * @return {int}
 * @todo examine whether fast intersection by blocks of 8 sectors is doable
 */
CollisionMap.prototype.intersect = function intersect(target, sx, sy, tx, ty, w, h) {
	let x, y, sum = 0;
	for(y = 0; y < h; ++y) {
		for(x = 0; x < h; ++x) {
			sum += (this.get(sx+x, sy+y) && target.get(tx+x, ty+y))?1:0;	
		}
	}
	return sum;
}
