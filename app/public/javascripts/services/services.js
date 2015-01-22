var bookingService = angular.module('bookingService', [
	'btford.socket-io'
]);

bookingService
	.factory('_', function() {
		return window._;
	})
	.factory('SCCR', ['$http', 
		function($http) {
			return {
				getPlayers: function(filter) {
					return $http({
						url: '/api/playerList',
						method: 'GET',
						params: {filter: filter}
					});
				},
				addPlayer: function(player) {
					return $http({
						url: '/api/addPlayer',
						method: 'POST',
						params: {player: player}
					})
				},
				payBalance: function(player, date) {
					return $http({
						url: '/api/payBalance',
						method: 'POST',
						params: {player: player, date: date}
					})
				},
				remind: function(players, monGames, wedGames) {
					console.log(players)
					return $http({
						url: '/api/remind',
						method: 'GET',
						params: {players: players, monGames: monGames, wedGames: wedGames}
					})
				}

			}
		}
	])
	.factory('Scan', ['$http',
		function($http) {
			return {
				get: function() {
					return $http.get('/api/nodeList');
				},

				getSig: function() {
					return $http.get('/api/sigList');
				}
			}
		}
	])
	.factory('Ping', ['$http', 
		function($http) {
			return {
				get: function(node) {
					return $http({
						url: '/api/pingNode',
						method: 'GET',
						params: {node: node}
					});
				}
			};
		}
	])
	.factory('PCRE', ['$http', 
		function($http) {
			return {
				regexTest: function(regex, context, rel, sid, tid) {
					return $http({
						url: '/api/regexText',
						method: 'GET',
						params: {regex: regex, context: context, release: rel, sid: sid, tid: tid}
					});
				}
			};
		}
	])
	.factory('Load', ['$http',
		function($http) {
			return {
				get: function(filter, me, sort) {
					return $http({
						url: '/api/loadNodes', 
						method: 'GET',
						params: {filter: filter, me: me, sort: sort}
					});
				},

				getSig: function(platform, category, me, tec, sort) {
					return $http({
						url: '/api/loadSigs/', 
						method: 'GET',
						params: {platform: platform, category: category, me: me, tec: tec, sort: sort}
					});
				},
				
				getUsers: function(filter, me) {
					return $http({
						url: '/api/loadUsers', 
						method: 'GET',
						params: {filter: filter, me: me}
					});
				},

				getType: function() {
					return $http({
						url: '/api/loadTypes/',
						method: 'GET'
					});
				},

				updateSigTest: function(sigTest, me) {
					return $http({
						url: '/api/updateSigTest',
						method: 'POST',
						params: {sigTest: sigTest, me: me}
					});
				},

				getAllSigs: function(me) {
					return $http({
						url: '/api/loadAllSigs/',
						method: 'GET',
						params: {me: me}
					});
				},

				removeTest: function(rel, tid) {
					return $http({
						url: '/api/removeTest',
						method: 'POST',
						params: {rel: rel, tid: tid}
					});
				},

				getSigTests: function(platform, category, sort) {
					return $http({
						url: '/api/loadSigTests',
						method: 'GET',
						params: {platform: platform, category: category, sort: sort}
					});
				},

				getCat: function(platform) {
					return $http({
						url: '/api/loadCats/', 
						method: 'GET',
						params: {platform: platform}
					});
				},

				addSignature: function(options) {
					return $http({
						url: '/api/addSignature',
						method: 'POST',
						params: options
					});
				},

				updateSignature: function(options) {
					return $http({
						url: '/api/updateSignature',
						method: 'POST',
						params: options
					});
				},

				getType: function() {
					return $http({
						url: '/api/loadTypes/',
						method: 'GET'
					});
				},



			}
		}
	])
	.factory('Book', ['$http',
		function($http) {
			return {
				post: function(node, owner, type, options) {
					if (type == 'book') {
						return $http({
							url: '/api/bookNode',
							method: 'POST',
							params: {node: node, owner: owner, options: options}
						});
					} else if (type == 'release') {
						return $http({
							url: '/api/releaseNode',
							method: 'POST',
							params: {node: node}
						});
					}
				},

				update: function(node) {
					return $http({
						url: '/api/updateNode',
						method: 'POST',
						params: {node: node}
					});
				},
				add: function(node) {
					return $http({
						url: '/api/addNode',
						method: 'POST',
						params: {node: node}
					});
				}
			}
		}
	])
	.factory('mySharedService', ['$rootScope', 
		function($rootScope) {
			var sharedService = {};

		    sharedService.message = '';

		    sharedService.prepForBroadcast = function(msg) {
		        this.message = msg;
		        this.broadcastItem();
		    };

		    sharedService.broadcastItem = function() {
		    	console.log('broadcasting...')
		        $rootScope.$broadcast('handleBroadcast');
		    };

		    return sharedService;
		}
	])
	.factory('mySocket', function(socketFactory) {
		var socket = socketFactory();
		socket.forward('broadcast');
		return socket;
	})
	.factory('FS', ['$http',
		function($http) {
			return {
				removeFile: function(file) {
					return $http({
						url: '/api/removeFile',
						method: 'POST',
						params: {file: file}
					})
				}
			};
		}
	])
	.factory('SCRIPT', ['$http', 
		function($http) {
			return {
				getAllScripts: function() {
					return $http({
						url: '/api/getAllScripts',
						method: 'GET'
					})
				},
				fanCheck: function(host, username, password, command, regex, interval, user) {
					return $http({
						url: '/api/fanCheck',
						method: 'GET',
						params: {host: host, username: username, password: password, command: command, regex: regex, interval: interval, user: user}
					})
				},
				stop: function() {
					return $http({
						url: '/api/stop',
						method: 'GET'
					})
				}
				// getAllScript: function(host, username, password) {
				// 	return $http({
				// 		url: '/api/fanCheck',
				// 		method: 'GET',
				// 		params: {host: host, username: username, password: password}
				// 	})
				// }
			}
		}
	])
	.factory('Browser', ['$window', 
		function($window) {
			return {
				type: function() {
					var userAgent = $window.navigator.userAgent;
					var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};

			        for(var key in browsers) {
			            if (browsers[key].test(userAgent)) {
			                return key;
			            }
			       	};

			       	return 'unknown';
			    }
			}
		}
	]);
	