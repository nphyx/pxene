"use strict";
require("should");
import BooleanArray from "../src/pxene.BooleanArray.js";

describe("BooleanArray", function() {
	it("should create a BooleanArray of a given length", function() {
		let ba = new BooleanArray(9);
		(ba instanceof BooleanArray).should.be.True();
		ba.length.should.eql(16);
		ba = new BooleanArray(1);
		ba.length.should.eql(8);
		ba = new BooleanArray(14);
		ba.length.should.eql(16);
	});
	it("should accept an ArrayBuffer, ByteOffset, and length as alternate parameters", function() {
		let ab = new ArrayBuffer(2);
		let ba;
		(() => ba = new BooleanArray(ab, 0, ab.length * 8)).should.not.throwError();
		(ba instanceof BooleanArray).should.be.True();
		(() => new BooleanArray(new ArrayBuffer(2), 1, 8)).should.not.throwError();
	});
	it("should complain when given a bad set of parameters", function() {
		(() => new BooleanArray("foo")).should.throwError();
		(() => new BooleanArray(new ArrayBuffer(1))).should.throwError();
		(() => new BooleanArray(new ArrayBuffer(1), 0, 9)).should.throwError();
		(() => new BooleanArray(new ArrayBuffer(2), 1, 9)).should.throwError();
	});
	it("should get and set boolean values at given indexes", function() {
		const len = 17;
		const compare = Array(len);
		compare.fill(false);
		let ba = new BooleanArray(len);
		let i, j;
		for(i = 0; i < len; ++i) {
			ba.set(i, true);
			compare[i] = true;
			for(j = 0; j < len; ++j) {
				ba.get(j).should.eql(compare[j]);
			}
		}
		// now in reverse
		for(i = 0; i < len; ++i) {
			ba.set(i, false);
			compare[i] = false;
			for(j = 0; j < len; ++j) {
				ba.get(j).should.eql(compare[j]);
			}
		}
	});
	it("should fill itself with truth or falsity when instructed", function() {
		const len = 5;
		let ba = new BooleanArray(len);
		ba.fill(true);
		for(let i = 0; i < len; ++i) ba.get(i).should.be.True();
		ba.fill(false);
		for(let i = 0; i < len; ++i) ba.get(i).should.be.False();
	});
	it("should reset its values to false when recycled", function() {
		const len = 13;
		let ba = new BooleanArray(len);
		ba.fill(true);
		ba.recycle();
		for(let i = 0; i < len; ++i) ba.get(i).should.be.False();
	});
});
