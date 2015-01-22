var	sigTestDB 		= require('./model').sigTests(),
	sigDB 			= require('./model').sigs(),
	userDB 			= require('./model').users(),
	regressionDB	= require('./model').regressions(),
	i 				= require('./assets'),
	async 			= require('async'),
	path            = require('path'),
	fs 				= require('fs'),
	_ 				= require('underscore'),
	db2		 		= require('./mysql').connection;
	test_path  		= require('../../../config').reg_pool;

module.exports = function() {
	var resultArr = [];
	var parseBoolean = function (string) {
		switch (String(string).toLowerCase()) {
			case "true":
			case "1":
			case "yes":
			case "y":
				return true;
			case "false":
			case "0":
			case "no":
			case "n":
				return false;
			default:
				return undefined;
		}
	}

	var wrapPlatform = function (platform) {
		var obj = {};
		obj[platform] = true;
		return obj;
	}

	this.removeTest = function(rec, me, rel, tid, res) {
		var queryKey = 'releases.'+rel+'.tests';
		console.log('let me see see: ', rec);
		console.log(me);
		var query = {};
			query[queryKey] = {'$elemMatch': {'tid': parseInt(tid)} };
		var pullQuery = {};
			pullQuery['$pull'] = {};
			pullQuery['$pull'][queryKey] = {'tid': parseInt(tid)};

		sigTestDB.update( 
			query, 
			pullQuery,
			function(err, result) {
				if (err) console.log(err);
				else {
					res.json('done');
					console.log('...........', rec.releases);
					// for(relKey in rec.releases) {
					// 	var relObj = rec.releases[relKey];
					// 	if(typeof(relObj.tests) != 'undefined') {
					// 		console.log(relObj.tests)
					// 		for(var i=0; i<relObj.tests.length; i++) {
					// 			delete relObj.tests[i].context;
					// 			delete relObj.tests[i].matches;
					// 		}
					// 	}
					// }
					// writeToFile('sigTests', rec, rec.platform, rec.sid, me.login);					
				}
			}
		);
	}
	this.updateSigTest = function(rec, me, res) {
		var id = rec.sid;
		sigTestDB.findOne({sid: id}, function(err, st) {
			if (st) {
				var theReleases = rec.releases ? rec.releases : {};
				
				sigTestDB.update(
					{sid: id},
					{
						$set: {
							releases: rec.releases,
							platform: rec.platform,
							category: rec.category
						}
					}, function(err, result) {
						if (err) {
							console.log(err)
						} else {
							res.json('done');
							// 
							// removing context and matches for mysql stores
							// 
							for(relKey in rec.releases) {
								var relObj = rec.releases[relKey];
								if(typeof(relObj.tests) != 'undefined') {
									console.log(relObj.tests)
									for(var i=0; i<relObj.tests.length; i++) {
										delete relObj.tests[i].context;
										delete relObj.tests[i].matches;
									}
								}
							}
							writeToFile('sigTests', rec, rec.platform, rec.sid, me.login);
						}
					}
				);
			} 
		});

	}
	this.loadCategories = function(platform, object, res) {
		if (object == 'true') {
			var pObj = JSON.parse(platform);
		} else {
			var pObj = wrapPlatform(platform);
		}

		sigDB.distinct('category', {
			platform: {$elemMatch: pObj}
		}, function(err, results) {
			if (err) { console.log('ERRROROROROROROR') }
			else {
				console.log('CATS:::', results)
				res.json(results)
			}
		});
	
		
	}
	this.loadPlatforms = function(res) {
		sigDB.distinct('platform', {}, function(err, results) {
			if (err) { console.log('ERRROROROROROROR') }
			else {
				var platforms = {};
				for(index in results) {
					var obj = results[index];
					for(platform in obj) {
						if(obj[platform]) platforms[platform] = platform; 
					}
				}
				res.json(platforms)
			}
		});
	}
	this.loadComponents = function(platform, category, object, res) {
		if (object == 'true') {
			var pObj = JSON.parse(platform);
		} else {
			var pObj = wrapPlatform(platform);
		}

		sigDB.distinct('component', {
			platform: {$elemMatch: pObj},
			category: category,
			userid: { $exists: false } 
		}, function(err, results) {
			if (err) { console.log('ERRROROROROROROR') }
			else {
				res.json(results)
			}
		});
	}
	this.loadAllSigs = function(me, res) {
		console.log(me)
		setTimeout(function() {
			var groupQuery = "SELECT group_id FROM user_groups WHERE username = '" + me + "'";	
			console.log(groupQuery)
			db2.query(groupQuery, function(err, rows) {
			if(err) throw err;
				setTimeout(function() {
					console.log(rows[0]);
					groupid = rows[0].group_id;		
					sigDB.find( { level: { $gte: groupid } }, function(err, cursor) {
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
					});				
				}, 500);
			});
		}, 500);
	}
	this.loadSigs = function(platform, category, me, tec, sort, res) {
		tec = parseBoolean(tec);
		var pObj = wrapPlatform(platform);

		sigDB.find({
			$and: [
				{ platform: {$elemMatch: pObj} },
				{ category: category? category : 'CPM' },
				{ level: tec? { $gte: 1} : { $gte: 3}},
				{ $or: [
						{ userid: me }, 
						{ userid: { $exists: false } }
					]
				}
			]
		}, {sort: sort}, function(err, cursor) {
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
		});
	}
	this.loadSigTests = function(platform, category, tec, sort, res) {
		// var pObj = wrapPlatform(platform);

		sigTestDB.find({
			$and: [
				{ platform: platform },
				{ category: category? category : 'CPM' }
			]
		}, {sort: sort}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				if(err) {
					console.log('something is fishy')
				} else {
					res.json(rec);
				}
			})
		});
	}

	var writeToFile = function(table, data, platform, id, userid) {
		async.eachSeries(Object.keys(platform), function(p, callback) {
			var sigID = p.replace(/ /, '_') + '_sig_' + id;
			console.log(sigID)
			var exist_q = 'SELECT COUNT(1) FROM '+table+' WHERE sigID="'+sigID+'"';
			var query = '';
			db2.query(exist_q, function(err, rows) {
				var exist = rows[0]['COUNT(1)'];
				if(exist > 0) {
					query = "UPDATE "+table+" SET sigData='"+JSON.stringify(data, null, 4)+"' WHERE sigID='"+sigID+"'";
				} else {
					query = "INSERT INTO "+table+" VALUES ('"+sigID+"', '"+JSON.stringify(data, null, 4)+"', '"+userid+"')";
				}
				db2.query(query, function(err, rows) {
					console.log(rows)
					callback();
				})
			});
		}, function(err, result) {
			console.log('done')
		})
	}

	this.addSignature = function(req, res) {
		var sigIDs = {
			'CPM': 1,
			'IOM': 100,
			'MDA': 200,
			'PORT': 300,
			'LOG': 400,
			'SYS': 500
		}

		var platform = JSON.parse(req.param('platform'));

		sigDB.find({
			$and: [
				{ platform: {$elemMatch: platform } },
				{ category: req.param('category')? req.param('category') : 'CPM' }
			]
		}, {sort: {sid: -1}}, function(err, cursor) {
			if (err) { console.log('ERRROROROROROROR') }
			else {
				cursor.toArray(function(err, rec) {
					if(err) {
						console.log('something is fishy')
					} else {
						if (!rec.length) {
							var newSid = sigIDs[req.param('category')];
						} else {
							var newSid = rec[0].sid + 1;
						}

						sigDB.insert(sigObj, function(err, result) {
							if (err) {
								console.log('ERROR');
							} else {
								for(p in platform) {
									sigTestDB.insert({
										sid: newSid,
										platform: p,
										category: req.param('category'),
										releases: {}
									}, function(err, result) {
										if (err) {
											console.log('ERROR');
										} else {
											console.log('Done!');
										}
									});
								}

								writeToFile('sigs', sigObj, platform, newSid, req.param('userid'));
								res.json(sigObj);
							}
						});
					}
				})
			}
		});

		
	}

	this.loadAllSig = function(res) {
		var sigInfo = {};
		sigDB.find({}, function(err, cursor){
			if (err) { console.log('ERRROROROROROROR') }
			else {
				cursor.toArray(function(err, rec) {
					for(index in rec) {
						var sigObj = rec[index];
						sigInfo[sigObj.sid] = sigObj;
					}
					res.json(sigInfo);
				})
			}
		});
	}

	this.loadTSNs = function(res) {
		var tsns = {};
		tsnDB.find({}, function(err, cursor){
			if (err) { console.log('ERRROROROROROROR') }
			else {
				cursor.toArray(function(err, rec) {
					for(index in rec) {
						var tsnObj = rec[index];
						tsns[tsnObj.name] = tsnObj;
					}
					res.json(tsns);
				})
			}
		});
	}

	this.updateSignature = function(req, res) {
		var sid = parseInt(req.param('sid')),
			platform = JSON.parse(req.param('platform'));

		sigDB.findOne({ sid: sid }, function(err, rec) {
			if (rec) {
				var sigObj = {
					sid: sid,
					index: sid,
					platform: [platform],
					name: req.param('name'),
					detail: req.param('detail'),
					tlsmessage: req.param('tlsmessage'),
					customermessage: req.param('customermessage'),					
					component: req.param('component'),
					category: req.param('category'),
					cmd_type: '',
					customer: '',
					action: req.param('action'),
					command: '',
					dts: req.param('dts'),
					rn: req.param('rn'),
					ta: req.param('ta'),
					fixed: req.param('fix'),
					flag: '',
					level: parseInt(req.param('level')),
					threshold: parseInt(req.param('threshold'))
				}


				sigDB.update(
					{ sid: sid },
					{
						$set: {
							platform: [platform],
							name: req.param('name'),
							detail: req.param('detail'),
							tlsmessage: req.param('tlsmessage'),
							customermessage: req.param('customermessage'),
							component: req.param('component'),
							category: req.param('category'),
							cmd_type: '',
							customer: '',
							action: req.param('action'),
							command: '',
							dts: req.param('dts'),
							rn: req.param('rn'),
							ta: req.param('ta'),
							fixed: req.param('fix'),
							flag: '',
							level: parseInt(req.param('level')),
							threshold: parseInt(req.param('threshold'))
						}
					}
				);
				writeToFile('sigs', sigObj, req.param('platform'), sid, req.param('userid'));

				res.json('done')
			}
		})
	}

	this.loadAllSigTests = function(res) {
		sigTestDB.find({
			userid: { $exists: false } 
		}, function(err, cursor) {
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
		});
	}

	this.runAll = function(RP) {
		var dateObj = new Date();
		var today = dateObj.getFullYear() +'-'+(dateObj.getMonth()+1)+'-'+dateObj.getDate();
		console.log(today)
		var regList = {};
		sigTestDB.find({}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				if(err) {
					console.log('something is fishy')
				} else {
					for(index in rec) {
						if (rec[index].sid.toString().match(/51[3-4]/)) {
							var releases = Object.keys(rec[index].releases);
							for(r in releases) {
								var relObj = rec[index].releases[releases[r]];
								runRegression(rec[index].sid, RP, releases[r], rec[index].platform, relObj, regList, today)
							}
						}
					}
				}
			})
		})
	}

	this.parseMatch = function(platform, release, file, RP, res) {
		resultArr = [];
		var regList = {};
		sigTestDB.find({}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				if(err) {
					console.log('something is fishy')
				} else {
					for(index in rec) {
						if (rec[index].sid.toString().match(/51[3-4]/) && rec[index].platform == platform) {//500 or upper
							var releases = Object.keys(rec[index].releases);
							async.eachSeries(releases, function(r, callback) {
								if(r == release) {
									var relObj = rec[index].releases[r];
									run(rec[index].sid, RP, r, platform, relObj, file, regList, res);
								}					
								callback();
							})
						}
					}
				}
			})
		})
		setTimeout(function() {
			res.send(resultArr);			
		}, 1000);
	}

	var run = function(sid, RP, rel, platform, relObj, file, regList, res) {
		var tests = [], fails = {}, passes = {};
		var keepThisCommand = function(cmd) {
			for(index in tests) {
				var tObj = tests[index];
				if (typeof(tObj.command) != 'undefined') {
					var re = new RegExp(tObj.command);
					if (cmd.match(re)) {
						return tObj;
					}
				}
			}
			return false;
		}

		tests[sid] = [];
		if(typeof(relObj) != 'undefined') {
			for(t in relObj.tests) {
				var tObj = relObj.tests[t];
				delete tObj.matches;
				delete tObj.context;
				tObj['sid'] = sid;
				tests.push(tObj);
			}
		}

		var filePath = path.join(__dirname, "../../public/uploads/pool/" + platform + "/" + rel + "/" + file);
		fs.readFile(filePath, {encoding: 'utf-8'}, function (err,data) {
			if (err) {
			  return console.log(err);
			} else{
			  var parts = data.split(/\S+ \S+ \d+ \d+:\d+:\d+ \d+ UTC:\r/)
			  async.eachSeries(parts, function(i, callback) {
			   	var tmp = i.split(/\r\n/);
			 	cmd = tmp[0].substring(1, tmp[0].length - 1);
			 	var tObj = keepThisCommand(cmd);
			 	if (tObj) {
			 		var raw_regex = tObj.regex;
			 		if (!raw_regex) {
			 			// ** skip
			 		} else {
			 			// console.log('---华丽的分割线---');
			 			var titletemp = i.split(/\n/)[1];
			 			var temp = {};
			 			temp.title = titletemp;
			 			temp.body = i;
			 			resultArr.push(temp);
			 		}
			 	}										
			  	callback();
			  })
			}
		});
	}	
	this.regressionResults = function(res) {
		var sigInfo = {};
		sigDB.find({}, function(err, cursor) {
			cursor.toArray(function(err, results) {
				if(err) {
					console.log('something is fishy')
				} else {
					for(i in results) {
						sigInfo[results[i].sid] = results[i].name
					}
					// 
					// NASTY!!! 
					// HOW CAN I IMPROVE???
					// 
					regressionDB.find({}, function(err, cursor) {
						cursor.toArray(function(err, rec) {
							if(err) {
								console.log('something is fishy')
							} else {
								var regressions = {}, overall = {};
								for(index in rec) {
									var date = rec[index].date;
									console.log(date)
									var logs = rec[index].logs;
									if (typeof(regressions[date]) == 'undefined') regressions[date] = {};
									if (typeof(overall[date]) == 'undefined') overall[date] = {};
									for(sid in logs) {
										if (typeof(regressions[date][sid]) == 'undefined') regressions[date][sid] = {};
										if (typeof(overall[date][sid]) == 'undefined') overall[date][sid] = {};
										var platforms = logs[sid];
										for(platform in platforms) {
											if (typeof(regressions[date][sid][platform]) == 'undefined') regressions[date][sid][platform] = {};
											if (typeof(overall[date][sid][platform]) == 'undefined') overall[date][sid][platform] = {};
											var releases = platforms[platform];
											for(rel in releases) {
												if (typeof(regressions[date][sid][platform][rel]) == 'undefined') regressions[date][sid][platform][rel] = {};
												if (typeof(overall[date][sid][platform][rel]) == 'undefined') overall[date][sid][platform][rel] = {};
												var fails = releases[rel]['fail'];
												var passes = releases[rel]['pass'];
												if (Object.keys(fails).length > 0) {
													if (typeof(regressions[date][sid][platform][rel]['fail']) == 'undefined') regressions[date][sid][platform][rel]['fail'] = {};
													for(file in fails) {
														if (typeof(regressions[date][sid][platform][rel]['fail'][file]) == 'undefined') regressions[date][sid][platform][rel]['fail'][file] = [];
														for(i in fails[file]) {
															regressions[date][sid][platform][rel]['fail'][file].push(fails[file][i]);
														}
													}
													overall[date]['overall'] = 'fail';
													overall[date][sid]['overall'] = 'fail';
													overall[date][sid][platform]['overall'] = 'fail';
													overall[date][sid][platform][rel]['overall'] = 'fail';
												}
												if (Object.keys(passes).length > 0) {
													if (typeof(regressions[date][sid][platform][rel]['pass']) == 'undefined') regressions[date][sid][platform][rel]['pass'] = {};
													for(file in passes) {
														if (typeof(regressions[date][sid][platform][rel]['pass'][file]) == 'undefined') regressions[date][sid][platform][rel]['pass'][file] = [];
														for(i in passes[file]) {
															regressions[date][sid][platform][rel]['pass'][file].push(passes[file][i]);
														}
													}
													if(typeof(overall[date]['overall']) == 'undefined') overall[date]['overall'] = 'pass';
													if(typeof(overall[date][sid]['overall']) == 'undefined') overall[date][sid]['overall'] = 'pass';
													if(typeof(overall[date][sid][platform]['overall']) == 'undefined') overall[date][sid][platform]['overall'] = 'pass';
													overall[date][sid][platform][rel]['overall'] = 'pass';
												}
											}
										}

									}
								}
								// fs.writeFile("/tmp/test", JSON.stringify([regressions, sigInfo, overall]), function(err) {
    				// 				if(err) {
								//         console.log(err);
								//     } else {
								//         console.log("The file was saved!");
								//     }
								// }); 

								res.json([regressions, sigInfo, overall]);
							}
						})
					})
				}
			})
		})
	}
 

	var runRegression = function(sid, RP, rel, platform, relObj, regList, today) {
		var tests = [], fails = {}, passes = {};
		var keepThisCommand = function(cmd) {
			for(index in tests) {
				var tObj = tests[index];
				if (typeof(tObj.command) != 'undefined') {
					var re = new RegExp(tObj.command);
					if (cmd.match(re)) {
						return tObj;
					}
				}
			}
			return false;
		}
		var echo = function( regList, fails, passes, arg1, arg2, filename, data, callback ) {
			filename = filename.replace(/\./g, '_');
			
			if (data == null) {
				if (typeof(fails[filename]) == 'undefined') fails[filename] = [];
				fails[filename].push({regex: arg1, context: arg2});
			} else {
				if (typeof(passes[filename]) == 'undefined') passes[filename] = [];
				passes[filename].push({regex: arg1, context: arg2, matches: data})
			}

			// 
			// initialize the regression result list object
			// 
			if(typeof(regList[sid]) == 'undefined') {
				regList[sid] = {};
				regList[sid][platform] = {};
				regList[sid][platform][rel] = {};
			} else {
				if(typeof(regList[sid][platform]) == 'undefined') {
					regList[sid][platform] = {};
					regList[sid][platform][rel] = {};
				} else {
					if(typeof(regList[sid][platform][rel]) == 'undefined') {
						regList[sid][platform][rel] = {};
					} 
				}
			}
			// 
			// insert the values
			// 
			regList[sid][platform][rel]['pass'] = passes;
			regList[sid][platform][rel]['fail'] = fails;

			callback();			
		};


		tests[sid] = [];
		if(typeof(relObj) != 'undefined') {
			for(t in relObj.tests) {
				var tObj = relObj.tests[t];
				delete tObj.matches;
				delete tObj.context;
				tObj['sid'] = sid;
				tests.push(tObj);
			}
		}
		fs.readdir(test_path+'/'+platform+'/'+rel, function(err, files) {
			if(typeof(files) != 'undefined') {
				async.eachSeries(files, function(file, callback) {
					var filename = test_path+'/'+platform+'/'+rel+'/'+file;
				
					fs.readFile(filename, "utf-8", function(err, data) {
						var parts = data.split(/\S+ \S+ \d+ \d+:\d+:\d+ \d+ UTC:\r/)
						console.log('>>>>>>>> ', filename);
						for(i in parts) {
							var tmp = parts[i].split(/\r\n/),
								cmd = tmp[0].substring(1, tmp[0].length - 1);
							var tObj = keepThisCommand(cmd);
							if (tObj) {
								var raw_regex = tObj.regex;
								if (!raw_regex) {
									// ** skip
								} else {
									tmp.shift();
									var content = tmp.join('_LBR_');
									new RP().regexMatch(raw_regex, content, regList, fails, passes, file, echo, callback);
								}
							}
						}
					})
					
				}, function(err, results) {
					console.log(' === done: ['+test_path+'/'+platform+'/'+rel+'] === ')

					regressionDB.findOne({date:today}, function(err, result) {
						if (!result) {
							regressionDB.insert({
								date: today,
								logs: regList
							})
						} else {
							regressionDB.update({ date: today }, {$set: {logs: regList } })
						}
					})
					
				})
			}
		})
	}	
}