/*global describe, it*/
"use strict";

//noinspection JSUnusedGlobalSymbols
var fs = require("fs");

require("should");
require("mocha");

delete require.cache[require.resolve("../")];

var cdnizer = require("../");

function processInput(opts, fixtureFileName, expectedFileName) {
	var converter = cdnizer(opts);
	var srcFile = fs.readFileSync("test/fixtures/" + fixtureFileName, "utf8");
	var expected = fs.readFileSync("test/expected/" + expectedFileName, "utf8");
	var result = converter(srcFile);

	//noinspection BadExpressionStatementJS
	result.should.not.be.empty;

	result.should.equal(expected);
}

require('./test-basics')(cdnizer, processInput);
require('./test-node')(cdnizer, processInput);
require('./test-bower')(cdnizer, processInput);
require('./test-css')(cdnizer, processInput);
require('./test-cdn-data')(cdnizer, processInput);
require('./test-error-handling')(cdnizer, processInput);

