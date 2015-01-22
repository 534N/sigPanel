angular.module('bookingService')
	.factory('Scan', ['$http',
		function($http) {
			return {			
				getSig: function() {
					return $http.get('/api/sigList');
				}
			}
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
	.factory('Load', ['$http',
		function($http) {
			return {
				
				setFileinfo: function(fileObj) {
					return $http({
						url: '/api/setfileinfo', 
						method: 'GET',
						params: {fileObj: fileObj}						
					});
				},

				loadSigs: function(platform, category, me, tec, sort) {
					console.log(platform)
					return $http({
						url: '/api/loadSigs/', 
						method: 'GET',
						params: {platform: platform, category: category, me: me, tec: tec, sort: sort}
					});
				},
				
				loadUsers: function(filter, me) {
					return $http({
						url: '/api/loadUsers', 
						method: 'GET',
						params: {filter: filter, me: me}
					});
				},

				updateSigTest: function(sigTest, me) {
					return $http({
						url: '/api/updateSigTest',
						method: 'POST',
						params: {sigTest: sigTest, me: me}
					});
				},

				loadAllSigs: function(me) {
					return $http({
						url: '/api/loadAllSigs/',
						method: 'GET',
						params: {me: me}
					});
				},

				removeTest: function(sigTest, me, rel, tid) {
					return $http({
						url: '/api/removeTest',
						method: 'POST',
						params: {sigTest: sigTest, me: me, rel: rel, tid: tid}
					});
				},

				loadSigTests: function(platform, category, sort) {
					return $http({
						url: '/api/loadSigTests',
						method: 'GET',
						params: {platform: platform, category: category, sort: sort}
					});
				},

				loadCategories: function(platform, object) {
					return $http({
						url: '/api/loadCategories/', 
						method: 'GET',
						params: {platform: platform, object: object}
					});
				},

				loadComponents: function(platform, category, object) {
					return $http({
						url: '/api/loadComponents/', 
						method: 'GET',
						params: {platform: platform, category: category, object: object}
					});
				},

				loadPlatforms: function(platform, category) {
					return $http({
						url: '/api/loadPlatforms/', 
						method: 'GET',
						params: {platform: platform, category: category}
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

				loadAllSigTests: function() {
					return $http({
						url: '/api/loadAllSigTests',
						method: 'GET'
					});
				},

				runRegressionM: function(sid, rel) {
					return $http({
						url: '/api/runRegressionM',
						method: 'GET',
						params: {sid: sid, rel: rel}
					})
				}, 

				regressionResults: function() {
					return $http({
						url: '/api/regressionResults',
						method: 'GET'
					})
				},

				get: function(filter, me, sort) {
					return $http({
						url: '/api/loadNodes', 
						method: 'GET',
						params: {filter: filter, me: me, sort: sort}
					});
				},

				getType: function() {
					return $http({
						url: '/api/loadTypes/',
						method: 'GET'
					});
				},

				loadAllSig: function(options) {
					return $http({
						url: '/api/loadAllSig',
						method: 'GET',
						params: options
					})
				},

				resetTsObjs: function() {
					return $http({
						url: '/api/resetTsObjs',
						method: 'GET'
					})
				},

				repeatCheck: function(filename) {
					return $http({
						url: '/api/repeatcheck',
						method: 'GET',
						params: {filename: filename}
					})
				},

				insertFile: function(file) {
					return $http({
						url: '/api/insertfile',
						method: 'GET',
						params: {file: file}
					})
				},

				getFileinfo: function(platform, release, file) {
					return $http({
						url: '/api/getfileinfo',
						method: 'GET',
						params: {platform: platform, release: release, file: file}
					})
				},

				parseMatch: function(platform, release, file) {
					return $http({
						url: '/api/parsematch',
						method: 'GET',
						params: {platform: platform, release: release, file: file}
					})
				},

				getPoolStructure: function() {
					return $http({
						url: '/api/getPoolStructure',
						method: 'GET'
					})
				}
			}
		}
	])
	
	