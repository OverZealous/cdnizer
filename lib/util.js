var minimatch = require('minimatch');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');


function getPackageRoots(opts) {
	if(!opts._bowerRoot) {
		opts._bowerRoot = './bower_components';
		opts._nodeRoot = './node_modules';
		var bowerrc;
		if(opts.nodeModules || opts.nodeModules === false) {
			opts._nodeRoot = opts.nodeModules;
		}
		if(opts.bowerComponents) {
			opts._bowerRoot = opts.bowerComponents;
		} else if(fs.existsSync('./.bowerrc')) {
			bowerrc = JSON.parse(require('fs').readFileSync('./.bowerrc', { encoding: 'utf8' }));
			if(bowerrc && bowerrc.directory) {
				opts._bowerRoot = path.join('.', bowerrc.directory);
			}
		}
	}
	return { bower: opts._bowerRoot, node: opts._nodeRoot };
}

function getPackageInfo(packageInfo, packageFile) {
	if(!packageInfo.version && fs.existsSync(packageFile)) {
		return require(packageFile);
	}
	return packageInfo;
}

module.exports = util = {

	/**
	 * Matchers for various tags and CSS properties that we might replace
	 */
	matchers: [
		// script with quoted src
		{ pattern: /(<script\s[^>]*?src=["'])([\s\S]+?)(["'][^>]*>\s*<\/script>)/gi, fallback: true },
		// script with unquoted src
		{ pattern: /(<script\s[^>]*?src=)([\s\S]+?)((?:>|\s[^>]*>)\s*<\/script>)/gi, fallback: true },

		// link with quoted href and optional end tag
		{ pattern: /(<link\s[^>]*?href=["'])([\s\S]+?)(["'][^>]*>(?:\s*<\/link>)?)/gi, fallback: true },
		// link with unquoted href and optional end tag
		{ pattern: /(<link\s[^>]*?href=)([\s\S]+?)((?:>|\s[^>]*>)(?:\s*<\/link>)?)/gi, fallback: true },

		// img with quoted src
		{ pattern: /(<img\s[^>]*?src=["'])(.+?)(["'][^>]*>)/gi, fallback: false },
		// img with unquoted src
		{ pattern: /(<img\s[^>]*?src=)(.+?)((?:>|\s[^>]*>))/gi, fallback: false },

		// URL matcher for CSS
		{ pattern: /(url\(['"]?)(.+?)(['"]?\))/gi, fallback: false }
	],

	findFileInfo: function(url, opts) {
		try {
			url = decodeURIComponent(url);
		} catch(e) {
			//Invalid URL ignore
			return;
		}
		url = path.join(opts.relativeRoot, url);
		return _.find(opts.files, function(fileInfo) {
			return minimatch(url, fileInfo.file);
		});
	},

	getFilenameMin: function(url, opts) {
		url = path.basename(url);
		if(opts.allowRev) {
			url = url.replace(/-\w{8}(\..+)$/, '$1');
		}
		url = url.replace(/(\.min)?(\..+)$/, '.min$2');
		return url;
	},

	getVersionInfo: function(fileInfo, opts) {
		var pkg = fileInfo.package;
		if(!pkg) return {};
		if(!opts._versionInfoCache) opts._versionInfoCache = {};
		if(!opts._versionInfoCache[pkg]) {
			var packageInfo = fileInfo;
			var version;
			var versionClean;
			var packageRoots = getPackageRoots(opts);
			var packageFiles = [
				path.join(process.cwd(), packageRoots.bower, pkg, 'bower.json'),
				path.join(process.cwd(), packageRoots.bower, pkg, '.bower.json')
			];
			if(packageRoots.node && !fileInfo.ignoreNodeModules) {
				packageFiles.unshift(path.join(process.cwd(), packageRoots.node, pkg, 'package.json'));
			}
			packageFiles.forEach(function(packageFile) {
				packageInfo = getPackageInfo(packageInfo, packageFile);
			});
			if(!packageInfo.version) {
				throw new Error('Unable to load version from bower.json for package "' + pkg + '".  Looked at:\n    "' + packageFiles.join('",\n    "') + '"');
			}
			version = (packageInfo.version || '0.0.0').match(/(\w+)?(?:\.(\w+))?(?:\.(\w+))?/);
			versionClean = version[1] || 0;
			if(version[2].length > 0) {
				versionClean += '.' + version[2];
			}
			if(version[3].length > 0) {
				versionClean += '.' + version[3];
			}
			opts._versionInfoCache[pkg] = {
				version: versionClean,
				versionFull: packageInfo.version || '0.0.0',
				major: version[1] || 0,
				minor: version[2] || 0,
				patch: version[3] || 0
			};
		}
		return opts._versionInfoCache[pkg];
	}
};
