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
	let i, len, buffer, targetContext;
	let sw, sh, sx, sy, dw, dh, dx, dy;
	return function composite(sourceBuffers, targetBuffer, displayProps) {
		targetContext = targetBuffer.context;
		for(i = 0, len = sourceBuffers.length; i < len; ++i) {
			buffer = sourceBuffers[i];
			if(targetContext.globalCompositeOperation !== buffer.compositeMethod)
				targetContext.globalCompositeOperation = buffer.compositeMethod;
			switch(buffer.scaleMethod) {
				case SCALE_STRETCH:
					sx = 0; sy = 0; sw = buffer.width; sh = buffer.height;
					dx = buffer.offsetX; dy = buffer.offsetY; 
					dw = targetBuffer.width; dh = targetBuffer.height;
				break;
				case SCALE_KEEP_ASPECT:
					sx = 0; sy = 0; sw = buffer.width; sh = buffer.height;
					dx = buffer.offsetX; dy = buffer.offsetY; 
					dw = targetBuffer.width; dh = targetBuffer.height;
					if(displayProps.orientation) {
						sw = targetBuffer.width;
						sh = min(targetBuffer.height, buffer.height);
						dw = min(targetBuffer.width, buffer.width);
						dh = targetBuffer.height;
					}
					else {
						sw = min(targetBuffer.width, buffer.width);
						sh = targetBuffer.height;
						dw = targetBuffer.width;
						dh = min(targetBuffer.height, buffer.height);
					}
				break;
				default: // SCALE_NONE
					sx = 0; sy = 0; sw = buffer.width; sh = buffer.height;
					dx = buffer.offsetX; dy = buffer.offsetY; 
					dw = buffer.width; dh = buffer.height;
				break;
			}
			targetContext.drawImage(buffer.canvas, sx, sy, sw, sh, dx, dy, dw, dh); 
		}
	}
})();
