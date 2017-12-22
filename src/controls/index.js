"use strict";
//import {flatten} from "../pxene.util";
import KeyState from "./KeyState";
import KeyMap from "./KeyMap";

const state = [
];

const keyMaps = {
}

/**
 * Flattens an array. 
 * @function flatten
 * @param {mixed} a an array, array-like, or object that can be flattened
 * @return {mixed} flat version of input
 */
export function flatten(a) {
	// cheap array-like check, may not always be reliable
	if(a instanceof Object && typeof a.length == "number") {
		let i = 0, len = a.length, out = [];
		for(;i < len; ++i) {
			out = out.concat(flatten(a[i]));
		}
		return out;
	}
	else return a;
}


/**
 * Maps a label to one or more keys.
 * @example
 * ```javascript
 * let forward = pxene.controls.map("forward", "d", "rightArrow");
 * ```
 * @param {string} label a label for the keymap
 * @param {string|Array} ...keys a list of keys to map
 * @return {KeyMap}
 */
export function map(label, ...keys) {
	const map = getOrInitMap(label);
	keys = flatten(keys);
	keys.forEach(key => {
		const ks = getOrInitKeyState(key);
		if(map.keys.indexOf(ks) == -1) map.keys.push(ks)
	});
	return map;
}

/**
 * Removes a key mapping, returning the modified {@link KeyMap}.
 * @param {string} label the key map's label
 * @param {string} key the [key name]{@link KeyState} to remove
 * @return {KeyMap|undefined} undefined if the KeyMap for the label didn't exist
 */
export function unmap(label, key) {
	if(keyMaps[label]) {
		let index = keyMaps[label].keys.indexOf(lookupKeyState(key));
		if(index) keyMaps.keys.splice(index, 1);
	}
	return keyMaps[label];
}

/**
 * Finds a keyState by [key name]{@link KeyMap}, initializing a new one if necessary.
 * @param {string} key the key name
 * @return {KeyState}
 */
function getOrInitKeyState(key) {
	key = key.toLowerCase();
	let ks = lookupKeyState(key);
	if(ks === undefined) {
		ks = new KeyState(key);
		state.push(ks);
	}
	return ks;
}

/**
 * Finds a keyMap by label, initializing a new one if necessary.
 * @param {string} label the keymap label
 * @return {KeyMap}
 */
function getOrInitMap(label) {
	let mapped = lookupMap(label);
	if(mapped === undefined) {
		mapped = new KeyMap(label);
		keyMaps[label] = mapped;
	}
	return mapped;
}

/**
 * Looks up a KeyMap by label.
 * @param {string} label the keymap label
 * @return {KeyMap|undefined}
 */
export function lookupMap(label) {
	return keyMaps[label];
}

/**
 * Looks up a KeyState by [key name]{@link KeyState}.
 */
export function lookupKeyState(key) {
	key = key.toLowerCase();
	return state.filter(ks => ks.key === key)[0]
}

/**
 * Handles keydown & mousedown events.
 */
function down(ev) {
	const time = Date.now();
	if(ev instanceof MouseEvent) {
		const ks = lookupKeyState("mouse"+ev.button);
		if(ks && ks.lastUp >= ks.lastDown) { // ignore key repeats
			ks.down = true;
			ks.lastDown = time; 
		}
	}
	else if(ev instanceof KeyboardEvent) {
		/* global KeyboardEvent */
		const ks = lookupKeyState(ev.key);
		if(ks && ks.lastUp >= ks.lastDown) { // ignore key repeats
			ks.down = true;
			ks.lastDown = time; 
		}
	}
}

/**
 * Handles keyup & mouseup events.
 */
function up(ev) {
	const time = Date.now();
	if(ev instanceof MouseEvent) {
		const ks = lookupKeyState("mouse"+ev.button);
		if(ks) {
			ks.down = false;
			ks.lastUp = time;
		}
	}
	else if(ev instanceof KeyboardEvent) {
		const ks = lookupKeyState(ev.key);
		if(ks) {
			ks.down = false;
			ks.lastUp = time;
		}
	}
}

/**
 * When the window blurs we lose track of key events, so toggle all keys off.
 */
function blur() {
	const time = Date.now();
	state.forEach(ks => {
		ks.down = false;
		ks.lastUp = time;
	});
}

const cursor_pos = new Float32Array(2);
function updateCursorState(ev) {
	cursor_pos[0] = ev.clientX;
	cursor_pos[1] = ev.clientY;
}

export function getCursorPosition() {
	return Float32Array.of(cursor_pos[0], cursor_pos[1]);
}

export function init() {
	window.addEventListener("keydown", down); 
	window.addEventListener("keyup", up); 
	window.addEventListener("mousedown", down); 
	window.addEventListener("mouseup", up); 
	window.addEventListener("blur", blur);
	window.addEventListener("mousemove", updateCursorState);
}
