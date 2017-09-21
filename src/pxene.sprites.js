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
	return new Promise((resolve) => {
		assets.requestAsset(uri)
		.then((res) => {
			console.log(res);
			return loadFromAsepriteAtlas(res);
		})
		.then((sprite) => {
			console.log(sprite);
			spriteList[uri] = sprite;
			resolve(sprite);
		});
	});
}

/**
 * Converts an aseprite atlas to a sprite object.
 * May need to be complexified later to deal with non-uniform sprite sheets.
 */
function loadFromAsepriteAtlas(asset) {
	console.log("loadFromAsepriteAtlas", asset);
	let aspr = asset.content;
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

	return new Promise((resolve) => {
		assets.requestAsset(aspr.meta.image).then((image) => {
			let sprite = new Sprite(
				aspr.frames.length,
				aspr.frames[0].frame.w,
				aspr.frames[0].frame.h,
				animations
			);
			sprite.generateComposite([image.content]);
			sprite.generateFlipped();
			resolve(sprite);
		});
	});
}
