/*global describe, it*/
"use strict";

require("should");
require("mocha");

module.exports = function(cdnizer, processInput) {
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
				bowerComponents: './test/fixtures/bower_components',
				files: [
					{
						file: 'js/**/angular/angular.js',
						package: 'angular',
						cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }/angular.min.js'
					}
				]
			}, 'index.html', 'index-bower.html');
		});

		it("should revert to dot-bower-packages", function() {
			processInput([
				{
					file: 'js/**/bad-pkg.js',
					package: 'no-bower-version',
					cdn: '//cdn/bad-pkg/${ version }/bad-pkg.js'
				}
			], 'bad-bower-pkg.html', 'bad-bower-pkg.html')
		});

		it("should throw on no bower version", function() {
			(function() {
				processInput([
					{
						file: 'js/**/bad-pkg.js',
						package: 'no-dot-bower-version',
						cdn: '//cdn/bad-pkg/${ version }/bad-pkg.js'
					}
				], 'bad-bower-pkg.html', 'bad-bower-pkg.html')
			}).should.throw();
		});
	});
};
