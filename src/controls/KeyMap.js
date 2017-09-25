"use strict";
/**
 * @module pxene.controls.KeyMap
 * contains the KeyMap prototype.
 */

/**
 * Data type for handling mappings of keys to control labels.
 * @example
 * ```javascript
 * let jump = pxene.controls.map("jump", "space");
 * jump.down(); // true or false depending on whether the spacebar is down
 * pxene.controls.map("jump", "esc");
 * jump.isDown(); // true if either space or esc are down 
 * jump.lastDown(); // most recent time either space or esc were pressed down
 * jump.LastUp(); // most recent time either space or esc were released
 * jump.unmap("esc"); // now jump only pays attention to spacebar
 *
 * // The controls module keeps track of your control mappings, so you don't
 * // have to worry about losing them. Once you've created the "jump" label
 * // above you can always look it up later:
 * let jump = pxene.controls.lookupMap("jump");
 * ```
 * @param {String} label the label for the mapping
 * @return KeyMap object
 */
export default function KeyMap(label) {
	label = label.toLowerCase();
	this.label = label;
	this.keys = [];
	this.checkedDown = 0;
	this.checkedUp = 0;
	return Object.seal(this);
}

KeyMap.prototype.lastDown = function lastDown() {
	return this.keys.reduce((p, c) => p = (p > c.lastDown?p:c.lastDown), 0);
}

KeyMap.prototype.lastUp = function lastUp() {
	return this.keys.reduce((p, c) => p = (p > c.lastDown?p:c.lastDown), 0);
}

KeyMap.prototype.isDown = function isDown() {
	return this.keys.reduce((p, c) => p = p || c.down, false);
}

KeyMap.prototype.onceDown = function onceDown() {
	if(this.lastUp() >= this.checkedDown && this.isDown()) {
		this.checkedDown = Date.now();
		return true;
	}
	return false;
}

KeyMap.prototype.onceUp = function onceUp() {
	if(this.lastDown() >= this.checkedUp && !this.isDown()) {
		this.checkedUp = Date.now();
		return true;
	}
	return false;
}
