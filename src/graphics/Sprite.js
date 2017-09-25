"use strict";
import * as assets from "../pxene.assets";
/**
 * @module pxene.graphics.Sprite
 *
 * Contains the Sprite prototype, as well as the internally managed sprite cache.
 */
let cache = [];

/**
 * An image subdivided into individual cells suitable for character animations. The
 * Sprite object manages data related to the location of individual animations, and
 * drawing of individual cells to an external canvas.
 */
export default function Sprite(frameCount, frameWidth, frameHeight, animations) {
	this.frameCount = frameCount;
	this.frameWidth = frameWidth;
	this.frameHeight = frameHeight;
	this.animations = animations;
	this.spriteCanvas = undefined;
	this.flippedCanvas = undefined;
	this.ready = false;
	// below calculated during generateComposite
	this.width = 0; 
	this.height = 0;
	this.rows = 0;
	this.columns = 0;
	return Object.seal(this);
}

/**
 * Initializes the sprite with an image, copying it to the sprite's internal
 * canvas.
 * @param {Image} image a loaded Image element
 * @param {bool} flipped whether to generate a horizontally flipped version (default: true)
 */
Sprite.prototype.init = function init(image, flipped = true) {
	let canvas = document.createElement("canvas");
	canvas.width = this.width = image.width;
	canvas.height = this.height = image.height;
	this.columns = canvas.width / this.frameWidth;
	this.rows = canvas.height / this.frameHeight;
	let context = canvas.getContext("2d");
	context.drawImage(image, 0, 0);
	if(flipped) this.generateFlipped();
	this.ready = true;
	this.spriteCanvas = canvas;
}


/**
 * Generates a horizontally flipped version of the sprite with all the cells
 * at the same indexes. Normally run during {@link init} but can be called
 * manually if init was instructed not to create the flipped version.
 */
Sprite.prototype.generateFlipped = function generateFlipped() {
	let canvas = document.createElement("canvas");
	canvas.width = this.width;
	canvas.height = this.height;
	let context = canvas.getContext("2d");
	let row, col, sx, sy, dx, dy;
	let rows = this.rows;
	let cols = this.cols;
	let w = this.frameWidth;
	let h = this.frameHeight;

	context.scale(-1, 1);
	for(row = 0, rows = this.rows; row < rows; ++row) {
		for(col = 0, cols = this.columns; col < cols; ++col) {
			sx = col * w;
			dx = sx; //((cols - col) * w) - w;
			sy = dy = row * h;
			context.drawImage(this.spriteCanvas, sx, sy, w, h, -sx-w, dy, w, h);
		}
	}
	context.setTransform(1, 0, 0, 1, 0, 0);
	this.flippedCanvas = canvas;
}

/**
 * Draws a sprite frame from a given animation set, or the default animation
 * if the specified animation is incorrect.
 * @param {string} name the name of the animation to play
 * @param {int} frame the frame number to display
 * @param {CanvasRenderingContext2D} context a context to draw to
 * @param {vec2} pos the top left corner from which to start drawing
 * @param {bool} flip horizontal flip toggle (to reverse facing of sprite)
 */
Sprite.prototype.animate = function animate(name, frame, context, pos, flip = false) {
	let animation = (
			this.animations[name]?
			this.animations[name]:
			this.animations.default);
	let frameNum = animation.startFrame + (frame % animation.length);
	let {frameWidth, frameHeight} = this;
	context.drawImage(
		flip?this.flippedCanvas:this.spriteCanvas, 
		getX(this, frameNum), getY(this, frameNum),
		frameWidth, frameHeight,
		pos[0], pos[1], 
		frameWidth, frameHeight);
}

/**
 * Figures out the x offset for a frame based on the frame number and the sprite's parameters.
 */
function getX(sprite, frameNum) {
	return (frameNum % sprite.columns) * sprite.frameWidth;
}

/**
 * Figures out the x offset for a frame based on the frame number and the sprite's parameters.
 */
function getY(sprite, frameNum) {
	return Math.floor(frameNum / sprite.columns) * sprite.frameHeight;
}

/**
 * Create a new Sprite from an imported AsepriteAtlas. Returns a promise
 * which resolves with a sprite once it's ready to use.
 *
 * @param {string} uri a URI for an atlas JSON file
 * @return {Promise}
 */
Sprite.fromAsepriteAtlas = function fromAsepriteAtlas(uri) {
	return new Promise((resolve) => {
		if(cache[uri] !== undefined && cache[uri] instanceof Sprite) {
			resolve(cache[uri]);
		}
		else assets.requestAsset(uri)
		.then((asset) => {
			let aspr = asset.content;
			let animations = {
				default:{
				label:"default",
				startFrame:0,
				length:1
				}
			}

			if(aspr.meta.frameTags) aspr.meta.frameTags.forEach((anim) => {
				animations[anim.name.toLowerCase()] = {
					label:anim.name.toLowerCase(),
					startFrame:anim.from,
					length:(anim.to - anim.from) + 1
				};
			});

			assets.requestAsset(aspr.meta.image).then((image) => {
				let sprite = new Sprite(
					aspr.frames.length,
					aspr.frames[0].frame.w,
					aspr.frames[0].frame.h,
					animations
				);
				sprite.init(image.content);
				cache[uri] = sprite;
				resolve(sprite);
			});
		});
	});
}
