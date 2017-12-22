"use strict";
/**
 * @module pxene.BooleanArray
 */

/**
 * A BooleanArray is a TypedArray-like implementation for integer-indexed
 * boolean fields. It lets you store a set of boolean values in an arraybuffer,
 * which allows for better potential memory use in circumstances where you need
 * to set more than 2 booleans on a single data set\*, and potentially slightly
 * better performance (though probably not significantly).
 *
 * It's probably not incredibly useful in most circumstances, but when you have
 * an object with a bunch of boolean flags and you're going to make a bunch of
 * that kind of object it might come in handy.
 *
 * In short, if you don't know whether you need this you almost certainly don't.
 *
 * *_most sources indicate a boolean occupies 4 bytes of javascript memory due 
 * to storage and indexing overhead. In contrast, a BooleanArray can store up 
 * to 8 booleans in around the same amount of memory (and the proportionate 
 * savings grow the more booleans you have to store, since an arraybuffer
 * has a small fixed overhead)._
 */
const internalArray = Symbol();

export default function BooleanArray() {
	if((arguments[0] instanceof ArrayBuffer) && (typeof arguments[1] === "number") && (typeof arguments[2] === "number")) {
			this[internalArray] = new Uint8Array(arguments[0], arguments[1], Math.ceil(arguments[2]/8));
			this.length = arguments[2];
	}
	else if(typeof arguments[0] === "number") {
		this[internalArray] = new Uint8Array(Math.ceil(arguments[0]/8));
		this.length = arguments[0];
	}
	else throw Error("expected either length or buffer, offset, length as arguments");
	Object.freeze(this);
	return this;
}

/**
 * Gets a boolean by index.
 */
BooleanArray.prototype.get = function get(n) {
	if(n > this.length) return undefined;
	let i = ~~(n/8);
	let s = n % 8;
	return (this[internalArray][i] & (1 << s))?true:false;
}

/**
 * Sets an index to the truthiness of the given value.
 * @param {int} n index to set
 * @param {truthy|falsy} v value to set
 */
BooleanArray.prototype.set = function set(n, v) {
	if(n > this.length) return;
	let i = ~~(n/8);
	let s = n % 8;
	if(v) { // any kind of truthy is ok!
		this[internalArray][i] |= 1 << s;
	}
	else {
		this[internalArray][i] &= 255 ^ (1 << s);
	}
}

/**
 * Fill the array with a value.
 * @param {truthy|falsy} v
 */
BooleanArray.prototype.fill = function(v) {
	this[internalArray].fill(v?255:0);
}

/**
 * For useful compatibility with {@link pxene.ObjectPool}.
 */
BooleanArray.prototype.recycle = function() {
	this[internalArray].fill(0);
}

/**
 * Same as Array.forEach.
 * Accepts a callback function in the form of:
 * function(currentElement, currentIndex, SelfArray)
 *
 * @param {function} callback a callback function
 */
BooleanArray.prototype.forEach = function(callback) {
	let set = 0, externalIndex = 0, i = 0, k = 0, len, 
		  alen = this.length;
	for(len = this[internalArray].length; i < len; ++i) {
		externalIndex = i * 8;
		set = this[internalArray][i];
		for(k = 0; k < 8 && externalIndex + k < alen; ++k) {
			callback((set & (1 << k))?true:false, externalIndex + k, this);
		}
	}
}
