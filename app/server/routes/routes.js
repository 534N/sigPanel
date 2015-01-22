module.exports = function(app) {
/*
 * Default page
 */

	app.get('/', function(req, res) {
		res.render('sig', {title: 'Signatures'});
	});

	app.get('/sig', function(req, res) {
		console.log('---->', req.cookies);
		res.render('sig', {title: 'Signatures', name: req.cookies});
	});

	app.get('/userPanel', function(req, res) {
		res.render('userPanel', {title: 'User Panel'})
	});

/*
 * All others
 */
 	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

}
