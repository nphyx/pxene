"use strict";
/**
 * @module pxene.graphics.Atlas
 *
 * Contains the Atlas prototype.
 */
import * as assets from "../pxene.assets";
import {vectors} from "@nphyx/vectrix";

/** a cache of already processed Atlases **/
const cache = [];
/**
 * Much like a sprite, an atlas is a collection of smaller images on a single sheet.
 * An atlas may have non-uniform cell sizes, and is more suitable for static graphics.
 *
 * @todo Implement me
 */
export default function Atlas(layers, animations, slices) {
	this.layers = layers;
	this.animations = animations;
	this.slices = slices;
	this.source = undefined;
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
	this.source = image;
	let canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
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
	canvas.width = this.context.canvas.width;
	canvas.height = this.context.canvas.height;
	let context = canvas.getContext("2d");
	context.scale(-1, 1);
	let i, len, layer;
	// let's not create functions within loops
	let eachSlice = (key) => {
		let slice = this.slices[key];	
		let source = vectors.vec2(slice.pos);
		vectors.mut_plus(source, layer.frames[i].pos);
		context.drawImage(
			this.context.canvas,
			source[0], source[1],
			slice.dims[0], slice.dims[1],
			-source[0]-slice.dims[0], source[1],
			slice.dims[0], slice.dims[1]
		);

	}

	let eachLayer = (key) => {
		layer = this.layers[key];
		for(i = 0, len = layer.frames.length; i < len; ++i) {
			Object.keys(this.slices).filter(key => key !== "default").forEach(eachSlice);
		}
	}

	Object.keys(this.layers).forEach(eachLayer); 

	context.setTransform(1, 0, 0, 1, 0, 0);
	this.flippedContext = context;
}

/**
 * Draw a slice from the atlas to the given context.
 * @param {CanvasContext2d} dest the destination context
 * @param {string} name the name of the slice to draw
 * @param {vec2} pos the top left corner to start drawing at
 * @param {bool} flipped horizontal flip toggle (to reverse facing of image)
 * @param {Array} layers list of layers by name to draw
 */
Atlas.prototype.draw = function(dest, label, pos, flipped = false, layers = undefined) {
	let slice = (
			this.slices[label]?
			this.slices[label]:
			this.slices.default);
	let canvas = flipped?this.flippedContext.canvas:this.context.canvas;

	// draw all layers if a layer list isn't specified
	if(layers === undefined) layers = Object.keys(this.layers);
	layers.forEach(layer => {
		let source = vectors.vec2(slice.pos);
		//vectors.mut_plus(source, this.layers[layer].pos);
		vectors.mut_plus(source, this.layers[layer].frames[0].pos);
		dest.drawImage(
			canvas,
			source[0], source[1],
			slice.dims[0], slice.dims[1],
			pos[0], pos[1],
			slice.dims[0], slice.dims[1]
		);
	});
}

/**
 * Creates a new Atlas by combining into a single layer the listed layers, 
 * in the order supplied.
 * @param {Array} layers list of layers by label
 * @return {Atlas}
 *
 * @todo implement me
 */
Atlas.prototype.prebake = function prebake() {
	throw new Error("unimplemented");
}

/**
 * Create a new Atlas from an imported AsepriteAtlas. Returns a promise
 * which resolves with an atlas once it's ready to use.
 *
 * @todo a gulp module that exports with the correct options to make this work
 *
 * @param {string} uri a URI for an atlas JSON file
 * @return {Promise}
 */
Atlas.fromAsepriteAtlas = function fromAsepriteAtlas(uri) {
	/**
	 * uniq used below to filter unique tags, due to aseprite bug
	 * which creates duplicate entries
	 */
	//const uniq = (v, i, self) => self.indexOf(v) === i;
	return new Promise((resolve) => {
		if(cache[uri] !== undefined && cache[uri] instanceof Atlas) {
			resolve(cache[uri]);
		}
		else {
			console.log(assets);
			assets.requestAsset(uri).then((asset) => {
				let aspr = asset.content;
				let width = aspr.meta.size.w;
				let height = aspr.meta.size.h;
				let numLayers = aspr.meta.layers.length;
				let numFrames = aspr.frames.length / numLayers;
				let layerHeight = height / numLayers;

				// Hash of layers by name to be added to the Atlas
				let layers = {};
				let layerNames = [];

				aspr.meta.layers.forEach((l, i) => {
					layerNames.push(l.name);
					layers[l.name] = {
						label:l.name,
						opacity:l.opacity,
						blendMode:l.blendMode,
						pos:vectors.vec2(0, i * layerHeight),
						frames:[]
					}
				});

				// Hash of animations by name to be added to the Atlas
				let slices = {
					default:{
						label:"default",
						pos:vectors.vec2(0, 0),
						dims:vectors.vec2(width, height)
					}
				};

				aspr.meta.slices.forEach(s => {
					// as of v1.2.2, aseprite duplicates frame tags once per
					// layer but the data is always the same
					if(slices[s.name] === undefined) {
						slices[s.name] = {
							label:s.name,
							pos:vectors.vec2(s.keys[0].bounds.x, s.keys[0].bounds.y),
							dims:vectors.vec2(s.keys[0].bounds.w, s.keys[0].bounds.h)
						}
					}
				});

				// Hash of animations by name to be added to the Atlas
				let animations = {};

				aspr.meta.frameTags.forEach(f => {
					// as of v1.2.2, aseprite duplicates frame tags once per
					// layer but the data is always the same
					if(animations[f.name] === undefined) {
						animations[f.name] = {
							label:f.name,
							start:f.from,
							length:(f.to - f.from) + 1
						}
					}
				});

				aspr.frames.forEach((f, i) => {
					let layer = layers[layerNames[~~(i / numFrames)]];
					let frame = {
						label:f.name,
						pos:vectors.vec2(f.frame.x, f.frame.y),
						dims:vectors.vec2(f.frame.w, f.frame.h)
					}
					layer.frames.push(frame);
				});

				assets.requestAsset(aspr.meta.image).then((image) => {
					let atlas = new Atlas(
						layers,
						animations,
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
