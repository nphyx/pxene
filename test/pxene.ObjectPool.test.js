"use strict";
import ObjectPool from "../src/pxene.ObjectPool";
require("should");

function TestPoolObject() {
	this.istrue = true;
	this.nottrue = false;
	this.string = "";
}

TestPoolObject.prototype.init = function init(string, flipped = false)  {
	this.string = string;
	if(flipped) {
		this.istrue = false;
		this.nottrue = true;
	}
}

TestPoolObject.prototype.recycle = function recycle() {
	this.istrue = true;
	this.nottrue = false;
	this.string = "";
}

function makeTestPool() {
	return new ObjectPool(() => new TestPoolObject());
}

describe("ObjectPool", function() {
	it("should correctly use the factory function it's initialized with", function() {
		let pool = makeTestPool();
		let obj = pool.allocate();
		(obj instanceof TestPoolObject).should.be.True();
	});
	it("should seal objects it allocates", function() {
		let pool = makeTestPool();
		let obj = pool.allocate();
		Object.isSealed(obj).should.be.True();
	});
	it("should free and reallocate objects", function() {
		let pool = makeTestPool();
		let obj = pool.allocate();
		pool.free(obj);
		let obj2 = pool.allocate();
		(obj === obj2).should.be.True();
	});
	it("should create new objects when it runs out of freed objects", function() {
		let pool = makeTestPool();
		let obj = pool.allocate();
		pool.free(obj);
		let obj2 = pool.allocate();
		let obj3 = pool.allocate();
		(obj3 !== obj2).should.be.True();
	});
	it("should have recycled an object while freeing it", function() {
		let pool = makeTestPool();
		let obj = pool.allocate();
		obj.nottrue = true;
		obj.istrue = false;
		obj.string = "foo";
		pool.free(obj);
		obj.istrue.should.be.True();
		obj.nottrue.should.be.False();
		obj.string.should.eql("");
	});
	it("should initialize an object when the object has an init function", function() {
		let pool = makeTestPool();
		let obj = pool.allocate("bar");
		obj.string.should.eql("bar");
		// multiple params, just to make sure we didn't screw up the rest parameter
		pool.free(obj);
		obj = pool.allocate("baz", true);
		obj.string.should.eql("baz");
		obj.istrue.should.be.False();
		obj.nottrue.should.be.True();
	});
	it("should complain when asked to free an object it doesn't own", function() {
		let pool = makeTestPool();
		(() => pool.free({})).should.throwError();
	});
	it("should track total, available, and used objects correctly", function() {
		let pool = makeTestPool();
		let obj = pool.allocate();
		pool.length.should.eql(1);
		pool.available.should.eql(0);
		pool.used.should.eql(1);
		pool.free(obj);
		pool.length.should.eql(1);
		pool.available.should.eql(1);
		pool.used.should.eql(0);
		obj = pool.allocate(obj);
		pool.length.should.eql(1);
		pool.available.should.eql(0);
		pool.used.should.eql(1);

		let obj2 = pool.allocate();
		pool.length.should.eql(2);
		pool.available.should.eql(0);
		pool.used.should.eql(2);
		pool.free(obj);
		pool.length.should.eql(2);
		pool.available.should.eql(1);
		pool.used.should.eql(1);
		pool.free(obj2);
		pool.length.should.eql(2);
		pool.available.should.eql(2);
		pool.used.should.eql(0);
		obj = pool.allocate();
		pool.length.should.eql(2);
		pool.available.should.eql(1);
		pool.used.should.eql(1);
		obj2 = pool.allocate();
		pool.length.should.eql(2);
		pool.available.should.eql(0);
		pool.used.should.eql(2);
	});
	it("should preallocate a requested number of objects and handle them normally", function() {
		let pool = makeTestPool();
		pool.preAllocate(10);
		pool.length.should.eql(10);
		pool.available.should.eql(10);
		let obj = pool.allocate();
		pool.length.should.eql(10);
		pool.available.should.eql(9);
		pool.used.should.eql(1);
		pool.free(obj);
		pool.length.should.eql(10);
		pool.available.should.eql(10);
		pool.used.should.eql(0);
	});
});
