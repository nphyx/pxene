"use strict";
/**
 * @module pxene.graphics.BitmapFont
 *
 * Contains the BitmapFont prototype.
 */

/**
 * A bitmap font is a fixed-size font contained in a single bitmap image, 
 * similar to a Sprite or Atlas. The BitmapFont object manages loading the font
 * and writing text to a canvas using the font.
 * @todo implement me
 */
export default function BitmapFont() {
	return this;
}

/**
 * Initializes the font with an image.
 * @param {Image} image a loaded Image element
 */
BitmapFont.prototype.init = function(image) {
}

/**
 * Draws text to canvas.
 * @param {string} text text contents to write
 * @param {CanvasContext2d} target canvas context to write to
 * @param {int} sx start x-coordinate
 * @param {int} sy start y-coordinate
 * @param {int} wl wrap length in pixels
 * @param {int} lh space between lines in pixels (optional, default 1)
 * @param {int}	ls letter spacing in pixels (optional, default 1) 
 */
BitmapFont.prototype.write = function(text, target, sx, sy, lw, ls = 1) {
}
