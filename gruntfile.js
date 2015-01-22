'use strict';

module.exports = function(grunt) {
	pkg: grunt.file.readJSON('package.json'),
	grunt.initConfig({
		watch: {
			js: {
				files: [
					'gruntfile.js',
					'app.js',
					'app/public/javascripts/*.js',
					'test/**/*.js'
				],
				tasks: ['jshint'],
				options: { livereload: true }
			}, 
			html: {
				files: ['app/server/views/*.jade' ],
				options: { livereload: true }
			}
		},
		jshint: {
			all: {
				src: ['gruntfile.js', 'app.js', 'app/public/javascripts/**', 'test/**/*.js'],
				options: { jshintrc: true }
			}
		},
		uglify: {
			my_target: {
				files: {
					
				}
			}
		},
		cssmin: {
			target: {
				files: {
					

				}
			}
		}, 
		nodemon: {
			dev: {
				script: 'app.js',
				options: {
					args: [],
					// ignore: ['app/public/']
					ext: 'js',
					nodeArgs: ['--debug'],
					delayTime: 1,
					env: {
						PORT: 3000
					},
					cwd: __dirname
				}
			}
		},
		concurrent: {
			task1: ['uglify', 'cssmin'],
			task2: ['nodemon', 'watch'],
			task3: ['jshint', 'mochaTest'],
			options: {
				logConcurrentOutput: true
			}
		},
		express: {
            options: {
                // Override the command used to start the server.
                // (e.g. 'coffee' instead of the default 'node' to enable CoffeeScript support)
                cmd: process.argv[0],
                // Will turn into: `node path/to/server.js ARG1 ARG2 ... ARGN`
                args: [ ],
                // Setting to `false` will effectively just run `node path/to/server.js`
                background: true,
                // Called when the spawned server throws errors
                fallback: function() {},
                // Override node env's PORT
                port: 3000,
                // Override node env's NODE_ENV
                NODE_ENV: undefined,
                // Consider the server to be "running" after an explicit delay (in milliseconds)
                // (e.g. when server has no initial output)
                delay: 0,
                // Regular expression that matches server output to indicate it is "running"
                output: '.+',
                // Set --debug
                debug: false
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: 'results.txt',
                    quiet: false,
                    clearRequireCache: false
                },
                src: ['test/**/*.js']
            }
        }
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['concurrent']);
}