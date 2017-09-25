"use strict";
/**
 * @module pxene.graphics.CompositeSprite
 *
 * Contains the CompositeSprite prototype.
 */
export default function CompositeSprite() {
	return this;
}

/**
 * Generates a composite sprite from the image list the sprite was loaded with.
 */
CompositeSprite.prototype.init = function init(sprites) {
	let canvas = document.createElement("canvas");
	canvas.width = this.width = sprites[0].width;
	canvas.height = this.height = sprites[0].height;
	this.columns = canvas.width / this.frameWidth;
	this.rows = canvas.height / this.frameHeight;
	let context = canvas.getContext("2d");
	for(let i = 0, len = sprites.length; i < len; ++i) {
		context.drawImage(sprites[i], 0, 0);
	}
	this.ready = true;
	this.spriteCanvas = canvas;
}
