var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var i 			= require('./assets');
var mongo_info  = require('../../../config').mongo;

var dbPort		= mongo_info.dbPort;
var dbHost 		= mongo_info.dbHost;
var dbName 		= mongo_info.dbName;


var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}, {w: 1}));
	db.open(function (e, d) {
		if (e) {
			i._err(e);
		} else {
			i._info('connected to database :: ' + dbName);
		}
	});

/*
 * COLLECTIONS
 */
var sigs		= db.collection('sigs');
var sigTests	= db.collection('sigTests');
var groups      = db.collection('groups');
var users       = db.collection('users');
var regressions	= db.collection('regressions');
var regressionpool = db.collection('regressionpool');

exports.sigs = function() {
	return sigs;
}

exports.sigTests = function() {
	return sigTests;
}

exports.groups = function() {
	return groups;
}

exports.users = function() {
	return users;
}

exports.regressions = function() {
	return regressions;
}

exports.regressionpool = function() {
	return regressionpool;
}

exports.db = function() {
	return db;
}

