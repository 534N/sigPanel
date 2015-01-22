var sigTestDB 		= require('./model').sigTests(),
	sigDB 			= require('./model').sigs(),
	regressionpool  = require('./model').regressionpool(),
	i 				= require('./assets'),
	ping 			= require('ping'),
	async 			= require('async'),
	fs 				= require('fs'),
	path            = require('path'),
	mkdirp 			= require('mkdirp'),
	_ 				= require('underscore'),
	StringDecoder 	= require('string_decoder').StringDecoder,
	decoder 		= new StringDecoder('utf8'),
	Promise 		= require('promise'),
	test_path  		= require('../../../config').reg_pool;
	RP 				= require('./regex-parser'),
	PCRE 			= require('pcre-to-regexp'),
	exec 			= require('child_process').exec,
	http			= require('http');

var execRegex = function(regex, string) {
	var keys = [],
		match = [];
	var re = PCRE(regex, keys);
		match = re.exec(string);
	for (var i = 0; i < keys.length; i++) {
		if ('string' === typeof keys[i]) {
			match[keys[i]] = match[i + 1];
		}
	}
	return match;
}
						  
var decodeRegex = function(regex) {
    if(regex) {
        // 
        // decoding regex string
        // 
        regex   = regex.replace(/_bs_/g, '\\');
        regex   = regex.replace(/_fs_/g, '\/');
        regex   = regex.replace(/_space_/g, ' ');
        regex   = regex.replace(/_ob_/g, '\(');
        regex   = regex.replace(/_cb_/g, '\)');
        regex   = regex.replace(/_qm_/g, '\?');
        regex   = regex.replace(/_cl_/g, '\:');
        regex   = regex.replace(/_plus_/g, '\+');
        regex   = regex.replace(/_aob_/g, '\<');
        regex   = regex.replace(/_acb_/g, '\>');
        regex   = regex.replace(/_sob_/g, '\[');
        regex   = regex.replace(/_scb_/g, '\]');
        regex   = regex.replace(/_cob_/g, '\{');
        regex   = regex.replace(/_ccb_/g, '\}');
        regex   = regex.replace(/_dot_/g, '\.');
        regex   = regex.replace(/_star_/g, '\*');
        regex   = regex.replace(/_cma_/g, '\,');
        regex   = regex.replace(/_bar_/g, '\|');
    }
    return regex;
};						  

var wrapPlatform = function (platform) {
	var obj = {};
	var platformpath = "platform."+platform;
	obj[platformpath] = true;
	return obj;
}

var wrapRelease = function (release) {
	var obj = {};
	var releasepath = "releases."+release;	
	obj[releasepath] = {};
	obj[releasepath]['$exists'] = true;
	return obj;
}

module.exports = function() {
	this.uploadFile = function(file, user, fileObj, commands, signatureMatches, RP, res) {
		console.log("-------------->", user);
		var filePath = file.path,
			current  = new Date().getTime(),
			fileName = file.name;
		
		// regressionpool.insert(JSON.parse(fileObj), function() {
		// 	console.log('done');
		// })
		// console.log(fileObj, "++++");		
		
		// determine uploaded system basic information: 
		// 1. system verion
		// 2. platform
		// 
		var systemVerion = fileObj.release, 
			platform = fileObj.platform,
			formatted_release = 'release_'+fileObj.release.replace(/\./, '_');
		// 
		// 
		// read the file content
		fs.readFile(filePath, function (err, data) {
			// 
			// 
			// upload to a file...
			// if it is absolutely necessary
			var newPath = test_path + '/' + platform + '/' + formatted_release;
			// 
			// 
			// process the uploaded data
			var content = decoder.write(data),
				temp = [],
				activeCPM = {},
				activeCommands = {};
				commands = {};
			// 
			// 
			// writing the uploaded file from buffer to
			// the actual file
			if(!fs.existsSync(newPath)){
				console.log(newPath + ' does not exist')
				mkdirp(newPath, function(err) {
					if(err) {
						console.error(err);
					} else {
						fs.writeFile(newPath + '/' + fileName, data, function (err) {
							if (err) {
								res.json('Error: ' + err);
							} else {
					  			res.json({'answer': 'File transfer completed', 'data': signatureMatches});
							}
						});
					} 
				});
			} else {
				fs.writeFile(newPath + '/' + fileName, data, function (err) {
					if (err) {
						res.json('Error: ' + err);
					} else {
					 		res.json({'answer': 'File transfer completed', 'data': signatureMatches});
					}
				});
			}
		
		});
	}

	this.getPoolStructure = function(res) {
		var walk = function(dir, done) {
			var results = {};
			fs.readdir(dir, function(err, list) {
				if (err) return done(err);
				var i = 0;
				(function next() {
					var file = list[i++];
					if (!file) return done(null, results);
					var pfile = dir + '/' + file;
					fs.stat(pfile, function(err, stat) {
						if (stat && stat.isDirectory()) {
							walk(pfile, function(err, result) {
								// results = results.concat(result);
								results[file] = result;
								next();
							});
						} else {
							results[file] = file;
							next();
						}
					});
				})();
			});
		};

		walk(test_path, function(err, data) {
			if (err) throw err;
			res.json(data)
		});
	}

	this.insertFile = function(file, res) {

		file.uploadtime = new Date().getTime();
		regressionpool.insert(file, function() {
			res.send('done');
		})
	}

	this.repeatCheck = function(filename, res) {
		var str = 'find ' + __dirname + '/../../public/uploads/pool ' + '-name' + ' ' + filename;
		exec('find ' + __dirname + '/../../public/uploads/pool ' + '-name' + ' ' + filename, function(err, stdout, stderr) { 
			console.log("------>", stdout);
			res.send(stdout); 
		});
		console.log('check this: ' + str);
	}

	this.getFileinfo = function(platform, release, file, res) {
		console.log("lol:::", platform, release, file);
		regressionpool.find({"platform": platform, "name": file}, function(err, cursor) {
			if (err) { console.log('ERRROROROROROROR') }
			else {
				cursor.toArray(function(err, rec) {
					if(err) {
						console.log('something is fishy')
					} else {
						res.json(rec);
					}
				})
			}
		})
	}	
}
