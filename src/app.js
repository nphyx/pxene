"use strict";
import * as display from "./app.display";
import * as game from "./app.game";
import * as controls from "./app.controls";

const config = {
	container:"body",
	bufferList:[
	],
	frameCallback:undefined
}

/**
 * Called every frame.
 */
function main(buffers, elapsed/*, frameCount*/) {
	game.tick(elapsed, controls);
}

/**
 * Starts up the game.
 */
export function startGame() {
/*
	GAME_STARTED = true;
	game.start();
	body.removeEventListener("click", startGame);
	body.classList.remove("start");
	if(AUTO_FULLSCREEN) toggleFullScreen();
	console.log("game started");
	*/
}

window.addEventListener("load", function() {
	config.frameCallback = main;
	display.init(config);
	game.init();
	controls.init();
	window.app = {
		display,
		game,
		controls
	}
});
