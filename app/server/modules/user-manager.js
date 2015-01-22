var db2 = require('./mysql').connection;

module.exports = function() {

    //load all the users under ALL USERS tab
	this.loadUsers = function(filter, me, res) {
        console.log(me);
        var queryString;
        if(me.properties.company.value === 'ALU') { // "ALU"
            switch(filter) {
                case 'all':
                    queryString = "SELECT a.*, b.group_id FROM portals AS a LEFT JOIN user_groups AS b on a.username = b.username";
                    break;
                case 'tec':
                    queryString = "SELECT a.*, b.group_id FROM portals AS a LEFT JOIN user_groups AS b on a.username = b.username WHERE b.group_id = 1";
                    break;
                case 'tac':
                    queryString = "SELECT a.*, b.group_id FROM portals AS a LEFT JOIN user_groups AS b on a.username = b.username WHERE b.group_id = 2";
                    break;
                case 'ca':
                    queryString = "SELECT a.*, b.group_id FROM portals AS a LEFT JOIN user_groups AS b on a.username = b.username WHERE b.group_id = 3";
                    break;
                default:
            }
        } else {    // else situations
            switch(filter) {
                case 'all':
                    queryString = "SELECT a.*, b.group_id FROM portals AS a LEFT JOIN user_groups AS b on a.username = b.username WHERE a.customer = '"+ me.properties.company.value + "'";
                    break;
                case 'tec':
                    queryString = "SELECT a.*, b.group_id FROM portals AS a LEFT JOIN user_groups AS b on a.username = b.username WHERE b.group_id = 1 AND a.customer = '"+ me.properties.company.value + "'";
                    break;
                case 'tac':
                    queryString = "SELECT a.*, b.group_id FROM portals AS a LEFT JOIN user_groups AS b on a.username = b.username WHERE b.group_id = 2 AND a.customer = '"+ me.properties.company.value + "'";
                    break;
                case 'ca':
                    queryString = "SELECT a.*, b.group_id FROM portals AS a LEFT JOIN user_groups AS b on a.username = b.username WHERE b.group_id = 3 AND a.customer = '"+ me.properties.company.value + "'";
                    break;
                default:
            }            
        }
		db2.query(queryString, function(err, rows) {
            if (err) throw err;
    		res.json(rows);
		});
	}

    //update users through the EDIT USER dialog
    this.updateUser = function(user, res) {
        //Update the "portal" table
        var queryString1 = "UPDATE portals SET firstname = '" + user.firstname + "', lastname = '" + user.lastname + "', customer = '" + user.customer + "', email = '" + user.email + "' where username = '" + user.username + "'";
        //Update the "user_groups" table
        var queryString2 = "UPDATE user_groups SET group_id = " + user.group_id + " WHERE username = '" + user.username + "'";
        db2.query(queryString1, function(err, rows) {
            console.log(queryString1);
            if (err) throw err;
            res.json(rows);
        });
        db2.query(queryString2, function(err, rows) {
            console.log(queryString2);
            if (err) throw err;
            res.json(rows);
        });               
    }
}