"use strict";
/**
 * @module pxene.controls.KeyState
 * contains the KeyState prototype.
 */

/**
 * Data type for tracking the state of a single key.
 * @param {string} key key name, as defined in [KeyboardEvent.key]{@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values}
 * @return {KeyState}
 */
export default function KeyState(key) {
	this.key = key;
	this.down = false;
	this.lastDown = 0;
	this.lastUp = 0;
	return Object.seal(this);
}
