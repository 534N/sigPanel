
angular.module('bookingApp')
	.config(['flashProvider',
		function(flashProvider) {
			flashProvider.successClassnames.push('alert-success');
			flashProvider.infoClassnames.push('alert-info');
			flashProvider.warnClassnames.push('alert-warning');
			flashProvider.errorClassnames.push('alert-danger');
		}
	])
	.config(['$routeProvider', 
		function($routeProvider) {
			$routeProvider
				.when('/', {
					redirectTo: '/loadSigs/7x50'
				})
				.when('/login', {  //no longer needed after this step
					templateUrl: '../partials/login', 
					login: true
				})
				.when('/ldap', {
					templateUrl: '../partials/ldap', 
					controller: 'ldapCtrl',
					login: true	
				})
				.when('/signup-ldap', {
					templateUrl: '../partials/signup-ldap', 
					controller: 'ldapCtrl',
					login: true	
				})
				.when('/signup', {
					templateUrl: '../partials/signup', 
					public: true
				})
				.when('/sigList', {
					templateUrl: '../partials/sig-list',
					controller: 'getSigList',
					login: true
				})
				.when('/regressions', {
					templateUrl: '../partials/regressions',
					controller: 'regressionCtrl',
					login: true
				})
				.when('/sigTests', {
					templateUrl: '../partials/sig-tests',
					controller: 'sigTests',
					login: true
				})
				.when('/loadSigs/:platform/:category', {
					templateUrl: '../partials/loadSig',
					controller: 'loadSig',
					login: true
				})
				.when('/loadAllSigs', {
					templateUrl: '../partials/loadAllSig',
					controller: 'loadSig',
					login: true
				})
				.when('/addSig', {
					templateUrl: '../partials/addSig',
					controller: 'addSigCtrl',
					login: true
				})
				.when('/upload', {
					templateUrl: '../partials/upload',
					login: true
				})				
				.when('/loadUsers/:filter', {
					templateUrl: '../partials/loadUsers',
					controller: 'loadUsers',
					public: true					
				})
				.when('/admin/access_management', {
					templateUrl: '../partials/accessManage',
					controller: 'accessManage',
					public: true					
				})				
				.otherwise({ redirectTo: '/loadSigs/7x50'});
		}
	]);
	// .run(function(user) {
	// 	user.onAuthenticationSuccess(function() {
	// 	// hide popup, do transition, ...
	// 	history.back();
	// 	});
	// 	user.init({ appId: '53975ae892d2f' });
	// 	user.onAuthenticationSuccess(function() {
	// 		// hide popup, do transition, ...
	// 		history.back();
	// 	});
	// });