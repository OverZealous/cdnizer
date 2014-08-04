var path = require('path');

var knownCDNs = [ 'google', 'cdnjs', 'jsdelivr' ],
	packageMaps = {
		'angular.js': 'angular',
		'angularjs': 'angular',
		'backbone.js': 'backbone',
		'backbonejs': 'backbone',
		'ember.js': 'ember',
		'emberjs': 'ember',
		'prototypejs': 'prototype'
	},
	packageTests = {
		'angular': 'angular',
		'backbone': 'Backbone',
		'dojo': 'dojo',
		'ember': 'Ember',
		'jquery': 'jQuery',
		'jquery-ui': 'jQuery.ui',
		'lodash': '_',
		'mootools': 'MooTools',
		'prototype': 'Prototype',
		'react': 'React',
		'swfobject': 'swfobject',
		'underscore': '_'
	},
	versionString = '${ version }';

module.exports.get = function getCDNData(pattern) {
	var ret = { file: pattern };
	var cdn = pattern.split(':')[0],
		pkg = pattern.split(':')[1],
		version = false;
	if(pkg.indexOf('@') > -1) {
		version = pkg.split('@')[1];
		pkg = pkg.split('@')[0];
	}
	if(pkg.length > 0 && knownCDNs.indexOf(cdn) !== -1) {
		// load cdn-data package
		var cdnData = require(cdn + '-cdn-data');
		if(cdnData[pkg]) {
			// Great! Let's build some default data
			ret.cdn = cdnData[pkg].url(versionString);
			ret.file = path.join('**', ret.cdn.split(versionString)[1]).replace(/\.min\./, '.');
			ret.package = packageMaps[pkg] || pkg;
			if(packageTests[ret.package]) {
				ret.test = packageTests[ret.package];
			}
			if(version) {
				ret.version = version;
			}
		}
	}
	return ret;
};

module.exports.configure = function configure(opts) {
	if(opts.cdnDataLibraries) {
		knownCDNs.push.apply(knownCDNs, opts.cdnDataLibraries);
	}
};