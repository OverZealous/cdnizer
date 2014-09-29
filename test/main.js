/*global describe, it*/
"use strict";

//noinspection JSUnusedGlobalSymbols
var should = require("should"),
	fs = require("fs");

require("mocha");

delete require.cache[require.resolve("../")];

var cdnizer = require("../");

function processInput(opts, fixtureFileName, expectedFileName) {
	var converter = cdnizer(opts),
		srcFile = fs.readFileSync("test/fixtures/"+fixtureFileName, "utf8"),
		expected = fs.readFileSync("test/expected/"+expectedFileName, "utf8"),
		result = converter(srcFile);

	//noinspection BadExpressionStatementJS
	result.should.not.be.empty;

	result.should.equal(expected);
}

describe("cdnizer: basic input", function() {

	it("should not modify a file if no matches", function() {
		processInput(['/no/match'], 'index.html', 'index-none.html');
	});

	it("should modify on basic input", function() {
		processInput({
			files: ['css/main.css', 'js/**/*.js'],
			defaultCDNBase: '//examplecdn/'
		}, 'index.html', 'index-generic.html');
	});

	it("should handle varied input", function() {
		processInput({
			files: ['css/*.css', 'js/**/*.js'],
			defaultCDNBase: '//examplecdn'
		}, 'index.html', 'index-generic.html');
	});

	it("should handle existing min and fallbacks", function() {
		processInput({
			files: [
				{
					file: 'js/**/angular/angular.js',
					test: "window['angular']"
				}
			],
			defaultCDNBase: '//examplecdn'
		}, 'index.html', 'index-fallback.html');
	});

	it("should add min with filenameMin", function() {
		processInput({
			files: [
				{
					file: 'js/**/firebase/firebase.js',
					cdn: '//examplecdn/js/vendor/firebase/${ filenameMin }'
				}
			]
		}, 'index.html', 'index-filename-min.html');
	});

	it("should use custom matchers with an object", function() {
		processInput({
			files: ['img/**/*.jpg'],
			defaultCDNBase: '//examplecdn',
			matchers: [
				{ pattern: /(<img\s.*?data-src=["'])(.+?)(["'].*?>)/gi, fallback: false }
			]
		}, 'index.html', 'index-data-src.html');
	});

	it("should use custom matchers with just a regular expression", function() {
		processInput({
			files: ['img/**/*.jpg'],
			defaultCDNBase: '//examplecdn',
			matchers: [ /(<img\s.*?data-src=["'])(.+?)(["'].*?>)/gi ]
		}, 'index.html', 'index-data-src.html');
	});

	it("should handle HTML without quoted attributes", function() {
		processInput({
			files: ['img/**/*.jpg', 'css/**/*.css', 'js/**/*.js'],
			defaultCDNBase: '//examplecdn'
		}, 'index.min.html', 'index-without-quotes.html')
	});

	it("should correctly handle other attributes within tags", function() {
		// NOTE: matchers are purposefully over-eager in their pattern matching,
		// to encourage re-processing of the same tag if it matches more than once!
		processInput({
			files: ['**/*.jpg', '**/*.css', '**/*.js'],
			defaultCDNBase: '//examplecdn'
		}, 'index-attribs.html', 'index-attribs.html')
	});
});

describe("cdnizer: bower tests", function() {

	it("should handle bower versions (.bowerrc)", function() {
		processInput({
			files: [
				{
					file: 'js/**/angular/angular.js',
					package: 'angular',
					cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ version }/angular.min.js'
				}
			]
		}, 'index.html', 'index-bowerrc.html');
	});

	it("should handle bower versions (passed in)", function() {
		processInput({
			bowerComponents: './test/bower_components',
			files: [
				{
					file: 'js/**/angular/angular.js',
					package: 'angular',
					cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }/angular.min.js'
				}
			]
		}, 'index.html', 'index-bower.html');
	});
});

describe("cdnizer: css files", function() {

	it("should handle css files (no modification)", function() {
		processInput(['/no/match'], 'style.css', 'style-none.css');
	});

	it("should handle css files and relative roots", function() {
		processInput({
			defaultCDNBase: '//examplecdn',
			relativeRoot: 'style',
			files: [ '**/*.{gif,png,jpg,jpeg}' ]
		}, 'style.css', 'style-generic.css');
	});
});

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


describe("cdnizer: error handling", function() {

	it("should error on no input", function() {
		(function(){
			cdnizer();
		}).should.throw();
		(function(){
			cdnizer([]);
		}).should.throw();
		(function(){
			cdnizer({});
		}).should.throw();
		(function(){
			cdnizer({files:[]});
		}).should.throw();
	});

	it("should error on invalid input", function() {
		(function(){
			cdnizer(9);
		}).should.throw();
		(function(){
			cdnizer(null);
		}).should.throw();
		(function(){
			cdnizer({files:31});
		}).should.throw();
		(function(){
			cdnizer({files:null});
		}).should.throw();
		(function(){
			cdnizer({files:{}});
		}).should.throw();
	});

	it("should error on invalid files", function() {
		(function(){
			cdnizer({files:[{file:9}]});
		}).should.throw();
		(function(){
			cdnizer({files:[{file:new Date()}]});
		}).should.throw();
		(function(){
			cdnizer({files:['/not/invalid', {file:new Date()}]});
		}).should.throw();
	});

});
