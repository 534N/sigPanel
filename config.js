// 
// DEV
// 
var mysql_dev = {
	port: 		'3306',
	host: 		'138.120.135.41',
	user: 		'root',
	password: 	'tigris',
	database: 	'tshelp',
	insecureAuth: true
};

var mongo_dev = {
	dbPort: 	27017,
	dbHost: 	'138.120.131.85',
	dbName: 	'sigPanel'
};

var php_path_dev = '/usr/bin/';
var regression_pool_path_dev = __dirname + '/app/public/uploads/pool';

// 
// PRODUCTION
// 
var mysql_prod = {
	port: 		'3306',
	host: 		'fr712usql001.zeu.alcatel-lucent.com',
	user: 		'tshelp',	
	password: 	'bb5VPVLS',
	database: 	'tshelp',
	insecureAuth: true
};

var mongo_prod = {
	dbPort: 	27017,
	dbHost: 	'localhost',
	dbName: 	'sigPanel'
};

var php_path_prod = '/tools/httpd/bin/';
var regression_pool_path_prod = '../../upload/pool';


// 
// 
// 
exports.mysql 		= global.process.env.NODE_ENV === 'production' ? mysql_prod : mysql_dev;
exports.mongo 		= global.process.env.NODE_ENV === 'production' ? mongo_prod : mongo_dev;
exports.php 		= global.process.env.NODE_ENV === 'production' ? php_path_prod : php_path_dev;
exports.reg_pool 	= global.process.env.NODE_ENV === 'production' ? regression_pool_path_prod : regression_pool_path_dev;
