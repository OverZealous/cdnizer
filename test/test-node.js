/*global describe, it*/
"use strict";

require("should");
require("mocha");

module.exports = function(cdnizer, processInput) {
	describe('cdnizer: node modules tests', function() {
		it('should work with default node_modules', function() {
			processInput({
				files: [
					{
						file: 'js/**/react/react.js',
						package: 'react',
						cdn: '//cdn.example.com/react/${ major }.${ minor }.${ patch }/react.min.js'
					}
				]
			}, 'index-node.html', 'index-node-default.html');
		});
		it('should work with custom node_modules', function() {
			processInput({
				nodeModules: './test/fixtures/node_modules',
				files: [
					{
						file: 'js/**/react/react.js',
						package: 'react',
						cdn: '//cdn.example.com/react/${ major }.${ minor }.${ patch }/react.min.js'
					}
				]
			}, 'index-node.html', 'index-node-alt.html');
		});
	});
};
