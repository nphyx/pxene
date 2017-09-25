"use strict";
/**
 * An offscreen draw buffer, which will be drawn to a composite buffer for display
 * onscreen.
 * @param {string} compositeMethod globalCompositeMethod to use when compositing
 * @param {bool} scaleMethod method for scaling (see SCALE_* constants)
 * @param {string} context [2d|webGL]
 * @return {DrawBuffer}
 */
const {min} = Math;
export const SCALE_STRETCH = 0;
export const SCALE_KEEP_ASPECT = 1;
export const SCALE_NONE = 2;
export const SCALE_CROP = 3;
export function DrawBuffer(compositeMethod = "source-over", scaleMethod = SCALE_STRETCH, context = "2d") {
	this.canvas = document.createElement("canvas");
	this.context = this.canvas.getContext(context);
	this.offsetX = 0;
	this.offsetY = 0;
	this.compositeMethod = compositeMethod;
	this.scaleMethod = scaleMethod;
	Object.defineProperties(this, {
		width:{get:() => this.canvas.width, set:(v) => this.canvas.width = v},
		height:{get:() => this.canvas.height, set:(v) => this.canvas.height = v},
	});
	return this;
}

/**
 * A canvas to draw a BufferGroup into.
 * @param {HTMLElement} container the containing element for the canvas
 * @return {CompositeBuffer}
 */
export function CompositeBuffer(container) {
	this.canvas = document.createElement("canvas");
	this.context = this.canvas.getContext("2d");
	this.container = container;
	this.container.appendChild(this.canvas);
	Object.defineProperties(this, {
		width:{get:() => this.canvas.width, set:(v) => this.canvas.width = v},
		height:{get:() => this.canvas.height, set:(v) => this.canvas.height = v},
	});
	return this;
}

export const composite = (function() {
	let i, len, sourceBuffer, targetContext;
	let sw, sh, sx, sy, dw, dh, dx, dy;
	return function composite(sourceBuffers, targetBuffer, displayProps) {
		targetContext = targetBuffer.context;
		// if using a pixel ratio, assume it's for pixel art and don't screw it up
		if(displayProps.pixelRatio !== 1) targetContext.imageSmoothingEnabled = false;
		for(i = 0, len = sourceBuffers.length; i < len; ++i) {
			sourceBuffer = sourceBuffers[i];
			if(targetContext.globalCompositeOperation !== sourceBuffer.compositeMethod)
				targetContext.globalCompositeOperation = sourceBuffer.compositeMethod;
			switch(sourceBuffer.scaleMethod) {
				case SCALE_STRETCH:
					sx = 0; sy = 0; sw = sourceBuffer.width; sh = sourceBuffer.height;
					dx = sourceBuffer.offsetX; dy = sourceBuffer.offsetY; 
					dw = targetBuffer.width; dh = targetBuffer.height;
				break;
				case SCALE_KEEP_ASPECT:
					sx = 0; sy = 0; sw = sourceBuffer.width; sh = sourceBuffer.height;
					dx = sourceBuffer.offsetX; dy = sourceBuffer.offsetY; 
					dw = targetBuffer.width; dh = targetBuffer.height;
					if(displayProps.orientation) {
						sw = targetBuffer.width;
						sh = min(targetBuffer.height, sourceBuffer.height);
						dw = min(targetBuffer.width, sourceBuffer.width);
						dh = targetBuffer.height;
					}
					else {
						sw = min(targetBuffer.width, sourceBuffer.width);
						sh = targetBuffer.height;
						dw = targetBuffer.width;
						dh = min(targetBuffer.height, sourceBuffer.height);
					}
				break;
				case SCALE_CROP:
					sx = 0; sy = 0; 
					sw = min(targetBuffer.width - sourceBuffer.offsetX, sourceBuffer.width);
					sh = min(targetBuffer.height - sourceBuffer.offsetY, sourceBuffer.height);
					dx = sourceBuffer.offsetX; dy = sourceBuffer.offsetY; 
					dw = min(targetBuffer.width - sourceBuffer.offsetX, sourceBuffer.width);
					dh = min(targetBuffer.height - sourceBuffer.offsetY, sourceBuffer.height);
				break;
				default: // SCALE_NONE
					sx = 0; sy = 0; sw = sourceBuffer.width; sh = sourceBuffer.height;
					dx = sourceBuffer.offsetX; dy = sourceBuffer.offsetY; 
					dw = sourceBuffer.width*displayProps.pixelRatio; dh = sourceBuffer.height*displayProps.pixelRatio;
				break;
			}
			targetContext.drawImage(sourceBuffer.canvas, sx, sy, sw, sh, dx, dy, dw, dh); 
		}
	}
})();
