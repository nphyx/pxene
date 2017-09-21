"use strict";
//import * as assets from "./pxene.assets";

/**
 * Sprite object handles spritely stuff.
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
 * Generates a composite sprite from the image list the sprite was loadedw with.
 */
Sprite.prototype.generateComposite = function generateComposite(imageList) {
	let canvas = document.createElement("canvas");
	canvas.width = this.width = imageList[0].width;
	canvas.height = this.height = imageList[0].height;
	this.columns = canvas.width / this.frameWidth;
	this.rows = canvas.height / this.frameHeight;
	let context = canvas.getContext("2d");
	for(let i = 0, len = imageList.length; i < len; ++i) {
		context.drawImage(imageList[i], 0, 0);
	}
	this.ready = true;
	this.spriteCanvas = canvas;
}

/**
 * Generates a horizontally flipped version of the sprite with all the cells at the same indexes.
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
