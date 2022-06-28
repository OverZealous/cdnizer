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

		it('should not reproduce issue 29', function() {
			processInput({
				nodeModules: './test/fixtures/node_modules',
				files: [
					{
						file: '**/jquery/**',
						package: 'jquery',
						cdn: 'https://cdnjs.cloudflare.com/ajax/libs/${package}/${version}/${filenameMin}',
					}, {
						file: '**/lodash/**',
						package: 'lodash',
						cdn: 'https://cdn.jsdelivr.net/npm/${package}@${version}/${filenameMin}',
					}, {
						file: '**/backbone/**',
						package: 'backbone',
						cdn: 'https://cdnjs.cloudflare.com/ajax/libs/${package}/${version}/${filenameMin}',
					}, {
						file: '**/handlebars/**',
						package: 'handlebars',
						cdn: 'https://cdn.jsdelivr.net/npm/${package}@${version}/dist/handlebars.runtime.min.js',
					}
				]
			}, 'issue-29.html', 'issue-29.html');
		});
	});
};
