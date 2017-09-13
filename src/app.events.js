"use strict";

export function Events() {
	this.queue = {};
	return this;
}

Events.prototype.on = function(event, callback) {
	if(this.queue[event] === undefined) this.queue[event] = [];
	this.queue[event].push(callback);
}

Events.prototype.fire = (function() {
	let i, len;
	return function(event, params) {
		if(this.queue[event] === undefined) return;
		for(i = 0, len = this.queue[event].length; i < len; ++i) {
			this.queue[event][i].call(params);
		}
	}
})();
