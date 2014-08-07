var _ = require('lodash'),
	cdnData = require('./cdn-data');

var defaults = {
		defaultCDNBase: '',
		defaultCDN: '<%= defaultCDNBase %>/<%= filepathRel %>',
		relativeRoot: '',
		allowRev: true,
		allowMin: true,
		bowerComponents: null,
		// escaped to prevent IntelliJ from being too smart
		fallbackScript: '<scr'+'ipt>function cdnizerLoad(u) {document.write(\'<scr\'+\'ipt src="\'+encodeURIComponent(u)+\'"></scr\'+\'ipt>\');}</script>',
		fallbackTest: '<scr'+'ipt>if(!(${ test })) cdnizerLoad("${ filepath }");</script>',
		shouldAddFallback: false,
 		matchers: []
	};

function parseOptions(opts) {
	if(!opts || (typeof opts !== 'object' && !Array.isArray(opts))) {
		throw new Error("No options or invalid options supplied");
	}
	if(Array.isArray(opts)) {
		opts = {files: opts};
	}
	if(!Array.isArray(opts.files) || opts.files.length === 0) {
		throw new Error("Invalid or empty files list supplied");
	}
	opts = _.merge({}, defaults, opts);
	cdnData.configure(opts);

	opts.files = opts.files.map(function(fileInfo) {
		fileInfo = _.cloneDeep(fileInfo);
		if(typeof fileInfo === 'string' && fileInfo.length > 0) {
			fileInfo = cdnData.get(fileInfo);
		}
		if(!fileInfo._foundCdn && fileInfo.cdn) {
			var cdn = cdnData.get(fileInfo.cdn);
			if(cdn._foundCdn) {
				delete fileInfo.cdn;
				fileInfo = _.merge(cdn, fileInfo);
			}
		}
		if(!fileInfo.file || typeof fileInfo.file !== 'string') {
			throw new Error('File declaration is invalid');
		}
		if(fileInfo.test) {
			opts.shouldAddFallback = true;
		}
		if(opts.allowMin && fileInfo.file.indexOf('.min') === -1) {
			fileInfo.file = fileInfo.file.replace(/\.(.*)$/, '.?(min.)$1');
		}
		if(opts.allowRev) {
			fileInfo.file = fileInfo.file.replace(/(\..*)$/, '?(-????????)$1');
		}
		return fileInfo;
	});

	opts.matchers = opts.matchers.map(function(matcher) {
		if(_.isRegExp(matcher)) {
			return { pattern: matcher, fallback: false };
		} else {
			return matcher;
		}
	});

	opts.defaultCDNBase = opts.defaultCDNBase.replace(/\/$/, '');
	return opts;
}

module.exports = parseOptions;
