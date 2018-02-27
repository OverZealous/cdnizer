/*global describe, it*/
"use strict";

require("should");
require("mocha");

module.exports = function(cdnizer, processInput) {
	describe("cdnizer: cdn-data", function() {

		it("should handle known google-cdn-data", function() {
			processInput({
				files: [
					'google:jquery@1.0.0',
					'google:angular'
				]
			}, 'index-cdn-data.html', 'index-cdn-data-google.html');
		});

		it("should handle known cdnjs-cdn-data", function() {
			processInput({
				files: [
					{
						cdn: 'cdnjs:angular.js',
						package: 'angular'
					}
				]
			}, 'index-cdn-data.html', 'index-cdn-data-cdnjs.html');
		});

		it("should handle known jsdelivr-cdn-data", function() {
			processInput({
				files: [
					'jsdelivr:dojo@1.2.3'
				]
			}, 'index-cdn-data.html', 'index-cdn-data-jsdelivr.html');
		});

		it("should handle cdns with custom filenames", function() {
			processInput({
				files: [
					{
						file: 'js/vendor/custom/jquery-ui-foo.js',
						cdn: 'google:jquery-ui@4.4.4'
					}
				]
			}, 'index-cdn-data.html', 'index-cdn-data-filename.html');
		});

		it("should handle cdn data with alternate files", function() {
			processInput({
				files: [
					'cdnjs:angular.js',
					'cdnjs:angular.js:angular-touch.min.js',
					'cdnjs:angular.js:i18n/angular-locale_fr-fr.js'
				]
			}, 'index-cdn-data-alt.html', 'index-cdn-data-alt.html');
		});

		it("should handle cdn data with alternate files, automated", function() {
			processInput({
				files: [
					{
						file: 'js/vendor/angular/*.js',
						cdn: 'cdnjs:angular.js:${ filenameMin }'
					},
					{
						file: 'js/vendor/angular/i18n/*.js',
						cdn: 'cdnjs:angular.js:i18n/${ filename }'
					}
				]
			}, 'index-cdn-data-alt.html', 'index-cdn-data-alt.html');
		});

		it("should ignore protocols (colons) in custom cdns", function() {
			processInput({
				files: ['css/main.css', 'js/**/*.js'],
				defaultCDNBase: 'http://examplecdn/'
			}, 'index.html', 'index-generic-with-protocol.html');
		});

	});
};
