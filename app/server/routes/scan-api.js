
var tsObjs = {};

module.exports = function(app, io, RP, SM, UM, GAM, LDAP, AM, UP) {

	// 
	// LDAP
	// 
	app.get('/api/ldap', function (req, res) {
		var csl = req.param('csl'),
			cip = req.param('cip');
		new LDAP().authenticate(csl, cip, res);
	});
	app.get('/api/signupLdap', function (req, res) {
		var csl = req.param('csl'),
			email = req.param('email');
		new LDAP().verify(csl, email, res);
	});
	// 
	// 
	// GROUP PANEL 
	app.get('/api/loadGroups', function (req, res) {		
		var user = JSON.parse(req.param('user'));
		new GAM().loadGroups(user, res);
	});
	
	// 
	// 
	// USER PANEL 
	// 
	app.get('/api/loadUsers', function (req, res) {		
		var filter = req.param('filter'),
				me = JSON.parse(req.param('me'));
		console.log(me);
		new UM().loadUsers(filter, me, res);
	});
	app.post('/api/updateUser', function (req, res) {
		var user = JSON.parse(req.param('user'));
		new UM().updateUser(user, res);
	});

	// 
	// 
	// SIGNATURE
	// 

	app.get('/api/regressionResults', function (req, res) {
		new SM().regressionResults(res);
	})
	app.get('/api/runRegressionM', function (req, res) {
		var rel = req.param('rel'),
			sid = req.param('sid');

		new SM().runRegressionM(sid, RP, rel, res);
	})
	app.get('/api/loadAllSigTests', function (req, res) {
		new SM().loadAllSigTests(res);
	})
	app.post('/api/removeTest', function (req, res) {
		var sigTest = JSON.parse(req.param('sigTest')),
			me  = req.param('me'),
			rel = req.param('rel'),
			tid = req.param('tid');
		new SM().removeTest(sigTest, me, rel, tid, res);
	});
	app.post('/api/updateSigTest', function (req, res) {
		var sigTest = JSON.parse(req.param('sigTest')),
			me = JSON.parse(req.param('me'));
		new SM().updateSigTest(sigTest, me, res);
	});
	app.post('/api/updateSig', function (req, res) {
		var sig = JSON.parse(req.param('sig'));
		new SM().updateSig(sig.signature, res);
	});
	app.get('/api/sigList', function (req, res) {
		new SM().scanAllSigs('7x50', res)
	});
	app.get('/api/loadCategories', function (req, res) {
		var platform = req.param('platform'),
			object = req.param('object');

		new SM().loadCategories(platform, object, res);
	});
	app.get('/api/loadComponents', function (req, res) {
		var platform = req.param('platform'),
			category = req.param('category'),
			object = req.param('object');

		new SM().loadComponents(platform, category, object, res);
	});
	app.get('/api/loadPlatforms', function (req, res) {
		new SM().loadPlatforms(res);
	});
	app.get('/api/loadSigTests', function (req, res) {
		var platform = req.param('platform'),
			category = req.param('category'),
			tec = req.param('tec'),
			sort = JSON.parse(req.param('sort'));
		new SM().loadSigTests(platform, category, tec, sort, res);
	});
	app.get('/api/loadSigs', function (req, res) {
		var platform = req.param('platform'),
			category = req.param('category'),
			me = req.param('me'),
			tec = req.param('tec'),
			sort = JSON.parse(req.param('sort'));
		new SM().loadSigs(platform, category, me, tec, sort, res);
	});
	app.get('/api/loadAllSigs', function (req, res) {
		var me = req.param('me');
		new SM().loadAllSigs(me, res);
	});	
	app.post('/api/addSignature', function (req, res) {
		new SM().addSignature(req, res);
	});
	app.post('/api/updateSignature', function (req, res) {
		new SM().updateSignature(req, res);
	});
	// 
	// AUTH
	// 
	app.get('/api/login', function (req, res) {
		var csl = req.param('csl');
		new AM().login(csl, res);
	});
	app.get('/api/signup', function (req, res) {
		var user = req.param('user');
		new AM().signup(user, res);
	});	
	app.get('/api/logout', function (req, res) {
		var csl = req.param('csl');
		new AM().logout(csl, res);
	});	
	app.get('/api/ifexpire', function (req, res) {
		// var cookieobject = req.cookies.mycookie[0];
		// console.log("cookie here: ", cookieobject);
		// console.log("cookieobject is: ", cookieobject);
		new AM().ifexpire(req.cookies, res);
	});
	app.post('/api/updateSignature', function (req, res) {
		new SM().updateSignature(req, res);
	});
	
	// 
	// 
	// Upload
	// 
	app.post('/api/upload', function (req, res) {
		var commands = {};
		new UP().uploadFile(req.files.file, req.body.user, JSON.parse(req.body.fileObj), commands, tsObjs, RP, res);
	});
	app.post('/api/removeFile', function (req, res) {
		var file = JSON.parse(req.param('file'));
		console.log(file.file.name)
		// console.log(req.param('file'))
	});
	app.get('/api/getPoolStructure', function (req, res) {
		new UP().getPoolStructure(res);
	});
	app.get('/api/repeatcheck', function (req, res) {
		var filename = req.param('filename');
		new UP().repeatCheck(filename, res);
	});
	app.get('/api/insertfile', function (req, res) {
		var file = JSON.parse(req.param('file'));
		console.log(">>>>>>", typeof(file));
		new UP().insertFile(file, res);
	});
	app.get('/api/getfileinfo', function (req, res) {
		var platform = req.param('platform'),
			release  = req.param('release'),
			file 	 = req.param('file');
		new UP().getFileinfo(platform, release, file, res);
	});
	app.get('/api/downloadfile', function (req, res) {
		var file = req.param('file');
		new UP().downloadFile(file, res);
	});
	app.get('/api/parsematch', function (req, res) {
		var platform = req.param('platform'),
			release  = req.param('release'),
			file 	 = req.param('file');
		// new UP().parseMatch(platform, release, file, RP, res);
		new SM().parseMatch(platform, release, file, RP, res);
	});			
	// 
	// 
	// REGEX
	// 
	app.get('/api/regexText', function (req, res) {
		var regex 	= req.param('regex'),
			context	= req.param('context'),
			release = req.param('release'),
			sid = parseInt(req.param('sid')),
			tid = parseInt(req.param('tid'));

		new RP().evalRegex(regex, context, release, sid, tid, res);
	});
	
	
	
	

	
}