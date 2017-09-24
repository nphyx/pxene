"use strict";
/**
 * @module ObjectPool
 * Simple auto-expanding object pool.
 */

/**
 * A simple object pool, which expands itself automatically when needed but
 * prefers to recycle objects when available.  *
 * The factory function passed as a parameter should generate uniform objects, 
 * even though the factory pattern suggests a factory can produce made-to-purpose 
 * objects. The point of accepting a factory rather than a constructor is only to 
 * support programming styles that prefer not to use constructors or classes.
 *
 * Objects created by the pool will be [sealed]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal}
 * to enforce the uniformity requirement externally.
 *
 * Objects in the pool may support a recyle() method, which cleans up an object
 * and readies it for reuse, as well as an init() function, which allows pass-
 * through support for {@link ObjectPool.prototype.allocate()} parameters.
 *
 * @param {function} factory a function that returns one pool object
 */

export default function ObjectPool(factory) {
	const pool = [];
	const freed = [];

	/**
	 * Allocate an item from the pool (either recycled or new as available).
	 * Parameters are passed through to the init() method of the pool object
	 * if it has one.
	 */
	this.allocate = function allocate(...args) {
		let obj;
		if(freed.length) obj = freed.pop();
		else {
			obj = Object.seal(factory());
			pool.push(obj);
		}
		if(typeof(obj.init) === "function") obj.init.apply(obj, args);
		return obj;
	}

	/**
	 * Free an object for reuse. If the object has a recycle() method, it will
	 * be called during this operation.
	 */
	this.free = function free(obj) {
		if(pool.indexOf(obj) > -1) {
			if(typeof(obj.recycle) === "function") obj.recycle();
			freed.push(obj);
		}
		else throw new Error("free called with non-pool-member");
	}

	/**
	 * Pre-allocate a bunch of objects if you want to have some available
	 * ahead of time.
	 */
	this.preAllocate = function(n) {
		let obj;
		for(let i = 0; i < n; ++i) {
			obj = factory();
			pool.push(obj);
			freed.push(obj);
		}
	}

	Object.defineProperties(this, {
		length:{get:() => pool.length},
		available:{get:() => freed.length},
		used:{get:() => pool.length - freed.length}
	});

	return Object.freeze(this);
}
