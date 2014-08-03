var path = require('path'),
	_ = require('lodash'),
	merge = require('deepmerge'),
	util = require('./lib/util'),
	parseOptions = require('./lib/parseOptions');

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
					params = merge(util.getVersionInfo(fileInfo.package, opts), {
						defaultCDNBase: opts.defaultCDNBase,
						filepath: url,
						filepathRel: path.join(opts.relativeRoot, url).replace(/^\//, ''),
						filename: path.basename(url),
						filenameMin: util.getFilenameMin(url, opts),
						package: fileInfo.package,
						test: fileInfo.test
					});
					result += _.template(fileInfo.cdn || opts.defaultCDN, params);
					result += post;
					if(canAddFallback && m.fallback && fileInfo.test) {
						result += _.template(opts.fallbackTest, params);
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
