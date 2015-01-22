var crypto 		= require('crypto');
var moment 		= require('moment');
var db 			= require('./model');
var accounts 	= db.accounts();

exports.autoLogin = function(email, pass, callback) {
	accounts.findOne({email:email}, function(e, o) {
		if (o) {
			o.pass == pass ? callback(o) : callback(null);
		} else {
			callback(null);
		}
	});
};

exports.manulLogin = function(email, pass, callback) {
	accounts.findOne({email:email}, function(e, o) {
		if (o == null) {
			callback('user-not-found');
		} else {
			validatePassword(pass, o.pass, function(err, res) {
				if (res) {
					callback(null, o);
				} else {
					callback('invalid-password');
				}
			});
		}
	});
};

exports.addNewAccount = function(newData, callback) {
	accounts.findOne({email:newData.email}, function(e, o) {
		if (o) {
			callback('email-taken');
		} else {
			saltAndHash(newData.pass, function(hash){
				newData.pass = hash;
			// append date stamp when record was created //
				newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
				accounts.insert(newData, {safe: true}, callback);
			});
		}
	});
};

exports.updateAccount = function(newData, callback) {
	accounts.findOne({user:newData.user}, function(e, o){
		o.name 		= newData.name;
		o.email 	= newData.email;

		if (newData.pass == ''){
			accounts.save(o, {safe: true}, function(err) {
				if (err) callback(err);
				else callback(null, o);
			});
		}	else{
			saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				accounts.save(o, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, o);
				});
			});
		}
	});
};

exports.updatePassword = function(email, newPass, callback) {
	accounts.findOne({email:email}, function(e, o) {
		if (e) {
			callback(e, null);
		} else {
			saltAndHash(newPass, function(hash) {
				o.pass = hash;
				accounts.save(o, {safe: true}, callback);
			});
		}
	});
};

exports.deleteAccount = function(id, callback) {
	accounts.remove({_id: getObjectId(id)}, callback);
};

exports.getAccountByEmail = function(email, callback) {
	accounts.findOne({email:email}, function(e, o) {callback(o); });
};

exports.validateResetLink = function(email, passHash, callback) {
	accounts.find({ $and: [{
		email:email, 
		pass: passHash
	}] }, function(e, o) {
		callback(o? 'ok' : null );
	});
};

exports.getAllRecords = function(callback) {
	accounts.find().toArray(
		function(e, res) {
			if (e) callback(e);
			else callback(null, res);
		}
	);
};

exports.delAllRecords = function(callback) {
	accounts.remove({}, callback); // reset accounts collection for testing //
};


/**
*
* NODE LIST
*
*/



/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
};

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
};

var saltAndHash = function(pass, callback) {
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
};

var validatePassword = function(plainPass, hashedPass, callback) {
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
};

/* auxiliary methods */

var getObjectId = function(id) {
	return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
};

var findById = function(id, callback) {
	accounts.findOne({_id: getObjectId(id)},
		function(e, res) {
			if (e) callback(e);
			else callback(null, res);
		}
	);
};

var findByMultipleFields = function(a, callback) {
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
			if (e) callback(e);
			else callback(null, results);
		}
	);
};


