/*global describe, it*/
"use strict";

require("should");
require("mocha");

module.exports = function(cdnizer, processInput) {
	describe("cdnizer: css files", function() {

		it("should handle css files (no modification)", function() {
			processInput(['/no/match'], 'style.css', 'style-none.css');
		});

		it("should handle css files and relative roots", function() {
			processInput({
				defaultCDNBase: '//examplecdn',
				relativeRoot: 'style',
				files: ['**/*.{gif,png,jpg,jpeg}']
			}, 'style.css', 'style-generic.css');
		});
	});
};
