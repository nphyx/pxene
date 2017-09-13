"use strict";


/**
 * Draws a colored circle.
 */
export function drawCircle(ctx, x, y, size, fillStyle, lineWidth = 0, strokeStyle = undefined) {
	ctx.globalCompositeOperation = "source-over";
	ctx.beginPath();
	ctx.arc(x, y, size, 2 * Math.PI, false);
	ctx.fillStyle = fillStyle;
	ctx.fill();
	if(strokeStyle) {
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	}
	ctx.closePath();
}
