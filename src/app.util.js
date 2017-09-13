"use strict";
import {VALIDATE_VECTORS, GRAVITY} from "./app.constants";
import {vectors} from "@nphyx/vectrix/src/vectrix";
const {minus,mut_clamp,mut_times,mut_normalize,magnitude,vec2} = vectors;
const {sqrt, abs} = Math.sqrt;
const MIN_F = 1e-11;
const MAX_F = 1e+11;

/**
 * Round to nearest even number.
 */
export function evenNumber(n) {
return n >> 1 << 1;
}

/**
 * Clamp the absolute value of a number, keeping its sign.
 */
function limit(v, min_v = 0, max_v = Infinity) {
	if(abs(v) < abs(min_v)) {
		if(v < 0) v = -min_v;
		else v = min_v;
	}
	else if(abs(v) > abs(max_v)) {
		if(v < 0) v = -max_v;
		else v = max_v;
	}
	return v;
}

/**
 * Limits absolute values of vectors within a range.
 */
export const limitVecMut = (function() {
	let i = 0|0, l = 0|0;
	return function limitVecMut(v, min_v = 0, max_v = Infinity) {	
		for(i = 0, l = v.length; i < l; ++i) {
			v[i] = limit(v[i], min_v, max_v);
		}
	}
})();

/**
 * Validates a vector. For debugging purposes.
 */
export const validate = (function() {
	let i, l;
	return function validate(v) {
		for(i = 0, l = v.length; i < l; i++) {
			if(isNaN(v[i])) throw new Error("NaN vector");
			if(v[i] === Infinity) throw new Error("Infinite vector");
			if(v[i] === -Infinity) throw new Error("-Infinite vector");
		}
	}
})();

/**
 * Gravitate toward target.
 */
export const gravitate = (function() {
	let g_v = vec2();
	let mag = 0.0, x = 0.0, y = 0.0, scale = 0.0;
	return function gravitate(p1, p2, strength, out) {
		out = out||g_v;
		minus(p1, p2, out);
		mag = magnitude(out);
		// inline normalize for speed, since this happens a lot
		x = out[0];
		y = out[1];
		if((x === 0 && y === 0) || mag === 0) return out;
		scale = mut_clamp(1/sqrt((x*x)+(y*y)), MIN_F, MAX_F);
		strength = mut_clamp(strength, -MAX_F, MAX_F);
		out[0] = x*scale;
		out[1] = y*scale;
		//mut_normalize(out);
		mut_times(out, -strength*GRAVITY/(mag*mag));
		if(VALIDATE_VECTORS) {
			try {
				validate(out);
			}
			catch(e) {
				console.log("gravitation error", e);
				console.log(strength);
				minus(p1, p2, out);
				console.log("minus", out);
				limitVecMut(out, 0.00001, 10); // put a cap on it to avoid infinite acceleration
				console.log("limit", out);
				mag = magnitude(out);
				console.log("magnitude", mag);
				mut_normalize(out);
				console.log("normalize", out);
				mut_times(out, -strength/(mag*mag));
				console.log("scale", out);
				out.fill(0.0);
			}
		}
		return out;
	}
})();

/**
 * Accelerate toward a target.
 */
export const accelerate = (function() {
	let v = vec2();
	let scale = 0.0, x = 0.0, y = 0.0;
	return function accelerate(p1, p2, strength, out) {
		out = out||v;	
		minus(p1, p2, out);
		x = out[0];
		y = out[1];
		if(x === 0 && y === 0) return out;
		scale = mut_clamp(1/sqrt((x*x)+(y*y)), MIN_F, MAX_F);
		strength = mut_clamp(strength, -MAX_F, MAX_F);
		// inline normalize for speed, since this happens a lot
		out[0] = x*scale;
		out[1] = y*scale;
		//mut_normalize(out);
		mut_times(out, -strength);
		if(VALIDATE_VECTORS) {
			try {
				validate(out);
			}
			catch(e) {
				console.log("acceleration error", e);
				console.log("strength", strength);
				minus(p1, p2, out);
				console.log("minus", out);
				mut_normalize(out);
				console.log("normalize", out);
				mut_times(out, -strength);
				console.log("scale", out);
				out.fill(0.0);
			}
		}
		return out;
	}
})();

/**
 * Checks if entity is out of screen space by more than 50%.
 */
export function offscreen(x, y, displayProps) {
	return (
		x < (displayProps.width  * -0.5) || x >displayProps.width   * 1.5 ||
		y < (displayProps.height * -0.5) || y > displayProps.height * 1.5
	)
}

/**
 * Calculates the screenspace pixel offset of a coordinate from the [-1,1] coordinate
 * range used in game position vectors.
 */
export function screenSpace(x, displayProps) {
	return ((x+1)/2) * displayProps.minDimension;
}

/**
 * Finds the screen space equivalent of the game space vector v.
 * @param {vec2} v game space vector
 * @param {vec2} out out parameter
 * @return {out}
 */

export function screenSpaceVec(v, displayProps, out) {
	out[0] = (((v[0]+1)/2)*displayProps.minDimension);
	out[1] = (((v[1]+1)/2)*displayProps.minDimension);
	return out;
}

/**
 * Finds the game space equivalent of the sceen space vector v.
 * @param {vec2} v game space vector
 * @param {vec2} out out parameter
 * @return {out}
 */
export function gameSpaceVec(v, displayProps, out) {
	out[0] = 2*((v[0])/displayProps.minDimension)-1;
	out[1] = 2*((v[1])/displayProps.minDimension)-1;
}
