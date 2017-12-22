"use strict";
import * as util from "./pxene.display.util.js";
import * as buffers from "./pxene.display.buffers";
import * as events from "./pxene.events";
import * as ui from "./pxene.display.ui";
export {buffers, ui, util};
import * as constants from "./pxene.constants";
//import {evenNumber} from "./pxene.util";
let {min, max} = Math;
let AUTO_FULLSCREEN = false;

let startTime; // time game started
let interval = 0;
let elapsed = 0;
let frameCount = 0; // running total of drawn frames
let animating = false; // whether the game is currently running animation loop
let container; // display container 
let fullscreen = false; // whether the game is in fullscreen mode
let lastFrame = 0;
let frameCallback;
const bufferList = [];
export const buffersByLabel = {};
let compositeBuffer;

/**
 * Round to nearest even number.
 */
export function evenNumber(n) {
return n >> 1 << 1;
}

export const props = {
	width:0,
	height:0,
	pixelRatio:1,
	orientation:0,
	aspect:0,
	minDimension:0,
	maxDimension:0,
	events:new events.Events()
}

export const timing = {
	get frameCount() {return frameCount},
	get startTime() {return startTime},
	get lastFrame() {return lastFrame},
	get elapsed() {return elapsed},
	get interval() {return interval}
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
		props.events.fire("fullscreen-on");
  } 
	else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
		props.events.fire("fullscreen-off");
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
	compositeBuffer.width  = props.width  = evenNumber(container.clientWidth);
	compositeBuffer.height = props.height = evenNumber(container.clientHeight);
	props.orientation = props.width > props.height?0:1;
	props.minDimension = min(props.width, props.height);
	props.maxDimension = max(props.width, props.height);
	// @todo review this, it probably needs better handling
	bufferList.forEach(buffer => {
		buffer.width = ~~(props.width/props.pixelRatio);
		buffer.height = ~~(props.height/props.pixelRatio);
	});
	props.events.fire("resize");
}


/**
 * Main animation loop.
 */
function animate() {
	requestAnimationFrame(animate);
	try {
		let now = Date.now();
			elapsed = now - lastFrame;
			if(elapsed > interval) {
				lastFrame = now - (elapsed % interval);
				frameCount++;
				frameCallback(buffersByLabel);
				buffers.composite(bufferList, compositeBuffer, props);
			}
		}
	catch(e) {
		console.error("Crappy uncaught error in animation loop is crappy");
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
	props.pixelRatio = config.pixelRatio || props.pixelRatio;
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
