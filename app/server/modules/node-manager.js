	// db 		= require('./mysql').connection,
	// db2 	= require('./mysql2').connection,
var	nodeDB 	= require('./model').nodes(),
	typeDB  = require('./model').types(),
	i 		= require('./assets'),
	ping 	= require('ping'),
	async 	= require('async'),
	fs 		= require('fs');

module.exports = function(io) {
	
	this.pingNode = function(node, res) {
		var allNodes = [];

		var updateNode = function(node) {

			nodeDB.findOne({ip: node.ip}, function(err, rec) {
				if (rec) {
					console.log('NODE>>>>>>>>: ', node)
					nodeDB.update(
						{ip: node.ip},
						{
							$set: {
								type: node.type,
								subnet: node.subnet,
								version: node.version,
								username: node.username ? node.username : 'admin',
								password: node.password ? node.password : 'admin',
								status: node.status,
								position: {
									row: node.position.row ? node.position.row : null,
									rack: node.position.rack ? node.position.rack : null,
									pos: node.position.pos ? node.position.pos : null,
									size: node.position.size ? node.position.size : 7
								}
							}
						}
					);
				} 
			})
		}

		var processNodeInfo = function(node, host, username, password, port, callback) {
			var Connection 	= require('ssh2');
			var expect 		= require('stream-expect');
			var defaultPort = 22;
			var c 			= new Connection();

			c.on('connect', function() {
				i._info('conncted to ' + host);
			});

			c.on('ready', function() {
			  	c.shell(function(err, stream) {
				    if (err) throw err
				    /* Use ssh Connection as read and write stream */
					var exp = expect.createExpect(stream);
					
					stream.on('data', function(data, extended) {
						// i._wrap(data)
					});
					stream.on('end', function() {
				      // console.log('Stream :: EOF');
				    });
				    stream.on('close', function() {
				      // console.log('Stream :: close');
				      c.end();
				    });
				    stream.on('exit', function(code, signal) {
				      // console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
				      c.end();
				    });

				  	exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
				  		// if(err) console.log('expect ERROR: ' +  err)
				  		// else {
				  			/* make sure we do not get hold up by long output */
						    exp.send('env no more' + '\n');
						    exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
						    	// if(err) console.log('expect ERROR: ' +  err)
						    	// else {
						    		exp.send('show version' + '\n');
							    	exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
							    		// if(err) console.log('expect ERROR: ' + err)
							    		// else {
							    			var regex = /TiMOS-\S-(\S+)/,
								    			match = regex.exec(output);
								    		if (match) {
								    			node.version = match[1];
								    			allNodes.push(node);
								    			callback();
								    			// c.end();
								    		}
							    		// }
							    	});
						    	// }
					    	});
				  		// }
				  	});
			  	});
			});

			c.on('error', function(err) {
			  	i._err('Connection :: error :: ' + err);
			});
			c.on('end', function() {
			  	i._info('Connection :: end');
			});
			c.on('close', function(had_error) {
			  	i._info('Connection :: close');
			});
			
			c.connect({
				host: host,
				port: port ? port : defaultPort,
				username: username,
				password: password
			});
		}

		ping.sys.probe(node.ip, function(isAlive) {
			node.status = isAlive ? 'live' : 'dead';
	    	if(isAlive) {
	    		console.log(node.ip + ' is alive')
				async.eachSeries([node], function(node, callback) {
	    			processNodeInfo(node, node.ip, node.username, node.password, '22', callback);
	    		}, function(err, results){
	    			if (err) { console.log(err) }
					else {
						console.log(node)
						console.log(allNodes)
						allNodes.forEach(function(node) {
							updateNode(node);
						});
						res.json(isAlive)
					}
	    		})
	    	} else {
	    		console.log('some how I am here...')
	    		console.log(node)
	    		res.json(isAlive);
	    	}
	    	
	    });
	}
	this.loadNodes = function(me, login, filter, sort, res) {
		var query = '';
		switch(filter) {
			case 'free':
				nodeDB.find({ 
					owner : {$exists: false} 
				}, function(err, cursor) {
					cursor.toArray(function(err, rec) {
						res.json(rec);
					})
				});
				break;
			case 'busy':
				nodeDB.find({ 
					owner : {$exists: true} 
				}, function(err, cursor) {
					cursor.toArray(function(err, rec) {
						res.json(rec);
					})
				});
				break;
			case 'mine':
				var owner = me.login;
				nodeDB.find({ 
					owner: owner
				}, function(err, cursor) {
					cursor.toArray(function(err, rec) {
						res.json(rec);
					})
				});
				break;
			case 'all':
				nodeDB.find({
					ip : {$exists: true} 
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
				break;
			case 'config':
				nodeDB.find({
					ip : {$exists: true} 
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
			default:
				
		}
	}
	this.releaseNode = function(node, res) {
		nodeDB.update(
			{
				ip: node.ip
			}, 
			{
				$unset: {
					owner: "",
					start: "",
					end: "",
					startDate: "",
					endDate: "",
					ownerObj: ""
				}
			},
			function(err, result) {
				if (err) {
					console.log(err)
				} else {
					io.sockets.emit('broadcast', {
						msg: 'loadNodes'
					});
					res.json('done')
				}
			}
		);
	}
	this.sendReminder = function(checkDate1, checkDate2, type, MAIL) {
		nodeDB.find({ 
			endDate: {$exists: true}
		}, function(err, cursor) {
			var msg = '',
				sender 	= 'T3C laBook',
				subject = 'NODE ' + type + ': ';
			var tos = {};
			cursor.toArray(function(err, rec) {
				async.eachSeries(rec, function(node, callback){
					var nodeEnd = new Date(node.endDate).getTime(),
						checkTime1 = new Date(checkDate1).getTime(),
						checkTime2 = new Date(checkDate2).getTime();

					if (nodeEnd <= checkTime1 || nodeEnd <= checkTime2) {
						var email = node.ownerObj.email;
						var endDate = node.endDate;
						if (typeof(tos[email]) == 'undefined') tos[email] = {};
						if (typeof(tos[email][endDate]) == 'undefined') tos[email][endDate] = [];

						tos[email][endDate].push(node.ip);
					}
					callback();
				}, function(err, result) {
					for(email in tos) {
						var msg = '<html><head><link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:400,300,700"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">',
							sender 	= 'T3C laBook',
							subject = 'NODE ' + type;
						msg += '<style>body { font-family: Open Sans,Lucida Sans Unicode,Lucida Grande,sans-serif; font-weight: 200;} </style></head><body>';

						for(date in tos[email]) {
							msg += '<div class=\'panel panel-info\'><div class=\'panel-heading\'><h3 class=\'panel-title\'>'+date+'</h3></div><div class=\'panel-body\'>';
							for(index in tos[email][date]) {
								msg += tos[email][date][index]+'<BR>';
							}
							msg += '</div></div>';
						}
						msg += '<footer><div class=\'container\'>To change your booking: <a href=\'http://138.120.135.41:3000/book#/loadNodes/free\'>laBook</a></div></footer></body></html>';
						new MAIL().sendMail(sender, email, subject, msg, function(output) {
							// res.json(toReturn);
						});
					}
				});
			});
		});
	}
	this.releaseNodes = function(checkDate) {
		nodeDB.find({ 
			endDate: {$exists: true}
		}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				rec.forEach(function(node) {
					var nodeEnd = new Date(node.endDate).getTime(),
						checkTime = new Date(checkDate).getTime();
					if (nodeEnd <= checkTime) {
						console.log('releasing nodes: ' + node.ip + '...')
						nodeDB.update(
							{
								ip: node.ip
							}, 
							{
								$unset: {
									owner: "",
									start: "",
									end: "",
									startDate: "",
									endDate: "",
									ownerObj: ""
								}
							},
							function(err, result) {
								if (err) {
									console.log(err)
								} else {
									// io.sockets.emit('broadcast', {
									// 	msg: 'loadNodes'
									// });

								}
							}
						);
					}
				})
			});
		});
	}
	this.bookNode = function(node, owner, options, res) {

		var prettify = function(dateStr) {
			return dateStr.replace(/T.*/, '');
		};

		nodeDB.update(
			{
				ip: node.ip
			}, 
			{
				$set: {
					owner: owner.login,
					start: options.start,
					end: options.end,
					startDate: prettify(options.start),
					endDate: prettify(options.end),
					ownerObj: owner
				}
			},
			{
				upsert: true
			},
			function(err, result) {
				if (err) {
					console.log(err)
				} else {
					io.sockets.emit('broadcast', {
						msg: 'loadNodes'
					});
					res.json('done')
				}
				
			}
		);
	}


	this.updateNode = function(node, res) {
		nodeDB.update(
			{
				ip: node.ip
			}, 
			{
				$set: {
					ip: node.ip,
					type: node.type,
					version: node.version,
					username: node.username,
					password: node.password,
					"position.row": parseInt(node.position.row),
					"position.rack": parseInt(node.position.rack),
					"position.pos": parseInt(node.position.pos),
					"position.size": parseInt(node.position.size)
				}
			},
			{
				upsert: true
			},
			function(err, result) {
				if (err) {
					console.log(err)
				} else {
					io.sockets.emit('broadcast', {
						msg: 'loadNodes'
					});
					res.json('done')
				}
				
			}
		);
	}

	this.addNode = function(node, res) {
		nodeDB.find({ip: node.ip}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				if(rec.length) {
					res.json({error: 'IP exists'})
				} else {
					console.log(node)
					nodeDB.insert({
						ip: node.ip,
						type: node.type.type,
						username: node.username,
						password: node.password,
						status: 'dead',
						position: {
							row: node.position.row,
							rack: node.position.rack,
							pos: node.position.pos,
							size: node.position.size
						},
						version: ''
					});
					typeDB.insert({
						type: node.type.type,
						size: node.position.size
					});
					res.json('done')
				}
			})
		});
	}

}
