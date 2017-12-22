"use strict";
/*
//import {drawCircle} from "./pxene.display";
import {DEBUG} from "./pxene.constants";
import * as controls from "./controls";
const {max} = Math;

let ctx, uiBuffer;
let displayProps;

/**
 * Creates debug markers on screen to show the center, top, left, bottom, right, topleft
 * and topright extremes of the main game area.
 *
const debugMarkers = (function() {
	let w, h, wh, hh;
	return function debugMarkers() {
		w = displayProps.width;
		h = displayProps.height;
		wh = w/2; 
		hh = h/2;
		drawCircle(ctx,  0,  0, 4, "yellow", 1, "white");
		drawCircle(ctx, wh,  0, 4, "orange", 1, "white");
		drawCircle(ctx,  w,  0, 4, "red", 1, "white");
		drawCircle(ctx,  0, hh, 4, "white", 1, "white");
		drawCircle(ctx, wh, hh, 4, "gray", 1, "white");
		drawCircle(ctx,  w, hh, 4, "black", 1, "white");
		drawCircle(ctx,  0,  h, 4, "blue", 1, "white");
		drawCircle(ctx, wh,  h, 4, "cyan", 1, "white");
		drawCircle(ctx,  w,  h, 4, "green", 1, "white");
	}
})();

/**
 * Draws an edge button.
 *
function drawEdgeButton(ctx, x, y, w, h) {
	let halfButtonWidth = w*0.5;
	let buttonHeight = h;
	let cpXScale = w*0.122;
	let beginX = x-halfButtonWidth;
	let beginY = y;
	let topX = x;
	let topY = y-buttonHeight;
	let endX = x+halfButtonWidth;
	let endY = y;
	let aCPX = beginX + cpXScale;
	let aCPY = beginY - cpXScale;
	let bCPX = beginX + cpXScale;
	let bCPY = topY;
	let cCPX = endX - cpXScale;
	let cCPY = topY;
	let dCPX = endX - cpXScale;
	let dCPY = endY - cpXScale;
	let color = "rgba(255,255,255,0.1)";

	ctx.beginPath();
	ctx.moveTo(beginX, beginY);
	ctx.bezierCurveTo(aCPX, aCPY, bCPX, bCPY, topX, topY);
	ctx.bezierCurveTo(cCPX, cCPY, dCPX, dCPY, endX, endY);
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.lineWidth = 4;
	ctx.fill();
	ctx.closePath();
}

/**
 * Draws UI elements.
 *
export function draw() {
	let w = displayProps.width;
	let h = displayProps.height;
	let bw = max(100, w*0.1);
	let bh = max(47,  w*0.047);
	let {move, down} = controls.pointer;
	ctx.clearRect(0, 0, w, h);
	drawEdgeButton(ctx, w*0.5, h, bw, bh);
	drawEdgeButton(ctx, w*0.333, h, bw, bh); 
	drawEdgeButton(ctx, w*0.666, h, bw, bh);  
	drawCircle(ctx, move[0], move[1], 5, "white");
	if(controls.buttons[0]) {
		ctx.beginPath();
		ctx.moveTo(down[0], down[1]);
		ctx.lineTo(move[0], move[1]);
		ctx.strokeStyle = "white";
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.closePath();
	}
	if(DEBUG) debugMarkers();
}

/**
 * Initializes the UI submodule.
 * @param {DrawBuffer} buffer
 *
export function init(buffer, props) {
	displayProps = props;
	uiBuffer = buffer;
	updateProps();
	displayProps.events.on("resize", updateProps);
	ctx = uiBuffer.context;
}

function updateProps() {
	uiBuffer.width = displayProps.width;
	uiBuffer.height = displayProps.height;
}
*/
