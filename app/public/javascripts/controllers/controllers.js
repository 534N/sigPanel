var bookingController = angular.module('bookingController', []);

bookingController
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
	.controller('getNodeList', ['$scope', '$http', 'Scan', 'mySocket', '$location',
		function($scope, $http, Scan, mySocket, $location) {
			$scope.getNodeList = function() {
				Scan.get()
					.success(function(data) {
						console.log(data)
						console.log($scope.udata)
						$scope.nodeList = data;

						$scope.free = [],
						$scope.busy = [],
						$scope.mine = [];
					}) 
					.error(function(data) {
						console.log("ERROR : " + data);
					});
			}
			$scope.getNodeList();
		}
	])
	.controller('getSigList', ['$scope', '$http', 'Scan', 'mySocket', '$location',
		function($scope, $http, Scan, mySocket, $location){
			Scan.getSig()
				.success(function(data) {
					$scope.signatures = data;
					console.log(data)
				})
		}
	])
	.controller('loadNode', ['$scope', '$http', 'Load', '$location', '$routeParams', 'ngProgress', 'mySharedService', 'mySocket',
		function($scope, $http, Load, $location, $routeParams, ngProgress, mySharedService, mySocket) {
			var filter = $routeParams.filter;
			
			// ngProgress.start();
			// $scope.ipClass = (node.status == 'live') ? 'label-success' : 'label-default'; 
			$scope.editable = function(node) {
				if (node.hasOwnProperty('owner')) {
					return false;
				}
				return true;
			}

			$scope.isActive = function(route) {
				return route === $location.path();
			}
			$scope.loadNodeList = function() {
				$scope.structuredNodes = {};
				var structuredNodes = {};
				Load.get(filter, $scope.user, {})
					.success(function(data) {
						$scope.filter = filter;
						$scope.nodeList = data;
						for(i in data) {
							var row 	= data[i].position.row,
								rack 	= data[i].position.rack,
								type	= data[i].type,
								ipString = data[i].ip;

							if(!structuredNodes[row]) {
								structuredNodes[row] = {};
								structuredNodes[row][rack] = [];
							} else if (!structuredNodes[row][rack]) {
								structuredNodes[row][rack] = [];
							}
							structuredNodes[row][rack].push(data[i]);
						}
						$scope.rows = Object.keys(structuredNodes);
						$scope.structuredNodes = structuredNodes;
					})
					.error(function(data) {
						console.log("ERROR : " + data);
					});
			}

			$scope.$on('handleBroadcast', function() {
				if (mySharedService.message == 'refreshNodeList') {
					$scope.loadNodeList();
				}
			});
			$scope.$on('socket:broadcast', function(event, data) {
				if (data.msg == 'loadNodes') {
					console.log(data)
					$scope.loadNodeList();
				}
			})
			$scope.loadNodeList();
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
					if (node.owner == $scope.user.login) {
						return true;
					}
				}
				return false;
			}
			if ($scope.node) {
				$scope.ipClass = ($scope.node.status == 'live') ? 'label-success' : 'label-default'; 
				$scope.owner = ($scope.node.owner == $scope.user.login) ? 'me' : $scope.node.owner;
				$scope.startDate = new Date();
				$scope.endDate = $scope.node.end ? new Date(Date.parse($scope.node.end)) : null;
			}
			
		}
	])
	.controller('nodeBookingCtrl', ['$scope', 'Book', 'mySharedService', 'flash', 'Load',
		function($scope, Book, mySharedService, flash, Load) {			
			$scope.showTypePanel = false;			
			$scope.newObj = {};

			$scope.showAddTypePanel = function() {
				$scope.showTypePanel = true;
			}
			$scope.hideAddTypePanel = function() {
				$scope.showTypePanel = false;
			}
			$scope.addNewType = function() {
				console.log("called addNewType() already");
				var type = $scope.newObj.newType;
				var size = $scope.newObj.newSize;
				console.log(type, size)
				$scope.items.push({'type': type, 'size': size});
				console.log($scope.items)
				$scope.showTypePanel = false;
			}

			$scope.addNode = function(node) {
				Book.add(node)
					.success(function(data) {
						if(data.error) {
							flash.error = 'IP: ' + node.ip + ' exists already!';
						} else {
							flash.success = 'IP: ' + node.ip + ' is good to be added!';
						}

					})
					.error(function(data) {
						console.log(data)
					})
			}

			$scope.parseType = function() {
				Load.getType()
					.success(function(data) {
						$scope.items = [];
						data.forEach(function(e) {
							$scope.items.push({'type': e.type, 'size': e.size});
							// $scope.typeSize[e.type] = e.size;
						});
						console.log('arrived parseType', data);
					})
					.error(function() {
						alert("Something bad happend!");
					});
			}

			$scope.changeSize = function(node) {
				if(!node.position) {
					node.position = {};
				}
				node.position.size = node.type.size;
				$scope.node = node;
			}

			$scope.bookMe = function(node) {
				Book.post(node, $scope.user, 'book', {start: $scope.startDate, end: $scope.endDate}) 
					.success(function(data) {
						// mySharedService.prepForBroadcast('refreshNodeList');
						flash.success = 'Node: ' + node.ip + ' has been booked from ' + $scope.startDate + ' to ' + $scope.endDate + '!';
						setTimeout(function() {
							flash.message = '';
							$scope.$hide();
						}, 50);
					})
					.error(function(data) {
						console.log("ERROR : " + data);
					});
			}

			$scope.updateMe = function(node) {
				Book.update(node) 
					.success(function(data) {
						// mySharedService.prepForBroadcast('refreshNodeList');
						flash.success = 'Node: ' + node.ip + ' has been successfully updated!';
						setTimeout(function() {
							flash.message = '';
							$scope.$hide();
						}, 50);
					})
					.error(function(data) {
						console.log("ERROR : " + data);
					});
			}

			$scope.releaseMe = function(node) {
				Book.post(node, $scope.user, 'release', {}) 
					.success(function(data) {
						// mySharedService.prepForBroadcast('refreshNodeList');
						flash.success = 'Node: ' + node.ip + ' has been released to the booking pool!';
						setTimeout(function() {
							flash.message = '';
							$scope.$hide();
						}, 50);
					})
					.error(function(data) {
						console.log("ERROR : " + data);
					});
				
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
	.controller('loadUsers', ['$scope', 'Load', '$routeParams', 'ngTableParams', '$filter',
		function($scope, Load, $routeParams, ngTableParams, $filter) {
			//filter: ALL USERS, TEC, TAC, CA
			$scope.loadUserList = function(filter) {
				$scope.structuredUsers = {};
				var filter = $routeParams.filter;
				setTimeout(function() {
					console.log($scope.user);
					Load.getUsers(filter, $scope.user)
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
	.controller('userInfoPopoverCtrl', ['$scope', 
		function($scope) {
			$scope.popover = {
				'title': 'User Info',
				'content': 'Hello World!'
			};
			$scope.setUser = function(node) {
				$scope.user = node.ownerObj;
			}
		}
	])
	.controller('sshLinkCtrl', ['$scope', '$aside', 'Ping', 'mySocket', 'usSpinnerService', 'mySharedService',
		function($scope, $aside, Ping, mySocket, usSpinnerService, mySharedService) {
			$scope.setSpinnerKey = function(node) {
				var sk = node.ip.replace(/\./g, '-');
				$scope.spinnerKey = 'spinner-'+sk;
			};
			$scope.showSSH = function(node, filter) {
				if (node.owner && ($scope.user.login != node.owner) && (filter != 'free') ) {
					return false;
				} else {
					return true;
				}
			};
			$scope.pingNode = function(node) {
				$scope.spinning = true;
				usSpinnerService.spin($scope.spinnerKey);

				Ping.get(node)
					.success(function(data) {
						usSpinnerService.stop($scope.spinnerKey);
						$scope.spinning = false;
						console.log(data)
						if (data == 'false') {
							$scope.progress = '';
						} else {
							mySharedService.prepForBroadcast('refreshNodeList');
						}
					});
			};
			$scope.cliCommand = {};
			$scope.cliPanel = '';
			var cliPanelContents = [];
			$scope.connectNode = function(node) {
				var socketSuffix = ($scope.user.authorized) ? $scope.user.user_id : null;
				if (socketSuffix) {
					mySocket.forward(socketSuffix);
					mySocket.emit('conn_node', {node: node, uid: socketSuffix});

					var formatOutput = function(prompt, cmd, output) {
						return prompt + ' ' + output + '\n';
					}

					$scope.sendCommand = function(cli) {
						console.log($scope.cliCommand.text)
						console.log(cli)
						mySocket.emit('sendchat', {cmd: cli, uid: socketSuffix});
						$scope.cliCommand.text = '';
					}

					$scope.$on('socket:'+socketSuffix, function(event, data) {
						if (data.init) {
							mySocket.emit('sendchat', {cmd: 'env no more', uid: socketSuffix});
						} else {
							if (cliPanelContents.indexOf(formatOutput(data.prompt, data.cmd, data.output)) < 0) {
								$scope.cliPanel = $scope.cliPanel + formatOutput(data.prompt, data.cmd, data.output);
								cliPanelContents.push(formatOutput(data.prompt, data.cmd, data.output))
							}
						}
					})
				}
			}
			$scope.tooltip = {
				'ssh': 'Click to SSH to the node',
				'ping': 'Click to ping the node'
			};
		}
	])
	.controller('labMapCtrl', ['$scope', 'Load', '$http', '$routeParams', 'mySharedService', 'mySocket',
		function($scope, Load, $http, $routeParams, mySharedService, mySocket) {
			var filter = 'all';

			$scope.loadNodeList = function() {
				Load.get(filter, $scope.user, JSON.stringify({'position.row': 1, 'position.rack' : 1, 'position.pos': 1}))
					.success(function(data) {
						$scope.filter = filter;
						$scope.d3Data = data;


						var numberOfRows = function(data) {
							var rows = 1;
							data.forEach(function(rec) {
								if (rec.position.row > rows) {
									rows = rec.position.row;
								}
							});

							return parseInt(rows);
						};

						var numberOfRacksInRow = function(data, row) {
							var racks = 1;
							data.forEach(function(rec) {
								if (rec.position.row == row) {
									if (rec.position.rack > racks) {
										racks = rec.position.rack;
									}
								}
							});
							return parseInt(racks);
						};

						$scope.getRackInRow = function(arg) {
							return numberOfRacksInRow(data, arg);
						}
					
						if(data != 'null') {
							$scope.rows = numberOfRows(data);
						} else {
							console.log('what')
						}
						
						$scope.getNumber = function(num) {
							return new Array(num);
						}
					})
					.error(function(data) {
						console.log("ERROR : " + data);
					});
			}

			$scope.$on('handleBroadcast', function() {
				console.log('reloading!!!!!!!')
				if (mySharedService.message == 'refreshNodeList') {
					$scope.loadNodeList();
				}
			});

			$scope.$on('socket:broadcast', function(event, data) {
				if (data.msg == 'loadNodes') {
					$scope.loadNodeList();
				}
			})

			$scope.loadNodeList();
		}
	])
	.controller('loadSig', ['$scope', '$http', 'Load', '$location', '$routeParams', 'ngProgress', 'mySharedService', 'mySocket', '$q', '$anchorScroll', 'ngTableParams', '$filter',
		function($scope, $http, Load, $location, $routeParams, ngProgress, mySharedService, mySocket, $q, $anchorScroll, ngTableParams, $filter) {			
			$scope.mySigs = {};
			$scope.isActive = function(route) {
				return route === $location.path();
			}

			$scope.getCategories = function() {

				var loadRouteParam = function() {
					var deferred = $q.defer();
					setTimeout(function() {
						deferred.resolve($routeParams.platform)
					}, 500);
					return deferred.promise;
				}
				
				loadRouteParam()
					.then(function(result) {
						$scope.categories = {};
						var platform = $routeParams.platform,
							category = $routeParams.category;

						Load.getCat(platform) 
							.success(function(data) {
								for(var i=0; i<data.length; i++) {
									var category = data[i];
									if (category) {
										if (!$scope.categories.hasOwnProperty(category)) {
											$scope.categories[category] = { category: category }
										}
									}
								}
								console.log($scope.categories)

							})
							.error(function(data) {
								console.log("ERROR : " + data);
							});
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
	        	if (typeof($scope.mySigs[$scope.user.login]) != 'undefined') {
		        	if ($scope.mySigs[$scope.user.login].indexOf(sig.signature.sid) != -1) {
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
					}, 500);
					return deferred.promise;
				}
				
				loadRouteParam()
					.then(function(result) {
						console.log($scope.user);

						var platform = $routeParams.platform,
							category = $routeParams.category;
							if ($scope.user.authenticated) {
								if (typeof($scope.user.permissions) != 'undefined') {
									tec = $scope.user.permissions.tec.value;
								} else {
									tec = $scope.user.permissions.tec;
								}
							} else {
								tec = false;
							}
							components = [];

							$scope.sigList = {};
							$scope.items = [];

							Load.getSig(platform, category, $scope.user.login, tec, {})
								.success(function(data) {
									data.forEach(function(rec) {
										if (rec.userid == $scope.user.login) {
											if (typeof($scope.mySigs[$scope.user.login]) == 'undefined') {
							        			$scope.mySigs[$scope.user.login] = [];
							        		}
							        		$scope.mySigs[$scope.user.login].push(rec.sid);
										}
										
										if (rec.component) {
											var comp = rec.component.replace(/\s/g, '_');
											if(components.indexOf(comp) < 0) {
												components.push(comp);
												$scope.items.push({'id': comp, 'name':comp});
											}
											if (!$scope.sigList.hasOwnProperty(comp)) {
												$scope.sigList[comp] = { component: comp, signatures: {}};
												if (!$scope.sigList[comp]['signatures'].hasOwnProperty(rec.sid)) {
													$scope.sigList[comp]['signatures'][rec.sid] = { signature : rec};
												}
											} else {
												if (!$scope.sigList[comp]['signatures'].hasOwnProperty(rec.sid)) {
													$scope.sigList[comp]['signatures'][rec.sid] = { signature : rec};
												}
											}
										}
									})
								})
								.error(function(data) {
									console.log("ERROR : " + data);
								});
							$scope.sigTestList = {};
							Load.getSigTests(platform, category, {})
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
					Load.getAllSigs($user.login)
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
				}, 800);
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
	.controller('addSigCtrl', ['$scope', 'mySharedService', 'Load', '$routeParams', '$location', 'flash',
		function($scope, mySharedService, Load, $routeParams, $location, flash) {
			var component = $scope.currentComponent;
			
			$scope.newSigPlatform = $routeParams.platform;
			$scope.newSigCategory = $routeParams.category;

			$scope.showCatPanel = false;
			$scope.showCompPanel = false;
			$scope.showNewTestPanel = {};
			$scope.enableSigAdd = true;
			$scope.newSigDetail = '';
			$scope.newSigAction = '';
			$scope.newSigName = '';
			$scope.newSigLevel = '';
			$scope.newSigThreshold = '';

			$scope.newObj = {};
			$scope.commandTypes = [
                {'id': 'CLI Command', 'name': 'CLI Command'},
                {'id': 'Local Shell Command', 'name': 'Local Shell Command'},
                {'id': 'Shell Command', 'name': 'Shell Command'}
            ];

			$scope.showAddCatPanel = function() {
				$scope.showCatPanel = true;
			}
			$scope.hideAddCatPanel = function() {
				$scope.showCatPanel = false;
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
				if($scope.newSigName.length > 0 && $scope.newSigDetail.length > 0) {  //&& $scope.newSigLevel.length > 0 && $scope.newSigThreshold.length > 0) {
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
					userid 		: $scope.user.login,
					platform 	: $scope.newSigPlatform,
					category 	: $scope.newSigCategory,
					component 	: $scope.currentComponent,
					signature 	: $scope.newSigName,
					detail 		: $scope.newSigDetail.replace("'", "\'"),
					action		: $scope.newSigAction.replace("'", "\'"),
					level 		: parseInt($scope.newSigLevel),
					threshold 	: parseInt($scope.newSigThreshold),
					dts 		: $scope.newSigDTS,
					fix			: $scope.newSigFix,
					rn 			: $scope.newSigRN,
					ta 			: $scope.newSigTA
				}

				Load.addSignature(options)
					.success(function(rec) {
						if (typeof($scope.sigList[component]) != 'undefined') {
							if (!$scope.sigList[component]['signatures'].hasOwnProperty(rec.sid)) {
								$scope.sigList[component]['signatures'][rec.sid] = { signature : rec };
							}
							console.log($scope.sigList)
						} 
						
						mySharedService.prepForBroadcast('refreshNodeList')
					})
					.error(function(data) {

					});
			}

			$scope.updateSig = function(sig) {
				console.log(sig);
				
				Load.updateSignature(sig)
					.success(function(rec) {
						flash.success = 'Changes have been updated successfully!';
					})
					.error(function(data) {

					});
			}
		}
	])
	.controller('helpCtrl', ['$scope', 
		function($scope) {
			$scope.tooltip = {
				'signup': 'Click to sign up'
			}
		}
	])
	.controller('uploadCtrl', ['$scope', '$fileUploader', '$q', 'FS',
		function($scope, $fileUploader, $q, FS) {
  			// create a uploader with options

  			$scope.allCompleted = false;
  			$scope.actionDiff = false;

  			$scope.cardUp = function(admin, oper) {
  				if(admin == 'up' && oper == 'up') return true;
  				if(admin =! oper) return false;
  			}

  			$scope.cardStateClass = function(admin, oper) {
  				if($scope.cardUp(admin, oper)) {
  					return 'green';
  				} else {
  					return 'red';
  				}
  			}

  			$scope.stateClass = function(prop) {
  				if(/\svs\s/.test(prop)) {
  					return 'red';
  				} 
  			}

  			$scope.setUser = function(login) {

  				var loadUser = function() {
  					var deferred = $q.defer();
  					setTimeout(function() {
  						deferred.resolve($scope.user.login)
  					}, 1500);
  					return deferred.promise;
  				}

  				var installUploader = function(me) {

	  				var uploader = $scope.uploader = $fileUploader.create({
			            scope: $scope,                          // to automatically update the html. Default: $rootScope
			            url: '/api/upload',
			            formData: [
			                { user: me }
			            ],
			            filters: [
			                function (item) {                    // first user filter
			                    // console.info('filter1');
			                    console.log(item)
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

			        var tempData = {};

			        // REGISTER HANDLERS

			        uploader.bind('afteraddingfile', function (event, item) {
			            // console.info('After adding a file', item);
			        });

			        uploader.bind('whenaddingfilefailed', function (event, item) {
			            console.info('When adding a file failed', item);
			        });

			        uploader.bind('afteraddingall', function (event, items) {
			            // console.info('After adding all files', items);
			        });

			        uploader.bind('beforeupload', function (event, item) {
			            // console.info('Before upload', item);
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
			            
			        });

			        uploader.bind('progressall', function (event, progress) {
			            // console.info('Total progress: ' + progress);
			        });

			        uploader.bind('completeall', function (event, items) {
				        console.log('DONE', tempData)

				        var signatureTimestamps = tempData.data.timestamps;
				        delete tempData.data.timestamps;
				        var data = tempData.data;

				        $scope.time1 = {}, $scope.time2 = {};
				        var sigs = {}, diff = {}, ioms = {}, cpms = {}, mdas = {}, cards = {};

				        for(mac in signatureTimestamps) {
				        	if (signatureTimestamps[mac].length == 2) {
				        		/******
				        		* DIFF
								*******/
				            	$scope.actionDiff = true;


			            		t1 = signatureTimestamps[mac][0],
				            	t2 = signatureTimestamps[mac][1];
					            $scope.time1[mac] = t1;
					            $scope.time2[mac] = t2;


			            		if(typeof(sigs[mac]) == 'undefined') sigs[mac] = {};
			            		if(typeof(diff[mac]) == 'undefined') diff[mac] = {};
			            		if(typeof(ioms[mac]) == 'undefined') ioms[mac] = {};
			            		if(typeof(cpms[mac]) == 'undefined') cpms[mac] = {};
			            		if(typeof(mdas[mac]) == 'undefined') mdas[mac] = {};

			            		for(card in data[mac]) {
			            			
			            			if(typeof(sigs[mac][card]) == 'undefined') sigs[mac][card] = {};
			            			if(typeof(diff[mac][card]) == 'undefined') diff[mac][card] = {};

			            			for(sid in data[mac][card]) {
			            				if(typeof(sigs[mac][card][sid]) == 'undefined') sigs[mac][card][sid] = {};
			            				if(typeof(diff[mac][card][sid]) == 'undefined') diff[mac][card][sid] = {};

			            				if (sid == '511') { 
			            					if(typeof(ioms[mac][card]) == 'undefined') ioms[mac][card] = {};
				            				
			            					data[mac][card][sid][t1]['Equipped'] = '_LBR_' ? data[mac][card][sid][t1]['Provisioned'] : data[mac][card][sid][t1]['Equipped'];
			            					data[mac][card][sid][t2]['Equipped'] = '_LBR_' ? data[mac][card][sid][t2]['Provisioned'] : data[mac][card][sid][t2]['Equipped'];
				            				for(prop in data[mac][card][sid][t1]) {
				            					ioms[mac][card][prop] = (data[mac][card][sid][t1][prop] == data[mac][card][sid][t2][prop]) ? data[mac][card][sid][t1][prop] : data[mac][card][sid][t1][prop]+' : '+data[mac][card][sid][t2][prop]
					            				// diff[mac][card][sid][prop] = (data[mac][card][sid][t1][prop] == data[mac][card][sid][t2][prop]) ? data[mac][card][sid][t1] : data[mac][card][sid][t1]+' : '+data[mac][card][sid][t2]
					            			}
			            				} else if (sid == '512') {
			            					if(typeof(cpms[mac][card]) == 'undefined') cpms[mac][card] = {};

				            				data[mac][card][sid][t1]['Equipped'] = '_LBR_' ? data[mac][card][sid][t1]['Provisioned'] : data[mac][card][sid][t1]['Equipped'];
			            					data[mac][card][sid][t2]['Equipped'] = '_LBR_' ? data[mac][card][sid][t2]['Provisioned'] : data[mac][card][sid][t2]['Equipped'];
			            					for(prop in data[mac][card][sid][t1]) {
				            					cpms[mac][card][prop] = (data[mac][card][sid][t1][prop] == data[mac][card][sid][t2][prop]) ? data[mac][card][sid][t1][prop] : data[mac][card][sid][t1][prop]+' : '+data[mac][card][sid][t2][prop]
					            			}
			            				} else if (sid == '516') {
			            					for(index in data[mac][card][sid][t1]) {
			            						var mda = data[mac][card][sid][t1][index]['Slot']+'/'+data[mac][card][sid][t1][index]['MDA'];

				            					if(typeof(mdas[mac][card]) == 'undefined') mdas[mac][card] = {};
				            					if(typeof(mdas[mac][card][mda]) == 'undefined') mdas[mac][card][mda] = {};

				            					for(prop in data[mac][card][sid][t1][index]) {
					            					mdas[mac][card][mda][prop] = (data[mac][card][sid][t1][index][prop] == data[mac][card][sid][t2][index][prop]) ? data[mac][card][sid][t1][index][prop] : data[mac][card][sid][t1][index][prop]+' : '+data[mac][card][sid][t2][index][prop]
						            			}
			            					}
			            				}else {
					            			// for(prop in data[mac][card][sid][t1]) {
					            			// 	if (prop == 'errorCounter') {
					            			// 		diff[mac][card][sid][prop] = data[mac][card][sid][t2][prop] - data[mac][card][sid][t1][prop];
					            			// 	}
					            			// }
			            				}
			            				// setTimeout(function() {
			            				// 	delete data[mac][card]['511'];
					            		// 	delete data[mac][card]['512'];
					            		// 	delete data[mac][card]['516'];
			            				// }, 50)
			            				
			            			}
			            		}
				            }
				        }
				        console.log(mac, data, ioms, cpms, mdas)

		            	// $scope.signatureTimestamps = signatureTimestamps;
			            $scope.signatureMatches = data;
			            $scope.diff = diff;
			            $scope.ioms = ioms;
			            $scope.cpms = cpms;
			            $scope.mdas = mdas;
			            $scope.allCompleted = true;
			        
			        });
  				}

  				loadUser()
  					.then(function(result) {
  						installUploader(result)
  					});

  			}
		}
	])
	.controller('playerListCtrl', ['$scope', 'SCCR', 
		function($scope, SCCR) {
			$scope.checkingObj = {};
			

			$scope.firstWed = '2014-09-25';
			$scope.firstMon = '2014-09-30';
			$scope.monGames = [];
			$scope.wedGames = [];

			var excluded = {
				'20141013':1, '20141222':1, '20141229':1, '20150201':1, '20150406':1, '20150518':1, '20141224':1, '20141231':1
			}

			$scope.showMonGames = function() {
				var keepGoing = true;
				var weekDiff = 1000 * 60 * 60 * 24 * 7;
				var baseMon = $scope.firstMon;
				var monGames = [];
				while(keepGoing) {
					var nextMon = new Date(baseMon).getTime() + weekDiff;
					baseMon = nextMon;

					var nxtMonth = new Date(nextMon).getMonth() + 1 < 10 ? '0' + (new Date(nextMon).getMonth() + 1) : String(new Date(nextMon).getMonth() + 1),
						nxtYear = String(new Date(nextMon).getFullYear()),
						nxtDate = new Date(nextMon).getDate() < 10 ? '0' + new Date(nextMon).getDate() : String(new Date(nextMon).getDate()),
						toCheck = nxtYear+nxtMonth+nxtDate;
					
					if(nxtMonth > 5 && nxtYear == 2015) {
						keepGoing = false;
					} else {
						if(!excluded.hasOwnProperty(toCheck)) {
							$scope.monGames.push(nxtYear + '-' + nxtMonth + '-' + nxtDate);
						}
					}
				}
			}

			$scope.showWedGames = function() {
				var keepGoing = true;
				var weekDiff = 1000 * 60 * 60 * 24 * 7;
				var baseWed = $scope.firstWed;
				while(keepGoing) {
					var nextWed = new Date(baseWed).getTime() + weekDiff;
					baseWed = nextWed;
					console.log('next Wednesday: ' + new Date(nextWed));

					var nxtMonth = new Date(nextWed).getMonth() + 1 < 10 ? '0' + (new Date(nextWed).getMonth() + 1) : String(new Date(nextWed).getMonth() + 1),
						nxtYear = String(new Date(nextWed).getFullYear()),
						nxtDate = new Date(nextWed).getDate() < 10 ? '0' + new Date(nextWed).getDate() : String(new Date(nextWed).getDate()),
						toCheck = nxtYear+nxtMonth+nxtDate;
					
					if(nxtMonth > 5 && nxtYear == 2015) {
						keepGoing = false;
					} else {
						if(!excluded.hasOwnProperty(toCheck)) {
							$scope.wedGames.push(nxtYear + '-' + nxtMonth + '-' + nxtDate);
						}
					}
				}
			}

			$scope.gameDays = function() {
				var keepGoing = true;
				var weekDiff = 1000 * 60 * 60 * 24 * 7;
				var baseMon = $scope.firstMon,
					baseWed = $scope.firstWed;
				while(keepGoing) {
					var nextMon = new Date(baseMon).getTime() + weekDiff;
					var nextWed = new Date(baseWed).getTime() + weekDiff;
					baseMon = nextMon;
					baseWed = nextWed;
					console.log('next Monday: ' + new Date(nextMon));
					console.log('next Wednesday: ' + new Date(nextWed));

					var nxtMonth = new Date(nextMon).getMonth(),
						nxtYear = new Date(nextMon).getFullYear();
					if(nxtMonth > 4 && nxtYear == 2015) {
						keepGoing = false;
					}
				}
				
			}

			$scope.addPlayer = function() {
				var player = {
					firstName: $scope.checkingObj.first,
					lastName: $scope.checkingObj.last,
					monday: $scope.checkingObj.monday,
					wednesday: $scope.checkingObj.wednesday,
					email: $scope.checkingObj.email,
					paid: false,
					balance: 0
				};

				SCCR.addPlayer(player)
					.success(function(data) {
						console.log(data)
						$scope.allPlayers();
					})
			}

			$scope.payBalance = function(player) {
				var d = new Date();
				var date = d.getDate();
				var month = d.getMonth();
				var year = d.getFullYear();

				SCCR.payBalance(player, year+'-'+month+'-'+date)
					.success(function(data) {
						$scope.allPlayers();
					})
			}

			$scope.allPlayers = function() {
				$scope.balanceTotal = 0;
				$scope.paidTotal = 0;
				$scope.totalPlayers = 0;
				$scope.totalMonday = 0;
				$scope.totalWednesday = 0;
				
				SCCR.getPlayers({})
					.success(function(data) {
						console.log(data);
						$scope.playerList = data;
						for(index in data) {
							var rec = data[index];
							$scope.balanceTotal += rec.balance;
							$scope.totalPlayers ++;
							if(rec.monday == 'true') {
								$scope.totalMonday++
							} 
							if(rec.wednesday == 'true') {
								$scope.totalWednesday++;
							}
							if(rec.paid) {
								$scope.paidTotal += rec.balance;
							}
						}
					})
			}
			$scope.generateReminder = function() {
				var toRemind = [];
				$scope.showMonGames();
				$scope.showWedGames();
				for(index in $scope.playerList) {
					var player = $scope.playerList[index];
					if(!player.paid) {
						toRemind.push(player);
					}
				}
				SCCR.remind(toRemind, $scope.monGames, $scope.wedGames)
					.success(function(data) {
						console.log(data)
					})
			}
		}
	])
	.controller('scriptContoller', ['$scope', '$timeout', 'SCRIPT', 
		function($scope, $timeout, SCRIPT) {
			$scope.checkingObj = {};
			$scope.checkingObj.host = '138.120.174.55';
			$scope.checkingObj.username = 'admin';
			$scope.checkingObj.password = 'admin';
			$scope.checkingObj.command = 'show log log-id 99';
			$scope.checkingObj.regex = 'LAG 13';
			$scope.checkingObj.action = '';
			$scope.checkingObj.interval = '100';

			$scope.timerRunning = false;
			$scope.counter = 0;
			$scope.found = 0;

			$scope.getAllScripts = function() {
				console.log('calling scripts')
				SCRIPT.getAllScripts()
					.success(function(data) {
						console.log(data);
						$scope.allScripts = data;
					})
			}
 
            var startTimer = function (){
                $scope.$broadcast('timer-start');
                $scope.timerRunning = true;
            };
 
            var stopProc = function() {
            	SCRIPT.stop()
            		.success(function(data) {
            			// 
            		});
            }

            $scope.stopTimer = function (){
                $scope.$broadcast('timer-stop');
                $scope.timerRunning = false;
                stopProc();
            };

			$scope.fanCheck = function() {
				$scope.started = true;
				startTimer();
				SCRIPT.fanCheck(
						$scope.checkingObj.host, 
						$scope.checkingObj.username, 
						$scope.checkingObj.password, 
						$scope.checkingObj.command,
						$scope.checkingObj.regex,
						$scope.checkingObj.interval,
						$scope.user
					)
					.success(function(data) {
						console.log(data);
						if (data.found) {
							$scope.found ++;
						}
						// $scope.allScripts = data;
					})
			}

		}


	]);
