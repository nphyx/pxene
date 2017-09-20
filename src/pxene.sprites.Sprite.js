"use strict";
import * as assets from "./pxene.assets";

/**
 * Sprite object handles spritely stuff.
 */
export default function Sprite(frameCount, frameWidth, frameHeight, animations, imageURI) {
	this.frameCount = frameCount;
	this.frameWidth = frameWidth;
	this.frameHeight = frameHeight;
	this.rows = 0; // calculated on image load
	this.columns = 0; // calculated on image load
	this.animations = animations;
	this.imageURI = imageURI;
	this.image = undefined;
	this.ready = false;
	return this;
}

Sprite.prototype.generateFlipped = function generateFlipped() {
	let canvas = document.createElement("canvas");
	canvas.width = this.image.width;
	canvas.height = this.image.height;
	let context = canvas.getContext("2d");
	this.flipped = canvas;
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
			context.drawImage(this.image, sx, sy, w, h, -sx-w, dy, w, h);
		}
	}
	context.setTransform(1, 0, 0, 1, 0, 0);
}

Sprite.prototype.load = function load() {
	if(!this.ready) {
		return new Promise(resolve => {
			assets.getAsset(this.imageURI).then(image => {
				this.ready = true;
				this.image = image.content;
				this.columns = image.content.width / this.frameWidth;
				this.rows = image.content.height / this.frameHeight;
				this.generateFlipped();
				resolve(this);
			});
		});
	}
	else return new Promise.resolve(this);
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
		flip?this.flipped:this.image, 
		getX(this, frameNum), getY(this, frameNum),
		frameWidth, frameHeight,
		pos[0], pos[1], 
		frameWidth, frameHeight);
}

function getX(sprite, frameNum) {
	return (frameNum % sprite.columns) * sprite.frameWidth;
}

function getY(sprite, frameNum) {
	return Math.floor(frameNum / sprite.columns) * sprite.frameHeight;
}
