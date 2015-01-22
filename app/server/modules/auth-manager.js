var	userDB 		= require('./model').users(),
	i 			= require('./assets'),
	async 		= require('async'),
	fs 			= require('fs'),
	_ 			= require('underscore'),
	db2		 	= require('./mysql').connection;

module.exports = function() {

	this.login = function(csl, res) {
		userDB.update(
			{csl: csl},
			{
				$set: {
					authenticated: 1
				}
			}, function(err, result) {
				if(err) {
					console.log(err);
				} else {
					userDB.find({
						$and: [
							{ csl : csl },
						]
					}, function(err, cursor) {
						if (err) { console.log('ERRROROROROROROR') }
						else {
							cursor.toArray(function(err, rec) {
								if(err) {
									console.log('something is fishy')
								} else {
									//haven't sign up yet
									if(_.isEmpty(rec) == true) {
										console.log('rec is: ', rec);
										res.send('needsignup');
									} else {
										res.cookie('mycookie', rec, { expires: new Date(Date.now() + 604800000), httpOnly: true }).send();
										console.log('handle------->', rec);
										res.json(rec);
									}
								}
							})
						}
					});						
				}
			}
		);

	}

	this.signup = function(user, res) {
		var user = JSON.parse(user);
		console.log(typeof(user));
		var exist_q = "SELECT * FROM tecs WHERE csl = '" + user.csl + "'";
		db2.query(exist_q, function(err, rows) {
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", rows.length);
			if(rows.length == 1) {
				i = 1;
				ls = 3;		
			} else {
				i = 0;
				console.log(user.email, typeof(user.email))
				//2LS
				if(user.email.search('alcatel-lucent.com') != -1) {
					ls = 2;
				} else {
					ls = 1;
				}
			}
			userDB.insert({
				csl: user.csl,
				firstname: user.firstname,
				lastname: user.lastname,
				country: user.country,
				location: user.location,
				email: user.email,
				authenticated: 0,
				permissions : {
	            	tec : i,
	            	admin : 1,
	            	ls: ls   
	    		}
			}, function(err, result) {
				if (err) {
					console.log('ERROR');
				} else {
					res.json('done');				
				}
			});	
		});


	}

	this.logout = function(csl, res) {
		console.log('done log out');
		userDB.update(
			{csl: csl},
			{
				$set: {
					authenticated: 0
				}
			}, function(err, result) {
				if(err) {
					console.log(err);
				} else {
					res.clearCookie('mycookie', { path: '/' });
					res.json('done');					
				}
			}
		);
	}

	this.ifexpire = function(cookieobject, res) {

		if(!cookieobject.hasOwnProperty('mycookie')) { //expired already, authenticated needed EAQUL to 0 ADD ANOTHER FIELD
			console.log('expired');
			userDB.update(
				{csl: csl},
				{
					$set: {
						authenticated: 0
					}
				}, function(err, result) {
					if(err) {
						console.log(err);
					} else {
						res.json('done');
					}
				}
			);
			res.send('expired');			
		} else {	//return user info
			console.log("in AM: ", cookieobject.mycookie[0]);
			cookieinfo = cookieobject.mycookie[0];  //object here
			var csl = cookieinfo.csl;
			userDB.find({
				$and: [
					{ csl : csl },
				]
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
	}

}