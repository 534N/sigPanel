var exec 		= require('child_process').exec;

module.exports = function() {

	this.authenticate = function(csl, cip, res) {
		exec('curl -k -v https://138.120.243.17:443/api.php/auth/'+csl+'/'+encodeURIComponent(cip), function(err, stdout, stderr) { 
			console.log(stdout)
			res.json(stdout); 
		});
	}

	this.verify = function(csl, email, res) {
		exec('curl -k -v https://138.120.243.17:443/api.php/verify/'+csl+'/'+email, function(err, stdout, stderr) { 
			console.log(stdout)
			res.json(stdout); 
		});
	}

}