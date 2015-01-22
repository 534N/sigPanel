
angular.module('bookingController')

	.controller('ldapCtrl', ['$scope', 'LDAP', 'flash', '$cookies', '$cookieStore', 'Cookie', '$rootScope',
		function($scope, LDAP, flash, $cookies, $cookieStore, Cookie, $rootScope) {

			$scope.auth = function() {				
					console.log($scope.user);
					Cookie.ifexpire()
						.success(function(data) {
							if(data == 'expired') {
								$scope.user = {};											
							} else {
								$scope.user = data[0];
								console.log($scope.user);								
							}						
						});
			}

			//Log in
			$scope.authenticate = function() {
				LDAP.authenticate($scope.csl, $scope.cip)
					.success(function(data) {
						var userObj = JSON.parse(data);
						if(userObj !== '0') {
							LDAP.login($scope.csl)
								.success(function(data) {
									if(data=='needsignup') {
										flash.success = 'You need sign up first';
									} else {
										flash.success = 'Log in successfully';									
										//move this part in API shortly
										console.log(',,,,,,', data);
										console.log()
										$scope.user = data[0];
										window.location.href = '/sig';
									}
								});		
					
						} else {
							flash.success = 'Invalid password or username!';	
						}
					})
			}

			//Sign up
			$scope.verify = function() {
				LDAP.verify($scope.csl, $scope.email)
					.success(function(data) {
						var userObj = JSON.parse(data);
						if(userObj !== '0') {
							var info = userObj.split('::');
							var fullname = info[1];
							var lastname = fullname.split(' ')[0];
							var firstname = fullname.split(' ')[1];
							var country = info[3];
							var location = info[4];							
							var user = {
								firstname 	: firstname,
								lastname 	: lastname,
								country     : country,
								location    : location,							
								email 		: $scope.email,
								csl 		: $scope.csl
							};
							LDAP.signup(user)
								.success(function(data) {
									console.log(data);
									flash.success = 'Sign up successfully';						
								});							
						} else {
							flash.success = 'You shall not pass!';	
						}
					})
			}

			//Log out
			$scope.logout = function() {
				LDAP.logout($scope.user.csl)
					.success(function(data) {
						console.log('log out successfully');
						$scope.user = {};						
					})
			}

		}
	])	
	.controller('browserCtrl', ['$scope', 'Browser', '$location',
		function($scope, Browser, $location) {
			$scope.host = $location.host();
			var type = Browser.type();
			if (type == 'firefox' || type == 'internet explorer' || type == 'unknown') {
				$scope.showlink = true;
			} else {
				$scope.showlink = false;
			}
		}
	])
	.controller('viewCtrl', ['$scope', '$location',
		function($scope, $location) {

			if($location.path() == '/login' || $location.path() == '/signup') {
				$scope.hideScroll = 'hideScroll';
			} else {
				$scope.hideScroll = '';
			}
		}
	])
	.controller('navCtrl', ['$scope', '$location',
		function($scope, $location) {
			$scope.isActive = function(route) {
				$scope.updateSubNavClass();
				return route === $location.path();
			}
			$scope.updateSubNavClass = function() {
				var res = $location.path().match(/\/loadNodes\/(\S+)/)
				if (res) {
					$scope.subNavClass = res[1];
				}

				var res = $location.path().match(/\/labMap\/(\S+)/)
				if (res) {
					$scope.subNavClass = res[1];
				}
			}
			$scope.updateSubNavClass();
		}
	])
	.controller('helpCtrl', ['$scope', 
		function($scope) {
			$scope.tooltip = {
				'signup': 'Click to sign up'
			}
		}
	])
	.controller('modalCtrl', ['$scope', 'mySharedService',
		function($scope, mySharedService) {
			$scope.setNode = function(node) {
				$scope.node = node;
			};
			$scope.setSig = function(sig) {
				console.log(sig)
				$scope.sig = sig;
			};
			$scope.setNodeForUser = function(node, user) {
				$scope.node = node;
				$scope.ipClass = ($scope.node.status == 'live') ? 'label-success' : 'label-default'; 
				$scope.startDate = new Date();
				$scope.endDate = $scope.node.end ? new Date(Date.parse($scope.node.end)) : null;
				if (node.hasOwnProperty('owner')) {
					$scope.owner = ($scope.node.owner == user) ? 'me' : $scope.node.owner;
				}
			}
			$scope.nodeIsMine = function(node) {
				if (node.hasOwnProperty('owner')) {
					if (node.owner == $scope.user.csl) {
						return true;
					}
				}
				return false;
			}
			if ($scope.node) {
				$scope.ipClass = ($scope.node.status == 'live') ? 'label-success' : 'label-default'; 
				$scope.owner = ($scope.node.owner == $scope.user.csl) ? 'me' : $scope.node.owner;
				$scope.startDate = new Date();
				$scope.endDate = $scope.node.end ? new Date(Date.parse($scope.node.end)) : null;
			}
			
		}
	]);
	
