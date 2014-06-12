var minimatch = require('minimatch'),
	fs = require('fs'),
	path = require('path'),
	_ = require('lodash');
	

function getBowerRoot(opts) {
	if(!opts._bowerRoot) {
		opts._bowerRoot = './bower_components';
		var bowerrc;
		if(opts.bowerComponents) {
			opts._bowerRoot = opts.bowerComponents;
		} else if(fs.existsSync('./.bowerrc')) {
			bowerrc = JSON.parse(require('fs').readFileSync('./.bowerrc', {encoding: 'utf8'}));
			if(bowerrc && bowerrc.directory) {
				opts._bowerRoot = path.join('.', bowerrc.directory);
			}
		}
	}
	return opts._bowerRoot;
};

module.exports = util = {

	/**
	 * Matchers for various tags and CSS properties that we might replace
	 */
	matchers: [
		{ pattern: /(<script\s.*?src=["'])(.+?)(["'].*?>\s*<\/script>)/gi, fallback: true },
		{ pattern: /(<link\s.*?href=["'])(.+?)(["'].*?>\s*<\/link>)/gi, fallback: true },
		{ pattern: /(<link\s.*?href=["'])(.+?)(["'].*?\/?>)/gi, fallback: true },
		{ pattern: /(<img\s.*?src=["'])(.+?)(["'])/gi, fallback: false },
		{ pattern: /(url\(['"]?)(.+?)(['"]?\))/gi, fallback: false }
	],
	
	findFileInfo: function(url, opts) {
		url = decodeURIComponent(url);
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
		url = url.replace(/(min\.)?(\..+)$/, '.min$2');
		return url;
	},
	
	getVersionInfo: function(pkg, opts) {
		if(!pkg) return {};
		if(!opts._versionInfoCache) opts._versionInfoCache = {};
		if(!opts._versionInfoCache[pkg]) {
			var packageInfo, version, packageRoot = path.join(process.cwd(), getBowerRoot(opts), pkg);
			if(fs.existsSync(path.join(packageRoot, 'bower.json'))) {
				packageInfo = require(path.join(packageRoot, 'bower.json'));
			} else if(fs.existsSync(path.join(packageRoot, '.bower.json'))) {
				packageInfo = require(path.join(packageRoot, '.bower.json'));
			} else {
				throw new Error('Unable to load bower.json for package "'+pkg+'".  Looked under "'+packageRoot+'"');
			}
			version = (packageInfo.version || '0.0.0').match(/(\d+)?\.(\d+)?\.(\d+)?/);
			opts._versionInfoCache[pkg] = {
				version: packageInfo.version || '0.0.0',
				major: version[1] || 0,
				minor: version[2] || 0,
				patch: version[3] || 0
			}
		}
		return opts._versionInfoCache[pkg];
	}
}