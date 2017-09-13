"use strict";

const state = [
];

function lookup(key) {
	key = key.toLowerCase();
	return state.filter(ks => ks.key === key)[0]
}

function initKeyState(key) {
	return {
		key:key,
		down:false,
		lastDown:0,
		lastUp:0
	}
}

function getOrInit(key) {
	key = key.toLowerCase();
	let ks = lookup(key);
	if(ks === undefined) {
		ks = initKeyState(key);
		state.push(ks);
	}
	return ks;
}

/**
 * Handle keydown event.
 */
function down(ev) {
	const time = Date.now();
	const ks = getOrInit(ev.key);
	ks.down = true;
	ks.lastDown = time; 
}

/**
 * Handle keyup event.
 */
function up(ev) {
	const time = Date.now();
	const ks = getOrInit(ev.key);
	ks.down = false;
	ks.lastUp = time;
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

export function getKeyState(key) {
	return lookup(key) || initKeyState(key)
}

export function init() {
	window.addEventListener("keydown", down); 
	window.addEventListener("keyup", up); 
	window.addEventListener("blur", blur);
}
