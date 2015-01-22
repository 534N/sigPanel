
/**
 * Module dependencies.
 */
var express 		= require('express'),
	MemoryStore 	= express.session.MemoryStore,
	app 			= express(),
	sessionStore 	= new MemoryStore();

/* style */
var stylus 			= require('stylus'),
	nib 			= require('nib');
/* system */ 	
var http 			= require('http');
var path 			= require('path');

var i 				= require('./app/server/modules/assets');

function compile(str, path) {
  	return stylus(str)
	    .set('filename', path)
	    .use(nib())
}

app.configure(function() {
	// all environments
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/app/server/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.session(
		{
			store: sessionStore, 
			secret: 'secret', 
			key: 'cookie'
	   	}
    ));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	// 
	app.use(stylus.middleware({
		src: 		__dirname + '/app/public',
		compile: 	compile
	}));
	app.use(express.static(path.join(__dirname, '/app/public')));
	// app.use(app.router);

});

app.configure('development', function() {
	app.use(express.errorHandler());
});

//Mongod lists:
var io = require('socket.io').listen(app.listen(app.get('port')));
var RP = require('./app/server/modules/regex-parser');
var SM = require('./app/server/modules/signature-manager');
var GAM = require('./app/server/modules/group-access-manager');
var UM = require('./app/server/modules/user-manager');
var LDAP = require('./app/server/modules/ldap');
var AM = require('./app/server/modules/auth-manager');
var UP = require('./app/server/modules/upload');

/**
* Routes
*/
require('./app/server/routes/partials')(app);
 
require('./app/server/routes/scan-api')(app, io, RP, SM, UM, GAM, LDAP, AM, UP);

require('./app/server/routes/routes')(app);


// setInterval(function(){
// setTimeout(function() {
// 	new SM().runAll(RP);

// }, 500)
// }, 1000)


/*
* EXPECT IO 
*/

io.sockets.on('connection', function (socket) {
	console.log('io connection')
	var Connection 	= require('ssh2');
	var expect 		= require('stream-expect');
	var defaultPort = 22;
	var c 			= new Connection();
	var init_connect = false, 
		init_uid = '';

	var reformat_output = function(_in, token) {
		return _in.replace('\r\n'+token, '');
	};

	c.on('ready', function() {
	  	c.shell(function(err, stream) {
	  		console.log('STREAM: ', stream)
		    if (err) throw err
		    /* Use ssh Connection as read and write stream */
			var exp = expect.createExpect(stream);

			/* make sure we do not get hold up by long output */
			if (init_connect) {
				init_connect = false;
				var uid = init_uid;
				init_uid = '';

				exp.send('env no more' + '\n');
		    	exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
		    		if (err) io.sockets.emit('error', { message: 'SOMETHING IS WRONG WITH THE SESSION :: ' + err});
			        else io.sockets.emit(uid, { cmd: 'env no more', prompt: match[0], output: reformat_output(output, match[0]) });
		    	});
			}

	    	socket.on('sendchat', function(data) {
	    		if (data.cmd == 'logout') {
	    			console.log('logging out')
		    		socket.emit('endchat', { message: 'LOGGED OUT' });
					socket.disconnect();
					// return false;
		    	}
	    		exp.send(data.cmd + '\n');
	    		exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
		    		if (err) io.sockets.emit('error', { message: 'SOMETHING IS WRONG WITH THE SESSION :: ' + err});
			        else io.sockets.emit(data.uid, { cmd: data.cmd, prompt: match[0], output: reformat_output(output, match[0]) });
		    	});
	    	})
		})
	});

	socket.on('conn_node', function(data) {
		console.log('connecting node', data.node.ip)

		if (!c._host) {
			console.log('-!!ready!!-')
			c.connect({
				host: data.node.ip,
				port: data.node.port ? data.node.port : defaultPort,
				username: data.node.username,
				password: data.node.password
			});
			init_connect = true;
			init_uid = data.uid;
		}
		
		// init_connect = true;
		// init_uid = data.uid;
	});
});

