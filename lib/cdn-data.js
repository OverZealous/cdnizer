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
		'angular': 'window.angular',
		'backbone': 'window.Backbone',
		'dojo': 'window.dojo',
		'ember': 'window.Ember',
		'jquery': 'window.jQuery',
		'jquery-ui': 'window.jQuery && window.jQuery.ui',
		'lodash': 'window._',
		'mootools': 'window.MooTools',
		'prototype': 'window.Prototype',
		'react': 'window.React',
		'swfobject': 'window.swfobject',
		'underscore': 'window._'
	},
	versionString = '${ version }';

module.exports.get = function getCDNData(pattern) {
	var ret = { file: pattern };
	if(pattern.indexOf(':') === -1) {
		return ret;
	}
	var patternParts = pattern.match(/([^:]+)\:([^:@]+)(?::([^@]+))?(?:@(.+))?/);
	if(patternParts) {
		var cdn = patternParts[1],
			pkg = patternParts[2],
			filename = patternParts[3] || false,
			version = patternParts[4] || false,
			url;

		if(knownCDNs.indexOf(cdn) !== -1) {
			// load cdn-data package
			var cdnData = require(cdn + '-cdn-data');
			if(cdnData[pkg]) {
				// Great! Let's build some default data
				url = cdnData[pkg].url(versionString);
				if(filename) {
					url = url.split(versionString)[0] + versionString + '/' + filename;
				}
				ret._foundCdn = true;
				ret.cdn = url;
				// fix Windows backward paths
				ret.file = path.join('**', ret.cdn.split(versionString)[1]).replace(/\.min\./, '.').split(path.sep).join('/');
				ret.package = packageMaps[pkg] || pkg;
				if(packageTests[ret.package]) {
					ret.test = packageTests[ret.package];
				}
				if(version) {
					ret.version = version;
				}
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
