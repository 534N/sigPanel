
angular.module('bookingDirective')
    .directive('sigEditPanel', ['Load', 'mySharedService', '_', 'PCRE',
        function(Load, mySharedService, _, PCRE) {
            return {
                restrict: 'EA',
                scope: {
                    data: '=', // bi-directional data-binding
                    sig: '=',
                    mine: '=', 
                    row: '=',
                    rackInRow: '&callbackFn',
                    user: '='
                },
                templateUrl: '../partials/sigEdit', 
                link: function(scope, ele, attrs) {
                    console.log(scope.sigs)
                    scope.active = 0;
                    // keep track of savable status of each test
                    scope.savable = [];
                    // keep track of editing status of each test
                    scope.editing = [];
                    // keep track of the content of each test
                    scope.tests = [];
                    // keep track of editing status of each test's editing content
                    scope.editings = [];
                    // keep track of the alert status of each test
                    scope.alerts = [];

                    var encodeRegex = function(regex) {
                        // 
                        // encoding regex string
                        // 
                        regex   = regex.replace(/\\/g, "_bs_");
                        regex   = regex.replace(/\//g, "_fs_");
                        regex   = regex.replace(/ /g, "_space_");
                        regex   = regex.replace(/\(/g, "_ob_");
                        regex   = regex.replace(/\)/g, "_cb_");
                        regex   = regex.replace(/\?/g, "_qm_");
                        regex   = regex.replace(/\:/g, "_cl_");
                        regex   = regex.replace(/\+/g, "_plus_");
                        regex   = regex.replace(/\</g, "_aob_");
                        regex   = regex.replace(/\>/g, "_acb_");
                        regex   = regex.replace(/\[/g, "_sob_");
                        regex   = regex.replace(/\]/g, "_scb_");
                        regex   = regex.replace(/\{/g, "_cob_");
                        regex   = regex.replace(/\}/g, "_ccb_");
                        regex   = regex.replace(/\./g, "_dot_");
                        regex   = regex.replace(/\*/g, "_star_");
                        regex   = regex.replace(/\,/g, "_cma_");
                        regex   = regex.replace(/\|/g, "_bar_");
                        regex   = regex.replace(/\"/g, "_dq_");
                        regex   = regex.replace(/\'/g, "_sq_");
                        
                        return regex;
                    }

                    scope.hasContent = function(data) {
                        if(data){
                            return !_.isEmpty(data.releases)
                        } else {
                            return false;
                        }
                        
                    }
                    scope.isMine = function(sid) {
                        if (typeof(scope.mine[scope.user.csl]) != 'undefined') {
                            if (scope.mine[scope.user.csl].indexOf(sid) != -1) {
                                return true;
                            }
                        }
                        
                        return false;
                    }
                    scope.colorScheme = function(sid) {
                        if(scope.isMine(sid) && scope.user.authenticated) {
                            return 'mine';
                        } 
                    }
                    scope.setActive = function(rel, index) {
                        formattedRelrease = 'release_' + rel.replace(/\./g, '_');
                        // ***
                        // initialize the second layer of array
                        // ***
                        if (!scope.tests[formattedRelrease]) {
                            scope.tests[formattedRelrease] = [];
                        } 
                        if (!scope.savable[formattedRelrease]) {
                            scope.savable[formattedRelrease] = [];
                        } 
                        if (!scope.editing[formattedRelrease]) {
                            scope.editing[formattedRelrease] = [];
                        } 
                        if (!scope.editings[formattedRelrease]) {
                            scope.editings[formattedRelrease] = [];
                        } 
                        if (!scope.alerts[formattedRelrease]) {
                            scope.alerts[formattedRelrease] = [];
                        }
                        // set the active index
                        scope.active = index;
                    }
                    scope.updateSigTest = function(newRelease) {
                        formattedRelrease = 'release_' + newRelease.replace(/\./g, '_');

                        scope.data.releases[formattedRelrease] = { 'rel': newRelease, 'regex': ''};
                        Load.updateSigTest(scope.data, scope.user)
                            .success(function(data) {
                                // mySharedService.prepForBroadcast('refreshNodeList')
                                console.log('DONE: ' + data);
                            })
                            .error(function(data) {
                                console.log('ERR: ' + data);
                            });
                    }
                    scope._updateSigTest = function(deleteRelease) {
                        formattedRelrease = 'release_' + deleteRelease.replace(/\./g, '_');
                        delete scope.data.releases[formattedRelrease];
                        Load.updateSigTest(scope.data, scope.user)
                            .success(function(data) {
                                // mySharedService.prepForBroadcast('refreshNodeList')
                                console.log('DONE: ' + data);
                            })
                            .error(function(data) {
                                console.log('ERR: ' + data);
                            });
                    }
                    scope.cancelEdit = function(rel, tid) {
                        scope.savable[rel][tid] = false;
                        scope.editing[rel][tid] = false;
                    }
                    scope.enableEdit = function(rel, tid) {
                        scope.editing[rel][tid] = true;
                    }
                    scope.setValues = function(relObj, test, rel, tid) {
                        // ***
                        // initialize the second layer of array
                        // ***
                        if (!scope.tests[rel]) {
                            scope.tests[rel] = [];
                        } 
                        if (!scope.savable[rel]) {
                            scope.savable[rel] = [];
                        } 
                        if (!scope.editing[rel]) {
                            scope.editing[rel] = [];
                        } 
                        if (!scope.editings[rel]) {
                            scope.editings[rel] = [];
                        } 
                        if (!scope.alerts[rel]) {
                            scope.alerts[rel] = [];
                        } 
                        // ***
                        // initialize the object
                        // 
                        if (!scope.tests[rel][tid]) {
                            scope.tests[rel][tid] = {};
                        } 
                        if (!scope.editings[rel][tid]) {
                            scope.editings[rel][tid] = {};
                        } 
                        if (!scope.savable[rel][tid]) {
                            scope.savable[rel][tid] = false;
                        }
                        if (!scope.editings[rel][tid]) {
                            scope.editings[rel][tid] = {};
                        } 
                        if (!scope.alerts[rel][tid]) {
                            scope.alerts[rel][tid] = {};
                        } 
                        // if(relObj.regex) {
                        //     console.log(scope.tests[rel][tid].regex)
                        //     scope.tests[rel].regex = decodeRegex(relObj.regex);
                        //     scope.tests[rel][tid].regex = decodeRegex(relObj.regex);
                        //     console.log(scope.tests[rel][tid].regex)
                        // }
                        if(test.regex)   scope.tests[rel][tid].regex    = decodeRegex(test.regex);
                        if(test.context) scope.tests[rel][tid].context  = decodeContext(test.context);
                        if(test.matches) scope.tests[rel][tid].matches  = test.matches;
                        if(test.command) scope.tests[rel][tid].command  = test.command;
                        if(test.command) scope.tests[rel][tid].commandType = test.commandType ? test.commandType: 'CLI Command';

                    }

                    var decodeRegex = function(regex) {
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
                        return regex;
                    };

                    scope.commandTypes = {
                        '1': { 'type': 'CLI Command' },
                        '2': { 'type': 'Local Shell Command'},
                        '3': { 'type': 'Shell Command'}
                    }

                    var decodeContext = function(context) {
                        if(context) {
                            context = context.replace(/_LBR_/g, '\n');
                            context = context.replace(/_dq_/g, '"');
                            context = context.replace(/_sq_/g, "'");
                        }
                        return context;
                    }

                    scope.setCommand = function(command, rel, tid) {
                        scope.editings[rel][tid].command = command;
                    }

                    scope.setCommandType = function(commandType, rel, tid) {
                        scope.editings[rel][tid].commandType = commandType;
                    }

                    scope.tryRegex = function(regex, context, rel, tid) {
                        console.log('regex: ', regex)
                        console.log('context: ', context)
                        console.log('scope tests: ', scope.tests[rel])
                        if(regex) {
                            // 
                            // encoding regex string
                            // 
                            regex   = regex.replace(/\\/g, "_bs_");
                            regex   = regex.replace(/\//g, "_fs_");
                            regex   = regex.replace(/ /g, "_space_");
                            regex   = regex.replace(/\(/g, "_ob_");
                            regex   = regex.replace(/\)/g, "_cb_");
                            regex   = regex.replace(/\?/g, "_qm_");
                            regex   = regex.replace(/\:/g, "_cl_");
                            regex   = regex.replace(/\+/g, "_plus_");
                            regex   = regex.replace(/\</g, "_aob_");
                            regex   = regex.replace(/\>/g, "_acb_");
                            regex   = regex.replace(/\[/g, "_sob_");
                            regex   = regex.replace(/\]/g, "_scb_");
                            regex   = regex.replace(/\{/g, "_cob_");
                            regex   = regex.replace(/\}/g, "_ccb_");
                            regex   = regex.replace(/\./g, "_dot_");
                            regex   = regex.replace(/\*/g, "_star_");
                            regex   = regex.replace(/\,/g, "_cma_");
                            regex   = regex.replace(/\|/g, "_bar_");
                            regex   = regex.replace(/\"/g, "_dq_");
                            regex   = regex.replace(/\'/g, "_sq_");
                            
                            scope.savable[rel][tid] = true;
                            scope.editings[rel][tid].regex = regex;
                            scope.editings[rel].regex = regex;
                        }
                        if(context) {
                            // 
                            // encoding context string
                            // 
                            context = context.replace(/\n/g, '_LBR_');
                            
                            scope.savable[rel][tid] = true;
                            scope.editings[rel][tid].context = context;
                        }
                        
                        if (regex && context) {
                            PCRE.regexTest(regex, context, rel, scope.data.sid, tid)
                                .success(function(data) {

                                    for(var testID in data) {
                                        scope.tests[rel][testID].matches = data[testID];
                                        scope.editings[rel][testID].matches = data[testID];
                                        scope.data.releases[rel].tests[testID-1].matches = data[testID];
                                        if (_.isEmpty(data[testID])) {
                                            scope.alerts[rel][testID].disableSave = true;
                                            scope.alerts[rel][testID].alert = 'No Match';
                                        } else {
                                            scope.alerts[rel][testID].disableSave = false;
                                            scope.alerts[rel][testID].alert = '';
                                        }
                                    }
                                    
                                })
                                .error(function(data) {
                                    console.log(data)
                                });
                        }
                    }

                    scope.publishStatus = function(pStatus) {
                        if(pStatus == 'waiting') {
                            return 'waiting';
                        } else if(pStatus == true) {
                            return 'private';
                        } else if(pStatus == false){
                            return 'public';
                        }
                    }

                    scope.removeTest = function(rel, tid) {
                        console.log(scope.data);
                        Load.removeTest(scope.data, scope.user, rel, tid)
                            .success(function(data) {
                                scope.data.releases[rel].tests.splice(tid-1, 1);
                            })
                            .error(function(data) {
                                console.log('ERR: ' + data);
                            });
                    }

                    scope.saveTest = function(rel, tid) {
                        var flag = tid;
                        formattedRelrease = 'release_' + rel.replace(/\./g, '_');
                        if (flag == 'tmp') {
                            if (scope.data.releases[formattedRelrease].tests) {
                                tid = scope.data.releases[formattedRelrease].tests.length + 1;
                            } else {
                                tid = 1;
                            }
                            console.log('TMP TID: ' + tid)
                        }
                        // ***
                        // In case we did not initialize the release layer array
                        // initialize the second layer of array
                        // ***
                        if (!scope.tests[formattedRelrease]) {
                            scope.tests[formattedRelrease] = [];
                        } 
                        if (!scope.savable[formattedRelrease]) {
                            scope.savable[formattedRelrease] = [];
                        } 
                        if (!scope.editing[formattedRelrease]) {
                            scope.editing[formattedRelrease] = [];
                        } 
                        if (!scope.editings[formattedRelrease]) {
                            scope.editings[formattedRelrease] = [];
                        } 
                        // ***
                        // In case this is the first ever test in the release, 
                        // we need to initialize the object
                        // ***
                        if (!scope.tests[formattedRelrease][tid]) {
                            scope.tests[formattedRelrease][tid] = {};
                        } 
                        if (!scope.editings[formattedRelrease][tid]) {
                            scope.editings[formattedRelrease][tid] = {};
                        } 
                        if (!scope.savable[formattedRelrease][tid]) {
                            scope.savable[formattedRelrease][tid] = false;
                        }
                        if (!scope.editings[formattedRelrease][tid]) {
                            scope.editings[formattedRelrease][tid] = {};
                        } 

                        var context = scope.editings[formattedRelrease][tid].context ? scope.editings[formattedRelrease][tid].context : scope.tests[formattedRelrease][tid].context;
                        if (context) {
                            context = context.replace(/\"/g, '_dq_');
                            context = context.replace(/\'/g, '_sq_');
                        }
                        

                        var commandType = 'CLI Command';
                        if (scope.user.authenticated) {
                            if (scope.user.permissions.tec) {
                                commandType = scope.editings[formattedRelrease][tid].commandType ? scope.editings[formattedRelrease][tid].commandType : scope.tests[formattedRelrease][tid].commandType;
                            }
                        }


                        if (typeof(scope.editings[formattedRelrease][tid].regex) == 'undefined' && typeof(scope.tests[formattedRelrease][tid].regex) == 'undefined') {
                            var theRegex = '';
                        } else {
                            var theRegex = scope.editings[formattedRelrease][tid].regex ? encodeRegex(scope.editings[formattedRelrease][tid].regex) : encodeRegex(scope.tests[formattedRelrease][tid].regex);
                        }

                        var thisTest = {
                            tid: tid,
                            commandType: commandType,
                            command: scope.editings[formattedRelrease][tid].command ? scope.editings[formattedRelrease][tid].command : scope.tests[formattedRelrease][tid].command,
                            regex: theRegex,
                            context: context,
                            matches: scope.editings[formattedRelrease][tid].matches ? scope.editings[formattedRelrease][tid].matches : scope.tests[formattedRelrease][tid].matches,
                            private: true
                        }
                        if(!scope.data.releases[formattedRelrease].tests) {
                            scope.data.releases[formattedRelrease].tests = [];
                        }
                        scope.data.releases[formattedRelrease].tests[tid-1] = thisTest;
                        scope.data.releases[formattedRelrease].regex = theRegex;
                        // console.log(scope.editings[formattedRelrease], tid)
                        // scope.data.releases[formattedRelrease][tid].regex = scope.editings[formattedRelrease][tid].regex ? scope.editings[formattedRelrease][tid].regex : '',
                        if(flag != 'tmp') {
                            Load.updateSigTest(scope.data, scope.user)

                                .success(function(data) {
                                    scope.savable[formattedRelrease][tid] = false;
                                })
                                .error(function(data) {
                                    console.log('ERR: ' + data);
                                });
                        }
                        if(flag == 'tmp') {
                            scope.enableEdit(formattedRelrease, tid);
                            scope.setValues(thisTest, formattedRelrease, tid);                            
                        }
                    }
                }
            }
        }
    ]);
    