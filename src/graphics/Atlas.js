"use strict";
/**
 * @module pxene.graphics.Atlas
 *
 * Contains the Atlas prototype.
 */
import * as assets from "../pxene.assets";
/** a cache of already processed Atlases **/
const cache = [];
/**
 * Much like a sprite, an atlas is a collection of smaller images on a single sheet.
 * An atlas may have non-uniform cell sizes, and is more suitable for static graphics.
 *
 * @todo Implement me
 */
export default function Atlas(length, width, height, slices) {
	this.length = length;
	this.width = width;
	this.height = height;
	this.slices = slices;
	this.context = undefined;
	this.flippedContext = undefined;
	this.ready = false;
	return Object.seal(this);
}

/**
 * Initializes the sprite with an image, copying it to the sprite's internal
 * canvas.
 * @param {Image} image a loaded Image element
 * @param {bool} flipped whether to generate a horizontally flipped version (default: true)
 */
Atlas.prototype.init = function init(image, flipped = true) {
	let canvas = document.createElement("canvas");
	canvas.width = this.width = image.width;
	canvas.height = this.height = image.height;
	let context = canvas.getContext("2d");
	context.drawImage(image, 0, 0);
	this.context = context;
	if(flipped) this.generateFlipped();
	this.ready = true;
}

/**
 * Generates a horizontally flipped version of the sprite with all the cells
 * at the same indexes. Normally run during {@link init} but can be called
 * manually if init was instructed not to create the flipped version.
 */
Atlas.prototype.generateFlipped = function generateFlipped() {
	let canvas = document.createElement("canvas");
	canvas.width = this.width;
	canvas.height = this.height;
	let context = canvas.getContext("2d");
	context.scale(-1, 1);
	let sx, sy, dx, dy, w, h;
	Object.keys(this.slices).forEach((key) => {
		if(key === "default") return;
		let slice = this.slices[key];
		sx = slice.x;
		sy = slice.y;
		dx = sx;
		dy = sy;
		w = slice.w;
		h = slice.h;
		context.drawImage(this.context.canvas, sx, sy, w, h, -sx-w, dy, w, h);
	});
	context.setTransform(1, 0, 0, 1, 0, 0);
	this.flippedContext = context;
}

/**
 * Draw a slice from the atlas to the given context.
 * @param {CanvasContext2d} dest the destination context
 * @param {string} name the name of the slice to draw
 * @param {vec2} pos the top left corner to start drawing at
 * @param {bool} flipped horizontal flip toggle (to reverse facing of image)
 */
Atlas.prototype.draw = function(dest, name, pos, flipped) {
	let slice = (
			this.slices[name]?
			this.slices[name]:
			this.slices.default);
	let canvas = flipped?this.flippedContext.canvas:this.context.canvas;
	dest.drawImage(
		canvas,
		slice.x, slice.y,
		slice.w, slice.h,
		pos[0], pos[1],
		slice.w, slice.h);
}

/**
 * Create a new Atlas from an imported AsepriteAtlas. Returns a promise
 * which resolves with an atlas once it's ready to use.
 *
 * @param {string} uri a URI for an atlas JSON file
 * @return {Promise}
 */
Atlas.fromAsepriteAtlas = function fromAsepriteAtlas(uri) {
	return new Promise((resolve) => {
		if(cache[uri] !== undefined && cache[uri] instanceof Atlas) {
			resolve(cache[uri]);
		}
		else {
			console.log(assets);
			assets.requestAsset(uri).then((asset) => {
				let aspr = asset.content;
				let slices = {
					default:{
					label:"default",
					x:0,
					y:0,
					w:aspr.meta.size.w,
					h:aspr.meta.size.h
					}
				}

				if(aspr.meta.slices) aspr.meta.slices.forEach((slice) => {
					slices[slice.name.toLowerCase()] = {
						label:slice.name.toLowerCase(),
						x:slice.keys[0].bounds.x,
						y:slice.keys[0].bounds.y,
						w:slice.keys[0].bounds.w,
						h:slice.keys[0].bounds.h
					};
				});

				assets.requestAsset(aspr.meta.image).then((image) => {
					let atlas = new Atlas(
						aspr.frames.length,
						aspr.frames[0].frame.w,
						aspr.frames[0].frame.h,
						slices
					);
					atlas.init(image.content);
					cache[uri] = atlas;
					resolve(atlas);
				});
			});
		}
	});
}
