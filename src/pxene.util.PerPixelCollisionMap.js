"use strict";
const {floor} = Math;
/**
 * PerPixelCollision data creates a map of non-transparent regions in an image.
 */
export default function PerPixelCollisionMap(context, threshold = 0) {
	let {width, height} = context.canvas;
	this.data_row_width = Math.ceil(width/8); // square away the dimensions
	this.height = height;
	try {
		this.data = new Int8Array(this.data_row_width * height);
	}
	catch(e) {
		throw new Error("CollisionData:failed to allocate memory for collision data :(");
	}
	let pixels;
	for(let y = 0; y < height; ++y) {
		// go one row at a time with the image data for sanity/memory use
		try {
			pixels = context.getImageData(0, y, width, 1).data;
		}
		catch(e) {
			throw new Error("CollisionData:failed to get image data :(");
		}
		for(let i = 0; i < pixels.length; i+=4) {
			let x = i / 4;
			if(pixels[i+3] > threshold) this.setPixel(x, y);
			//this.data[p] |= (pixels[i+3] > threshold)?(1 << mod):0;
		}
	}
	return this;
}

PerPixelCollisionMap.prototype.indexOf = function indexOf(x, y) {
	return ((y * this.data_row_width) + floor(x/8));
}

PerPixelCollisionMap.prototype.xModOf = function xModOf(x) {
	return x % 8;
}

PerPixelCollisionMap.prototype.clearPixel = function clearPixel(x, y) {
	this.data[this.indexOf(x,y)] ^= (1 << this.xModOf(x));
}

PerPixelCollisionMap.prototype.setPixel = function setPixel(x, y) {
	this.data[this.indexOf(x,y)] |= (1 << this.xModOf(x));
}

PerPixelCollisionMap.prototype.checkPixel = function checkPixel(x, y) {
	return (this.data[this.indexOf(x,y)] & (1 << this.xModOf(x)))?1:0;
}

PerPixelCollisionMap.prototype.checkRect = function checkRect(x, y, w, h) {
	let sum = 0;
	for(let cx = x; cx < x + w; ++cx) {
		for(let cy = y; cy < y + h; ++cy) {
			sum += this.checkPixel(cx, cy);
		}
	}
	return sum;
}
