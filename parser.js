var luaparser = require('./luaparser'),
	fs = require('fs'),
	path = require('path');

function parse(baseDir){
	return new Promise((res, rej) => {
		fs.readdir(baseDir, (err, files) => {
			res(files
				.filter(f => f != 'changelog.txt')
				.map(f => path.join(baseDir, f))
			);
		});
	}).then(mods => Promise.all(mods.map(mod => new Promise(res => {
		fs.readFile(path.join(mod, 'data.lua'), { encoding: 'utf-8' }, function(err, data){
			if(err) return res();
			name = mod.substring(mod.lastIndexOf('\\') + 1);
			var result = {
				name: name,
				path: mod,
				files: {}
			};
			result.files[path.join(mod, 'data.lua')] = data;
			res(result);
		});
	})))).then(mods => Promise.all(mods.filter(m => !!m).map(luaparser)));
}

module.exports.parse = parse;