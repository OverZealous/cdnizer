/*global describe, it*/
"use strict";

require("should");
require("mocha");

module.exports = function(cdnizer, processInput) {
	describe("cdnizer: error handling", function() {

		it("should error on no input", function() {
			(function() {
				cdnizer();
			}).should.throw();
			(function() {
				cdnizer([]);
			}).should.throw();
			(function() {
				cdnizer({});
			}).should.throw();
			(function() {
				cdnizer({ files: [] });
			}).should.throw();
		});

		it("should error on invalid input", function() {
			(function() {
				cdnizer(9);
			}).should.throw();
			(function() {
				cdnizer(null);
			}).should.throw();
			(function() {
				cdnizer({ files: 31 });
			}).should.throw();
			(function() {
				cdnizer({ files: null });
			}).should.throw();
			(function() {
				cdnizer({ files: {} });
			}).should.throw();
		});

		it("should error on invalid files", function() {
			(function() {
				cdnizer({ files: [{ file: 9 }] });
			}).should.throw();
			(function() {
				cdnizer({ files: [{ file: new Date() }] });
			}).should.throw();
			(function() {
				cdnizer({ files: ['/not/invalid', { file: new Date() }] });
			}).should.throw();
		});

	});
};
