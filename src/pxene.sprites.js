"use strict";
import * as assets from "./pxene.assets";
import Sprite from "./pxene.sprites.Sprite";

export {Sprite};

export const spriteList = {
}

export function get(uri) {
	return spriteList[uri];
}

export function importAsepriteAtlas(uri) {
	return new Promise(resolve => {
		assets.getAsset(uri).then(item => {
			let sprite = convertAsepriteAtlas(item.content);
			spriteList[uri] = sprite;
			sprite.load().then(resolve);
		});
	});
}

/**
 * Converts an aseprite atlas to a sprite object.
 * May need to be complexified later to deal with non-uniform sprite sheets.
 */
function convertAsepriteAtlas(aspr) {
	let animations = {
		default:{
		label:"default",
		startFrame:0,
		length:1
		}
	};

	if(aspr.meta.frameTags) aspr.meta.frameTags.forEach((anim) => {
		animations[anim.name.toLowerCase()] = {
			label:anim.name.toLowerCase(),
			startFrame:anim.from,
			length:(anim.to - anim.from) + 1
		};
	});

	return new Sprite(	
		aspr.frames.length,
		aspr.frames[0].frame.w,
		aspr.frames[0].frame.h,
		animations,
		aspr.meta.image
	);
}
