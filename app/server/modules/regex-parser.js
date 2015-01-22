var exec 		= require('child_process').exec,
	sigTestDB 	= require('./model').sigTests(),
	_ 			= require('underscore'),
	async 		= require('async'),
	php_path  	= require('../../../config').php;

function execute(cmd, flag, tid, callback) {
	exec(cmd, function(err, stdout, stderr) { 
		callback (JSON.parse(stdout), tid, flag); 
	});
};
 
function evaluate(arg1, arg2, tid, callback, flag) {
	console.log('regex: ', arg1)
console.log('context: ', arg2)

	arg2 = arg2.replace(/\"/g, "'");
	var pl_file = __dirname + '/../library/evaluate.php';
	console.log(php_path + "php " + pl_file + ' "' + arg1 + '"  "' + arg2 + '"', flag, tid);
	execute(php_path + "php " + pl_file + ' "' + arg1 + '"  "' + arg2 + '"', flag, tid, callback);
};

function evaluateRegex(arg1, arg2, regList, fails, passes, filename, echo, callback) {
	arg2 = arg2.replace(/\"/g, "'");
	var pl_file = __dirname + '/../library/evaluate.php';
	exec(php_path + "php " + pl_file + ' "' + arg1 + '"  "' + arg2 + '"', function(err, stdout, stderr) { 
		if (stdout) {
			echo (regList, fails, passes, arg1, arg2, filename, JSON.parse(stdout), callback); 
		} else {
			// console.log(stdout)
		}
		// 
	});
};


module.exports = function() {

	this.regexMatch = function(regex, context, regList, fails, passes, filename, echo, callback) {
		evaluateRegex(regex, context, regList, fails, passes, filename, echo, callback);
	}

	this.evalRegex = function(regex, context, release, sid, tid, res) {
console.log('regex: ',regex)
console.log('context: ', context)
		var result 	= {};
		var echo 	= function( data, tid, flag ) {
			result[tid] = data;
			if (_.keys(result).length == flag) {
				res.json(result);
			}
		};

		sigTestDB.find({
			sid: sid
		}, function(err, cursor) {
			if (err) console.log(err);
			else {
				cursor.toArray(function(err, rec) {
					console.log(rec)
					if (typeof(rec[0].releases[release].tests) != 'undefined') {
						var tests = rec[0].releases[release].tests;
console.log(tests)
						for(var i=0; i<tests.length; i++) {
							console.log(i, tid)
							if(i==tid-1){
								if(i<tests.length-1) {
									evaluate(regex, context, tid, echo, tests.length);
								} else {
									evaluate(regex, context, tid, echo, tests.length);
								}
							} else {
								console.log('here', i, tests.length)
								if(i<tests.length-1) {
									evaluate(regex, tests[i].context, i+1, echo, tests.length);
								} else {
									evaluate(regex, tests[i].context, i+1, echo, tests.length);
								}
							}
						}
					}
				})
			}
		});
	}

	this.simpleMatch = function(mac, timestamp, signatureMatches, sid, regex, string, callback) {
		string = string.replace(/\"/g, "'");
		var pl_file = __dirname + '/../library/evaluate.php';

		exec(php_path + "php " + pl_file + ' "' + regex + '"  "' + string + '"', function(err, stdout, stderr) { 
			if(err) console.log(stderr)
			if(stdout) {
				var data = JSON.parse(stdout);
				if(data != null) {
					if (typeof(signatureMatches[mac]) == 'undefined') {
						signatureMatches[mac] = {};
					}
					if (typeof(signatureMatches['timestamps']) == 'undefined') {
						signatureMatches['timestamps'] = [];
					}
					if (signatureMatches['timestamps'].indexOf(timestamp) == -1) {
						signatureMatches['timestamps'].push(timestamp);
					}
					

					if (typeof(data['Card']) != 'undefined') {
						if (typeof(signatureMatches[mac][sid]) == 'undefined') {
							signatureMatches[mac][sid] = {};
						}
						// 
						// 
						// 
						var length = data['Card'].length;
						// 
						// 
						// 
						for(var i=0; i<length; i++) {
							var card = data['Card'][i];
							if (typeof(signatureMatches[mac][sid][card]) == 'undefined') {
								signatureMatches[mac][sid][card] = {};
							}
							if (typeof(signatureMatches[mac][sid][card][timestamp]) == 'undefined') {
								signatureMatches[mac][sid][card][timestamp] = [];
							} 
							var obj = {};
							for(prop in data) {
								obj[prop] = data[prop][i];
							}
							signatureMatches[mac][sid][card][timestamp].push(obj);
						}
					} else if (sid == '500') {
						// signatureMatches[sid] = data['chassisMac'][0];
					} else {
						if (typeof(signatureMatches[mac][sid]) == 'undefined') {
							signatureMatches[mac][sid] = [];
						}
						signatureMatches[mac][sid].push( data );
					}

					
				}
				callback (signatureMatches); 
			}
		});
	}
}