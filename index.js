var path = require('path'),
	_ = require('lodash'),
	util = require('./lib/util'),
	parseOptions = require('./lib/parseOptions'),

	// Used to reset lodash to default template settings
	lodashTemplateSettings = {
		evaluate: _.templateSettings.evaluate,
		interpolate: _.templateSettings.interpolate,
		escape: _.templateSettings.escape
	};

function makeCdnizer(opts) {
	"use strict";

	opts = parseOptions(opts);

	function cdnizer(contents) {

		var canAddFallback = opts.shouldAddFallback && contents.indexOf('<head') !== -1,
			didAddFallback = false;

		_.union(opts.matchers, util.matchers).forEach(function(m) {
			contents = contents.replace(m.pattern, function(match, pre, url, post) {
				var fileInfo = util.findFileInfo(url, opts), result, params;
				if(fileInfo) {
					result = pre;
					params = _.merge(util.getVersionInfo(fileInfo, opts), {
						defaultCDNBase: opts.defaultCDNBase,
						filepath: url,
						// the split/join is to fix Windows idiotic backward paths.
						filepathRel: path.join(opts.relativeRoot, url).split(path.sep).join('/').replace(/^\//, ''),
						filename: path.basename(url),
						filenameMin: util.getFilenameMin(url, opts),
						package: fileInfo.package,
						test: fileInfo.test
					});
					result += _.template(fileInfo.cdn || opts.defaultCDN, params, lodashTemplateSettings);
					result += post;
					if(canAddFallback && m.fallback && fileInfo.test) {
						result += _.template(opts.fallbackTest, params, lodashTemplateSettings);
						didAddFallback = true;
					}
					return result;
				} else {
					// do nothing
					return match;
				}
			});
		});

		if(didAddFallback) {
			contents = contents.replace(/<link|<script|<\/head/i, function(m) {
				return opts.fallbackScript + m;
			});
		}

		return contents;
	}

	return cdnizer;
}

module.exports = makeCdnizer;
