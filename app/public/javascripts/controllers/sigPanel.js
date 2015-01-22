
angular.module('bookingController')
	
	.controller('getSigList', ['$scope', '$http', 'Scan', 'mySocket', '$location',
		function($scope, $http, Scan, mySocket, $location){
			Scan.getSig()
				.success(function(data) {
					$scope.signatures = data;
					console.log(data)
				})
		}
	])
	.controller('sigTests', ['$scope', 'Load', '$q',
		function($scope, Load, $q) {
			var loadUser = function() {
				var deferred = $q.defer();
				setTimeout(function() {
					deferred.resolve($scope.user.csl)
				}, 500);
				return deferred.promise;
			}

			loadUser()
				.then(function(result) {
					$scope.allSigTests = {};
					Load.loadAllSigTests()
						.success(function(data) {
							console.log(data)
							data.forEach(function(rec) {
								$scope.allSigTests[rec.sid] = rec;
							});

							Load.loadAllSigs(result)
								.success(function(data) {
									console.log(data)
									$scope.allSigs = data;
								})
						})
				})
			
			
			
		}
	])
	.controller('regressionCtrl', ['$scope', 'Load', '$http',
		function($scope, Load, $http) {
			$scope.status = {};
			var regressions = {};

			// $http.get('test.json').success(function(data) {
		 //    	console.log(data)
		 //    	$scope.regressions = data[0];
			// 	$scope.sigInfo = data[1];
			// 	$scope.overall = data[2];
		 //    });
			Load.regressionResults()
				.success(function(data) {
					console.log(data)
					$scope.regressions = data[0];
					$scope.sigInfo = data[1];
					$scope.overall = data[2];
				})

			$scope.setData = function(platform, rel, file, data, type) {
				$scope.infoArray = data;
	            $scope.filename  = platform+'/'+rel+'/'+file;
	            $scope.fail 	 = (type == "fail") ? true : false;
	            console.log(type, $scope.fail)
			}

			$scope.prettify = function(info) {
				info['pcontext'] = info.context.replace(/_LBR_/g, '\r\n');
				// console.log($scope.pcontext)
			}

            $scope.decodeRegex = function(regex) {
                if(regex) {
                    // 
                    // decoding regex string
                    // 
                    regex   = regex.replace(/_bs_/g, '\\');
                    regex   = regex.replace(/_fs_/g, '\/');
                    regex   = regex.replace(/_space_/g, ' ');
                    regex   = regex.replace(/_ob_/g, '\(');
                    regex   = regex.replace(/_cb_/g, '\)');
                    regex   = regex.replace(/_qm_/g, '\?');
                    regex   = regex.replace(/_cl_/g, '\:');
                    regex   = regex.replace(/_plus_/g, '\+');
                    regex   = regex.replace(/_aob_/g, '\<');
                    regex   = regex.replace(/_acb_/g, '\>');
                    regex   = regex.replace(/_sob_/g, '\[');
                    regex   = regex.replace(/_scb_/g, '\]');
                    regex   = regex.replace(/_cob_/g, '\{');
                    regex   = regex.replace(/_ccb_/g, '\}');
                    regex   = regex.replace(/_dot_/g, '\.');
                    regex   = regex.replace(/_star_/g, '\*');
                    regex   = regex.replace(/_cma_/g, '\,');
                    regex   = regex.replace(/_bar_/g, '\|');
                }
                $scope.regex = regex;
            }

			$scope.toggleMe = function(date, sid, platform, rel) {
				if ((typeof(sid) != 'undefined') && (typeof(platform) != 'undefined') && (typeof(rel) != 'undefined')) {
					if ($scope.status[date][sid][platform][rel]['status'] == 'close') {
						$scope.status[date][sid][platform][rel]['status'] = 'open'
					} else {
						$scope.status[date][sid][platform][rel]['status'] = 'close'
					}
				} else if ((typeof(sid) != 'undefined') && (typeof(platform) != 'undefined')) {
					if ($scope.status[date][sid][platform]['status'] == 'close') {
						$scope.status[date][sid][platform]['status'] = 'open'
					} else {
						$scope.status[date][sid][platform]['status'] = 'close'
					}
				} else if (typeof(sid) != 'undefined') {
					if ($scope.status[date][sid]['status'] == 'close') {
						$scope.status[date][sid]['status'] = 'open'
					} else {
						$scope.status[date][sid]['status'] = 'close'
					}
				} else {
					if ($scope.status[date]['status'] == 'close') {
						$scope.status[date]['status'] = 'open'
					} else {
						$scope.status[date]['status'] = 'close'						
					}
				}
		    }

		    $scope.folderStatus = function(date, sid, platform, rel) {

		    	if ((typeof(sid) != 'undefined') && (typeof(platform) != 'undefined') && (typeof(rel) != 'undefined')) {
					if(typeof($scope.status[date][sid][platform][rel]) == 'undefined') {
						$scope.status[date][sid][platform][rel] = {};
						$scope.status[date][sid][platform][rel]['status'] = 'close';
						return 'glyphicon-chevron-right';
					} else {
						if ($scope.status[date][sid][platform][rel]['status'] == 'open') return 'glyphicon-chevron-down folder-open';
						return 'glyphicon-chevron-right';
					}
					
				} else if ((typeof(sid) != 'undefined') && (typeof(platform) != 'undefined')) {
					if(typeof($scope.status[date][sid][platform]) == 'undefined') {
						$scope.status[date][sid][platform] = {};
						$scope.status[date][sid][platform]['status'] = 'close';
						return 'glyphicon-chevron-right';
					} else {
						if ($scope.status[date][sid][platform]['status'] == 'open') return 'glyphicon-chevron-down folder-open';
						return 'glyphicon-chevron-right';
					}
					
				} else if (typeof(sid) != 'undefined') {
					if(typeof($scope.status[date][sid]) == 'undefined') {
						$scope.status[date][sid] = {};
						$scope.status[date][sid]['status'] = 'close';
						return 'glyphicon-chevron-right';
					} else {
						if ($scope.status[date][sid]['status'] == 'open') return 'glyphicon-chevron-down folder-open';
						return 'glyphicon-chevron-right';
					}
					
				} else {
					if(typeof($scope.status[date]) == 'undefined') {
						$scope.status[date] = {};
						$scope.status[date]['status'] = 'close';
						return 'glyphicon-chevron-right';
					} else {
						if ($scope.status[date]['status'] == 'open') return 'glyphicon-chevron-down folder-open';
						return 'glyphicon-chevron-right';
					}
					
				}
		    }

			$scope.status = function(date, sid, platform, rel) {
				if ((typeof(sid) != 'undefined') && (typeof(platform) != 'undefined') && (typeof(rel) != 'undefined')) {
					if ($scope.overall[date][sid][platform][rel]['overall'] == 'fail') {
						return 'glyphicon-remove';
					} else {
						return 'glyphicon-ok'
					}
				} else if ((typeof(sid) != 'undefined') && (typeof(platform) != 'undefined')) {
					if ($scope.overall[date][sid][platform]['overall'] == 'fail') {
						return 'glyphicon-remove';
					} else {
						return 'glyphicon-ok'
					}
				} else if (typeof(sid) != 'undefined') {
					if ($scope.overall[date][sid]['overall'] == 'fail') {
						return 'glyphicon-remove';
					} else {
						return 'glyphicon-ok'
					}
				} else {
					if ($scope.overall[date]['overall'] == 'fail') {
						return 'glyphicon-remove';
					} else {
						return 'glyphicon-ok'
					}
				}

				// if (string)
			}
			$scope.formatDate = function(timestamp) {
				var date = new Date(timestamp);
				$scope.dateString = date.toLocaleString('en-GB');
			}
			$scope.formatRelease = function(rel) {
				var tmp = rel.split(/_/);
				$scope.release = tmp[1]+'.'+tmp[2];
			}
			$scope.getSigName = function(sid) {
				console.log(sid)
				$scope.name = $scope.sigInfo[sid];
			}

			$scope.runRegressionM = function(sid, rel) {
				Load.runRegressionM(sid, rel)
					.success(function(date) {
						console.log(data)
					})
			}
			


		}
	])
	.controller('loadUsers', ['$scope', 'Load', '$routeParams', 'ngTableParams', '$filter',
		function($scope, Load, $routeParams, ngTableParams, $filter) {
			//filter: ALL USERS, TEC, TAC, CA
			$scope.loadUserList = function(filter) {
				$scope.structuredUsers = {};
				var filter = $routeParams.filter;
				setTimeout(function() {
					console.log($scope.user);
					Load.loadUsers(filter, $scope.user)
						.success(function(data) {
							//filter and sorting from Plunker *******************************************
						    $scope.tableParams = new ngTableParams({
						        page: 1,            // show first page
						        count: 10,          // count per page
						        sorting: {
						            id: 'asc'     // initial sorting
						        }
						    }, {
						        total: data.length, // length of data
						        getData: function($defer, params) {
						              // use build-in angular filter
						              var filteredData = params.filter() ?
						                      $filter('filter')(data, params.filter()) :
						                      data;
						              var orderedData = params.sorting() ?
						                      $filter('orderBy')(filteredData, params.orderBy()) :
						                      data;
  
						              params.total(orderedData.length); // set total for recalc pagination
						              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
						        }
						    });	
							//for understanding purpose *************************************************
						})
						.error(function(data) {
							console.log("ERROR : " + data);
						});
				}, 500);
				
			}

		}

	])
	.controller('accessManage', ['$scope', 'Scan', '$routeParams', 'Group',
		function($scope, Scan, $routeParams, Group) {
			$scope.loadGroups = function() {
				$scope.structuredGroups = [];
				structuredGroups = [];
				var group = {};
				setTimeout(function() {				
					Scan.getGroups($scope.user)
						.success(function(data) {
							for(a in data) {
								for(b in data[a].group) {
									group.company = data[a].company;
									group.name = data[a].group[b].name;
									group.access = data[a].group[b].access;
									structuredGroups.push(group);
								}
							}
							$scope.structuredGroups = structuredGroups;
							console.log($scope.structuredGroups);
							
							$scope.lists = [];
							$scope.lists.push({"section" : 1});
							$scope.lists.push({"section" : 0});
							$scope.lists.push({"section" : 1});
							console.log($scope.lists);
						})
						.error(function(data) {
							console.log("ERROR : " + data);
						})
				}, 700);
			}

		}
	])
	.controller('loadSig', ['$scope', '$http', 'Load', '$location', '$routeParams', 'ngProgress', 'mySharedService', 'mySocket', '$q', '$anchorScroll', 'ngTableParams', '$filter',
		function($scope, $http, Load, $location, $routeParams, ngProgress, mySharedService, mySocket, $q, $anchorScroll, ngTableParams, $filter) {			
			$scope.mySigs = {};
			// $scope.sigPlatform = {};

			$scope.isActive = function(route) {
				return route === $location.path();
			}

			$scope.loadPlatforms = function() {
				Load.loadPlatforms()
					.success(function(data) {
						$scope.platforms = Object.keys(data)
						
						console.log('>>>>>',data)
					})
			}
			$scope.loadPlatforms();

			$scope.getCategories = function() {

				var loadRouteParam = function() {
					var deferred = $q.defer();
					setTimeout(function() {
						deferred.resolve($routeParams.platform)
					}, 100);
					return deferred.promise;
				}
				
				loadRouteParam()
					.then(function(result) {
						$scope.categories = {};
						var platform = $routeParams.platform,
							category = $routeParams.category;

						Load.loadCategories(platform) 
							.success(function(data) {
								for(var i=0; i<data.length; i++) {
									var category = data[i];
									if (category) {
										if (!$scope.categories.hasOwnProperty(category)) {
											$scope.categories[category] = { category: category };
											$scope.platform = platform;
										}
									}
								}
							})
							.error(function(data) {
								console.log("ERROR : " + data);
							});

						Load.loadPlatforms()
							.success(function(data) {
								console.log(data)
							})
					})

			}

			$scope.scrolltoHref = function(id_array){
	            // set the location.hash to the id of
	            // the element you wish to scroll to.
	            var id = 'sig_'+id_array.join('_')
	            console.log(id)
	            $location.hash(id);
	            // call $anchorScroll()
	            $anchorScroll();
	        };

	        $scope.isMine = function(sig) {
	        	if (typeof($scope.mySigs[$scope.user.csl]) != 'undefined') {
		        	if ($scope.mySigs[$scope.user.csl].indexOf(sig.signature.sid) != -1) {
		        		return true;
		        	}
		        }
	        	return false;
	        }

			$scope.loadSigList = function() {
				var loadRouteParam = function() {
					var deferred = $q.defer();
					setTimeout(function() {
						deferred.resolve($routeParams.platform)
					}, 250);
					return deferred.promise;
				}
				
				loadRouteParam()
					.then(function(result) {
						var platform = $routeParams.platform,
							category = $routeParams.category;
							if ($scope.user.authenticated) {
								tec = $scope.user.permissions.tec;
							} else {
								tec = false;
							}
							components = [];

							$scope.sigList = {};
							$scope.items = [];

							Load.loadSigs(platform, category, $scope.user.csl, tec, {})
								.success(function(data) {
									data.forEach(function(rec) {
										if (rec.userid == $scope.user.csl) {
											if (typeof($scope.mySigs[$scope.user.csl]) == 'undefined') {
							        			$scope.mySigs[$scope.user.csl] = [];
							        		}
							        		$scope.mySigs[$scope.user.csl].push(rec.sid);
										}
										
										if (rec.component) {
											var comp = rec.component.replace(/\s/g, '_');
											if(components.indexOf(comp) < 0) {
												components.push(comp);
												$scope.items.push({'id': comp, 'name':comp});
											}
											
											if (!$scope.sigList.hasOwnProperty(rec.sid)) {
												$scope.sigList[rec.sid] = { signature : rec};
											}
											
										}
									})
								})
								.error(function(data) {
									console.log("ERROR : " + data);
								});
							$scope.sigTestList = {};
							Load.loadSigTests(platform, category, {})
								.success(function(data) {
									data.forEach(function(rec) {
										$scope.sigTestList[rec.sid] = rec;
									})
								})
								.error(function(data) {
									console.log("ERROR : " + data);
								});
					})
			}

			$scope.listAllSigs = function(route) {			
				$scope.allSigs = {};
				setTimeout(function() {
					$user = $scope.user;
					Load.loadAllSigs($user.csl)
						.success(function(data) {
							//filter and sorting from Plunker *******************************************
						    $scope.tableParams = new ngTableParams({
						        page: 1,            // show first page
						        count: 10,          // count per page
						        sorting: {
						            sid: 'asc'     // initial sorting
						        }
						    }, {
						        total: data.length, // length of data
						        getData: function($defer, params) {
						              // use build-in angular filter
						              var filteredData = params.filter() ?
						                      $filter('filter')(data, params.filter()) :
						                      data;
						              var orderedData = params.sorting() ?
						                      $filter('orderBy')(filteredData, params.orderBy()) :
						                      data;
  
						              params.total(orderedData.length); // set total for recalc pagination
						              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
						        }
						    });	
							//for understanding purpose *************************************************
						})
						.error(function(data) {
							console.log("ERROR : " + data);
						});	
				}, 400);
			}

			

			$scope.$on('handleBroadcast', function() {
				if (mySharedService.message == 'refreshNodeList') {
					$scope.loadSigList();
				}
			});
			$scope.$on('socket:broadcast', function(event, data) {
				if (data.msg == 'loadNodes') {
					$scope.loadSigList();
				}
			})
			$scope.loadSigList();

		}

	])
	.controller('uploadCtrl', ['$scope', '$fileUploader', '$q', 'FS', 'Load', 
		function($scope, $fileUploader, $q, FS, Load) {

			$scope.uploadReady 	= false;
			$scope.showPlatform = true;
			$scope.showSigs 	= true;
  			
  			$scope.files 	= [];
		    $scope.fileobj 	= {};
		    $scope.sigs 	= [];
		    $scope.releases = [
				{name:'9.0'},
				{name:'10.0'},
				{name:'11.0'},
				{name:'12.0'}
		    ];
		   	$scope.platforms = [
		   		{name:'7x50 SR-12e'},
				{name:'7x50 SR'},
				{name:'7950 XRS'}
		    ];
		    $scope.status = {};
			
			$scope.tooltip = {
				"warn": "This file has already been uploaded!"
			};

		    $scope.toggleMe = function(actor) {
		    	console.log(actor)
		    	console.log($scope.status)
		    	if(typeof($scope.status[actor]) == 'undefined') {
		    		$scope.status[actor] = 'open';
		    	} else {
		    		if ($scope.status[actor] == 'close') {
		    			$scope.status[actor] = 'open';
		    		} else {
		    			$scope.status[actor] = 'close';
		    		}
		    	}

		    }

		    $scope.folderStatus = function(actor) {
		    	if ($scope.status[actor] == 'open') return 'glyphicon-folder-open folder-open';
		    	return 'glyphicon-folder-close';
		    }
		    var loadUser = function() {
				var deferred = $q.defer();
				setTimeout(function() {
					deferred.resolve($scope.user.csl)
				}, 500);
				return deferred.promise;
			}
			var getPoolStructure = function() {
				var host = '/uploads/pool/';
				console.log(host);
				Load.getPoolStructure()
					.success(function(result) {
						console.log("-------->", result)
						$scope.pool = result;
						$scope.blah = {'path': host};
					})
			}
			
			getPoolStructure();
  			loadUser()
				.then(function(result) {
					Load.loadAllSigs(result)
			    	.success(function(data) {
			    		$scope.sigs = data;
			    	})
				});	
		   
			// 
            // setup watch to monitor changes make to category select options
            // 
      //       $scope.$watch('fileobj.release', function() {
		    //     if (typeof($scope.fileobj.release) != 'undefined') {
		    //     	if ($scope.fileobj.release != null) {
		    //     		$scope.showPlatform = true;
		    //     	} else {
			   //      	$scope.showPlatform = false;
			   //      }
		    //     } 
		    // });
		    // $scope.$watch('fileobj.platform', function() {
		    //     if (typeof($scope.fileobj.platform) != 'undefined') {
		    //     	if ($scope.fileobj.platform != null) {
		    //     		$scope.uploadReady = true;
		    //     	} else {
		    //     		$scope.uploadReady = false;
		    //     	}
		    //     } 
		    // });
  			
  			$scope.getFileContent = function(platform, release, file) {
  				Load.getFileinfo(platform, release, file)
  					.success(function(data) {

  						$scope.fileinfo = data[0];
  						Load.parseMatch(platform, release, file)
  							.success(function(result) {
  								console.log(result);
  								$scope.matches = result; 
								// $scope.panels.activePanel = 1;
  							})
  					})
  			}

  			$scope.getSigName = function(sid) {
  				return sigInfo[sid].name;
  			}

  			$scope.setUser = function() {

  				var setFileinfo = function(file) {
	  				var fileObj = {};
	  				
	  				fileObj.owner 		= $scope.user.csl;
	  				fileObj.name 		= file.file.name;
	  				fileObj.release 	= $scope.fileobj.release.name;
	  				fileObj.platform 	= $scope.fileobj.platform.name;
	  				fileObj.signatures 	= $scope.fileobj.signatures;

	  				return fileObj;
	  			}

  				var loadUser = function() {
  					var deferred = $q.defer();
  					setTimeout(function() {
  						deferred.resolve($scope.user.csl)
  					}, 0);
  					return deferred.promise;
  				}

  				var installUploader = function(me) {
			        var tempData = {};
	  				var uploader = $scope.uploader = $fileUploader.create({
			            scope: $scope,                          // to automatically update the html. Default: $rootScope
			            url: '/api/upload',
			            formData: [
			                { user: me },
			                { tsObjs: JSON.stringify($scope.tsObjs) }
			            ],
			            filters: [
			                function (item) {                    // first user filter
			                    console.log('>>>>>>>', item.name);
			                    // Load.repeatCheck(item.name)
			                    // 	.success(function(data) {
			                    // 		console.log('done: ', data);
			                    // 		if(data == "" || data == 'undefined') {

			                    // 		} else {
			                    // 			alert('file name: "' + item.name + '" already exists');
			                    // 		}
			                    // 	}) 
			                    return true;
			                }
			            ]
			        })

			        // // FAQ #1
			        // var item = {
			        //     file: {
			        //         name: 'Previously uploaded file',
			        //         size: 1e6
			        //     },
			        //     progress: 100,
			        //     isUploaded: true,
			        //     isSuccess: true
			        // };
			        // item.remove = function() {
			        // 	FS.removeFile(this)
			        //     uploader.removeFromQueue(this);
			        // };
			        // uploader.queue.push(item);
			        uploader.progress = 100;


			        // REGISTER HANDLERS

			        uploader.bind('afteraddingfile', function (event, item) {
			            console.info('After adding a file', item);
			            item.repeat = '';
			            Load.repeatCheck(item.file.name)
			            	.success(function(data) {
			            		console.log('done: ', data);
			            		if(data == "" || data == 'undefined') {
			            			item.repeat = 'true';
			            			console.log('^_^' + item.repeat);
			            		} else {			            			
			            			item.repeat = 'false';
			            			console.log('T_T' + item.repeat);
			            		}
			            	}) 
			        });

			        uploader.bind('whenaddingfilefailed', function (event, item) {
			            console.info('When adding a file failed', item);
			        });

			        uploader.bind('afteraddingall', function (event, items) {
			            // console.info('After adding all files', items);
			        });

			        uploader.bind('beforeupload', function (event, item) {
			            console.info('Before upload', item);
			            //here ke
			            item.formData.push({ fileObj: JSON.stringify(setFileinfo(item)) });
			            // console.log(typeof(JSON.stringify(setFileinfo(item))));
			            console.log(setFileinfo(item));
			            Load.insertFile(setFileinfo(item))
			            	.success(function() {

			            	})
			        });

			        uploader.bind('progress', function (event, item, progress) {
			            // console.info('Progress: ' + progress, item);
			        });

			        uploader.bind('success', function (event, xhr, item, response) {
			            // console.info('Success', xhr, item, response);
			        });

			        uploader.bind('cancel', function (event, xhr, item) {
			            // console.info('Cancel', xhr, item);
			        });

			        uploader.bind('error', function (event, xhr, item, response) {
			            // console.info('Error', xhr, item, response);
			        });

			        uploader.bind('complete', function (event, xhr, item, response) {
			            // console.info('Complete', xhr, item, response);
			            tempData = response;
			            getPoolStructure();
			            
			        });

			        uploader.bind('progressall', function (event, progress) {
			            // console.info('Total progress: ' + progress);
			        });

			        uploader.bind('completeall', function (event, items) {
				        console.log('DONE', tempData)
			        
			        });
  				}

  				loadUser()
  					.then(function(result) {
  						installUploader(result)
  					});

  			}
		}
	])
	.controller('addSigCtrl', ['$scope', 'mySharedService', 'Load', '$routeParams', '$location', 'flash',
		function($scope, mySharedService, Load, $routeParams, $location, flash) {
			// 
			// Initialize new sig obj
			// 
			$scope.newObj = {};
			$scope.showCatPanel = false;
			$scope.showCompPanel = false;
			$scope.showNewTestPanel = {};
			$scope.enableSigAdd = true;
			$scope.showComp = false;
			$scope.showRest = false;
			
			$scope.newObj.newSigPlatform = {};
			$scope.newObj.newSigDetail = '';
			$scope.newObj.newSigtlsmessage = '';
			$scope.newObj.newSigcustomermessage = '';	
			$scope.newObj.newSigAction = '';
			$scope.newObj.newSigName = '';
			$scope.newObj.newSigLevel = '';
			$scope.newObj.newSigThreshold = '';
			
			// $scope.newObj.newSigPlatform = $routeParams.platform ? $routeParams.platform : '7x50';
			$scope.newObj.newSigCategory = $routeParams.category ? $routeParams.category : 'SYS';
			// 
			// Load categories
			// 
			$scope.cateList = [];

			Load.loadPlatforms()
				.success(function(data) {
					$scope.platforms = Object.keys(data)
					// for(i in $scope.platforms) {
					// 	var p = $scope.platforms[i]
					// 	$scope.newObj.newSigPlatform[p] = false;
					// }
				})

			

			$scope.commandTypes = [
                {'id': 'CLI Command', 'name': 'CLI Command'},
                {'id': 'Local Shell Command', 'name': 'Local Shell Command'},
                {'id': 'Shell Command', 'name': 'Shell Command'}
            ];

            
            var loadComponents = function() {
		        if ($scope.newObj.newSigCategory != null) {
		        	// 
		        	// load the component list accordingly
		        	// 
		        	var isObject = (Object.keys($scope.newObj.newSigPlatform).length > 0) ? true : false;
		        	$scope.compList = [];
		        	Load.loadComponents($scope.newObj.newSigPlatform, $scope.newObj.newSigCategory, isObject) 
						.success(function(data) {
							for(var i=0; i<data.length; i++) {
								var component = data[i];
								if (component) {
									$scope.compList.push({'id':component, 'name': component});
								}
							}
		        			$scope.showComp = true;
		        			$scope.showRest = true;

						})
						.error(function(data) {
							console.log("ERROR : " + data);
						});
		        } else {
		        	$scope.showComp = false;
		        }
		    };
		    // 
            // Load category according to the platforms checked
            // 
            $scope.loadCats = function() {
            	for(p in $scope.newObj.newSigPlatform) {
            		if(!$scope.newObj.newSigPlatform[p]) delete $scope.newObj.newSigPlatform[p];
            	}
            	$scope.cateList = [];
            	var isObject = (Object.keys($scope.newObj.newSigPlatform).length > 0) ? true : false;

            	Load.loadCategories($scope.newObj.newSigPlatform, isObject) 
					.success(function(data) {
						for(var i=0; i<data.length; i++) {
							var category = data[i];
							
							if (category) {
								$scope.cateList.push({'id':category, 'name': category});							
							}
						}
					})
					.error(function(data) {
						console.log("ERROR : " + data);
					});
					// 
					// load components of the default selected category
					// 
					loadComponents();
            }
            // 
            // setup watch to monitor changes make to category select options
            // 
            $scope.$watch('newObj.newSigCategory', loadComponents);

			$scope.showAddCatPanel = function() {
				$scope.showCatPanel = true;
			}
			$scope.showDeleteCatPanel = function() {
				$scope.deleteCatPanel = true;
			}
			$scope.hideAddCatPanel = function() {
				$scope.showCatPanel = false;
			}
			$scope.hideDeleteCatPanel = function() {
				$scope.deleteCatPanel = false;
			}			
			$scope.showAddCompPanel = function() {
				$scope.showCompPanel = true;
			}
			$scope.hideAddCompPanel = function() {
				$scope.showCompPanel = false;
			}
			$scope.showNewTestCompPanel = function(rel) {
				$scope.showNewTestPanel[rel] = true;
			}
			$scope.hideNewTestCompPanel = function(rel) {
				$scope.showNewTestPanel[rel] = false;
			}
			$scope.verifySigAdd = function() {
				if($scope.newObj.newSigName.length > 0 && $scope.newObj.newSigDetail.length > 0) {  //&& $scope.newSigLevel.length > 0 && $scope.newSigThreshold.length > 0) {
					$scope.enableSigAdd = false;
				} else {
					$scope.enableSigAdd = true;
				}
			}
			$scope.addNewCategory = function() {
				$scope.newObj.newSigPlatform = $routeParams.platform;
				$scope.categories[$scope.newObj.newSigCategory] = { 'category': $scope.newObj.newSigCategory }
				$scope.showCatPanel = false;
				var path = '/loadSigs/' + $scope.newObj.newSigPlatform +'/'+ $scope.newObj.newSigCategory; 
				$location.path( path )
			}
			$scope.addNewComponent = function() {
				var comp = $scope.newObj.newSigComponent;
				$scope.items.push({'id': comp, 'name':comp})
				$scope.showCompPanel = false;
			}
			$scope.addSignature = function() {
				var options = {
					userid 		: $scope.user.csl,
					platform 	: $scope.newObj.newSigPlatform,
					category 	: $scope.newObj.newSigCategory,
					component 	: $scope.newObj.currentComponent,
					signature 	: $scope.newObj.newSigName,
					detail 		: $scope.newObj.newSigDetail.replace("'", "\'"),
					tlsmessage  : $scope.newObj.newSigtlsmessage.replace("'", "\'"),
				customermessage : $scope.newObj.newSigcustomermessage.replace("'", "\'"),
					action		: $scope.newObj.newSigAction.replace("'", "\'"),
					level 		: parseInt($scope.newObj.newSigLevel),
					threshold 	: parseInt($scope.newObj.newSigThreshold),
					dts 		: $scope.newObj.newSigDTS,
					fix			: $scope.newObj.newSigFix,
					rn 			: $scope.newObj.newSigRN,
					ta 			: $scope.newObj.newSigTA
				}

				Load.addSignature(options)
					.success(function(rec) {
						// if (typeof($scope.sigList[component]) != 'undefined') {
						// 	if (!$scope.sigList[component]['signatures'].hasOwnProperty(rec.sid)) {
						// 		$scope.sigList[component]['signatures'][rec.sid] = { signature : rec };
						// 	}
						// 	console.log($scope.sigList)
						// } 
						
						// mySharedService.prepForBroadcast('refreshNodeList')
					})
					.error(function(data) {

					});
			}

			$scope.updateSig = function(sig) {
				Load.updateSignature(sig)
					.success(function(rec) {
						flash.success = 'Changes have been updated successfully!';
					})
					.error(function(data) {

					});
			}
		}
	]);
	
