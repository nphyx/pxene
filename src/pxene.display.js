"use strict";
import * as buffers from "./pxene.display.buffers";
import * as events from "./pxene.events";
import * as ui from "./pxene.display.ui";
export {buffers, ui};
import * as constants from "./pxene.constants";
import {evenNumber} from "./pxene.util";
let {min, max} = Math;
let AUTO_FULLSCREEN = false;

let startTime; // time game started
let interval = 0;
let frameCount = 0; // running total of drawn frames
let animating = false; // whether the game is currently running animation loop
let container; // display container 
let fullscreen = false; // whether the game is in fullscreen mode
let lastFrame = 0;
let frameCallback;
const bufferList = [];
export const buffersByLabel = {};
let compositeBuffer;

export const displayProps = {
	width:0,
	height:0,
	orientation:0,
	aspect:0,
	minDimension:0,
	maxDimension:0,
	events:new events.Events()
}

/**
 * Using this checks and avoids altering the canvas context state machine if unnecessary,
 * which theoretically saves a little time.
 */
export function updateCompositeOperation(ctx, op) {
	if(ctx.globalCompositeOperation !== op) ctx.globalCompositeOperation = op;
}

/**
 * Toggles fullscreen on.
 * Code from Mozilla Developer Network.
 */
function toggleFullScreen() {
	if(fullscreen) return;
	fullscreen = true;
  if(!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && 
			!document.webkitFullscreenElement && 
			!document.msFullscreenElement) {  // current working methods
    if(document.documentElement.requestFullscreen)
			document.documentElement.requestFullscreen();
    else if (document.documentElement.msRequestFullscreen)
      document.documentElement.msRequestFullscreen();
    else if (document.documentElement.mozRequestFullScreen)
      document.documentElement.mozRequestFullScreen();
    else if (document.documentElement.webkitRequestFullscreen)
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		displayProps.events.fire("fullscreen-on");
  } 
	else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
		displayProps.events.fire("fullscreen-off");
  }
}

/**
 * Turns fullscreen off.
 */
function fullscreenOff(ev) {
	ev.preventDefault();
	if(document.webkitIsFullScreen || 
	   document.mozIsFullScreen || 
		 document.msIsFullScreen) fullscreen = true;
	else fullscreen = false;
	return false;
}

/**
 * Updates screen ratio.
 */
function updateProperties() {
	compositeBuffer.width  = displayProps.width  = evenNumber(document.body.clientWidth);
	compositeBuffer.height = displayProps.height = evenNumber(document.body.clientHeight);
	displayProps.orientation = displayProps.width > displayProps.height?0:1;
	displayProps.minDimension = min(displayProps.width, displayProps.height);
	displayProps.maxDimension = max(displayProps.width, displayProps.height);
	displayProps.events.fire("resize");
	bufferList.forEach(buffer => {
		buffer.canvas.width = displayProps.width;
		buffer.canvas.height = displayProps.height;
	});
}


/**
 * Main animation loop.
 */
function animate() {
	requestAnimationFrame(animate);
	let now = Date.now();
	let elapsed = now - lastFrame;
	if(elapsed > interval) {
		lastFrame = now - (elapsed % interval);
		frameCount++;
		frameCallback(buffersByLabel, elapsed, frameCount);
		buffers.composite(bufferList, compositeBuffer, displayProps);
	}
}

function initBuffers(bufferDescriptions) {
	for(let i = 0, len = bufferDescriptions.length; i < len; ++i) {
		let bufData = bufferDescriptions[i];
		let buffer = new buffers.DrawBuffer(bufData.compositeMethod, bufData.scaleMethod);
		buffer.id = bufData.label;
		bufferList.push(buffer);
		buffersByLabel[bufData.label] = buffer;
	}
}

/**
 * Initializes game environment.
 */
export function init(config) {
	container = document.querySelector(config.container);
	container.classList.add("2d");
	compositeBuffer = new buffers.CompositeBuffer(container);
	container.width = compositeBuffer.width  = evenNumber(container.clientWidth);
	container.height = compositeBuffer.height = evenNumber(container.clientHeight);
	initBuffers(config.bufferDescriptions);
	updateProperties();
	frameCallback = config.frameCallback;
	window.addEventListener("resize", updateProperties);
	AUTO_FULLSCREEN = config.fullscreen;
	if(AUTO_FULLSCREEN) {
		container.addEventListener("click", toggleFullScreen);
		document.addEventListener("fullscreenchange", fullscreenOff);
		document.addEventListener("mozfullscreenchange", fullscreenOff);
		document.addEventListener("msfullscreenchange", fullscreenOff);
		document.addEventListener("webkitfullscreenchange", fullscreenOff);
	}
	startTime = Date.now();
	lastFrame = startTime;
	interval = 1000 / constants.TARGET_FPS;
	if(!animating) requestAnimationFrame(animate);
	animating = true;
}
