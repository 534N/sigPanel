var bookingApp = angular.module('bookingApp', [
	'ngRoute',
	'bookingController',
	'bookingService',
	'bookingFilter',
	'bookingDirective',
	'd3',
	'ngQuickDate',
	'UserApp',
	'ngProgress',
	'ngAnimate',
	'angular-flash.service', 
	'angular-flash.flash-alert-directive',
	'mgcrea.ngStrap',
	'mgcrea.ngStrap.helpers.dimensions',
	'angularSpinner',
	'angularFileUpload',
	'monospaced.elastic',
	'timer',
	'ngTable'
]);

bookingApp
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
					// templateUrl: '../partials/loadNode',
					// controller: 'loadNode'
				})
				.when('/people', {
					templateUrl: '../partials/people',
					login: true
				})
				.when('/hc', {
					templateUrl: '../partials/upload',
					login: true
				})
				.when('/login', {
					templateUrl: '../partials/login', 
					login: true
				})
				.when('/signup', {
					templateUrl: '../partials/signup', 
					public: true
				})
				.when('/nodeList', {
					templateUrl: '../partials/node-list',
					controller: 'getNodeList'
				})
				.when('/sigList', {
					templateUrl: '../partials/sig-list',
					controller: 'getSigList',
					login: true
				})
				.when('/loadNodes/:filter', {
					templateUrl: '../partials/loadNode',
					controller: 'loadNode',
					public: true
				})
				.when('/labMap/:filter', {
					templateUrl: '../partials/labMap',
					controller: 'labMapCtrl',
					public: true
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
				.when('/scripts', {
					templateUrl: '../partials/scripts',
					controller: 'scriptContoller',
					public: true
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
				.otherwise({ redirectTo: '/loadNodes/free'});
		}
	])
	.config(['ngQuickDateDefaultsProvider', 
		function(ngQuickDateDefaultsProvider) {
			return ngQuickDateDefaultsProvider.set({
				closeButtonHtml: "<i class='pe-7s-close pe-2x pe-va'></i>",
			    buttonIconHtml: "",
			    nextLinkHtml: "<i class='pe-7s-angle-right pe-2x pe-va'></i>",
			    prevLinkHtml: "<i class='pe-7s-angle-left pe-2x pe-va'></i>",
			    // Take advantage of Sugar.js date parsing
			    parseDateFunction: function(str) {
			      	d = Date.create(str);
			      	return d.isValid() ? d : null;
			    }
			})
		}
	])
	.run(function(user) {
		user.onAuthenticationSuccess(function() {
		// hide popup, do transition, ...
		history.back();
		});
		user.init({ appId: '53975ae892d2f' });
		user.onAuthenticationSuccess(function() {
			// hide popup, do transition, ...
			history.back();
		});
	});