var fs = require('fs');

require('./parser').parse('D:\\Program Files\\Factorio\\data').then(data => {
	console.log('Parsed Factorio data files!');
	for(var x in data){
		fs.writeFile('output/' + data[x].name + '.json', JSON.stringify(data[x].data, undefined, 1));
	}
	fs.writeFile('public/files.json', JSON.stringify(data.map(d => 'data/' + d.name + '.json')));
}).catch(err => {
	console.log('error')
	console.error(err.stack || err)
});

function sendFile(req, res, file, stat){
	if(stat.mtime.getTime() == req.headers["if-none-match"]){
		res.writeHead(304);
		res.end();
		return;
	}
	var headers = {
		'Content-Type': require('mime').lookup(file),
		'Cache-Control': 'max-age=86400',
		"etag": stat.mtime.getTime().toString()
	};

	var stream = require('fs').createReadStream(file);
	var acceptEncoding = req.headers['accept-encoding'];
	if(acceptEncoding && acceptEncoding.indexOf('gzip') > -1){
		stream = stream.pipe(require('zlib').createGzip());
		headers["Content-Encoding"] = 'gzip';
	}
	res.writeHead(200, headers);
	stream.pipe(res);
}

var http = require('http');
http.createServer((req, res) => {
	if(req.url.substring(0, '/image?src=__base__/'.length) == '/image?src=__base__/'){
		var url = decodeURIComponent(req.url.substring('/image?src=__base__/'.length));
		url = 'D:\\Program Files\\Factorio\\data\\base\\' + url;
		var mime = require('mime').lookup(url);
		console.log('loading', url, mime);
		fs.stat(url, function(err, stat) {
			if (!err) {
				sendFile(req, res, url, stat);
			} else {
				res.writeHead(404);
				res.end();
			}
		});
		return;
	}
	console.log(req.url, req.url.substring(0, 11));
	if(req.url.substring(0, 6) == '/data/'){
		fs.stat('./output' + req.url.substring(5), function(err, stat){
			if(!err){
				sendFile(req, res, './output' + req.url.substring(5), stat);
			} else {
				res.writeHead(404);
				res.end();
			}
		})
		return;
	}
	fs.stat('./public' + req.url, function(err, stat){
		if(!err && stat.isFile()){
			sendFile(req, res, './public' + req.url, stat);
		} else {
			fs.stat('./public/index.html', function(err, stat){
				sendFile(req, res, './public/index.html', stat);
			});
		}
	})
}).listen(3131, function(){
	console.log('Server is running at http://localhost:3131/');
});