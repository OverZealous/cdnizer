#!/usr/bin/env node

'use strict';

var fs = require('fs'),
	nomnom = require('nomnom'),
	cdnizerFactory = require('../index');

var cliOptions = nomnom.options({
	files: {
		position: 0,
		list: true,
		help: 'File(s) to cdnize, otherwise use stdin'
	},
	config: {
		abbr: 'c',
		required: true,
		help: 'Use config file'
	}
}).parse();

function main () {
	var configFile = cliOptions.config,
		config = fs.readFileSync(configFile, 'utf8'),
		options = JSON.parse(config),
		cdnizer = cdnizerFactory(options),
		sources = [];

	if (cliOptions.files) {
		sources = cliOptions.files.map(function (v) {return fs.readFileSync(v, 'utf8');}).map(function (v) {return cdnizer(v);});
		sources.forEach(function (v) {console.log(v);});
	}
	else {
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function (chunk) {sources += chunk.toString('utf8');});
		process.stdin.on('end', function () {console.log(cdnizer(sources));});
	}
}

main();
