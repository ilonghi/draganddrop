'use strict';

module.exports = function(grunt) {

	grunt.initConfig({
		ngtemplates : {
			'restart': {
				cwd: './src',
				src : 'views/**/*.html', // where my view files are
				dest : '.tmp/tpl.js', // single file of $templateCache
				standalone: false	// expects module 'restart' is available (default=false)
			}
		},
		concat : {
			dist : {
				src : [ 'src/restart.js', 'src/scripts/**/*.js', '.tmp/tpl.js' ],
				dest : 'dist/restart.js'
			},
			distcss : {
				src : [ 'src/css/*.css' ],
				dest : 'dist/restart.css'
			}
		},
		watch: {
			js: {
				files: [
					'./src/**/*.js'
				],
				tasks: [
					'newer:jshint:all',
					'newer:jscs:all'
				],
				options: {
					livereload: '<%= connect.options.livereload %>'
				}
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'./src/**/*.html',
					'./src/**/*.css'
				]
			},
			gruntfile: {
				files: [
					'Gruntfile.js'
				]
			}
		},
		connect: {
			options: {
				port: process.env.GRUNT_SERVE_PORT || 9000,
				hostname: 'localhost',
				livereload: process.env.GRUNT_LIVERELOAD_PORT || 35729
			},
			livereload: {
				options: {
					open: true,
					middleware: function (connect) {
						return [
							connect.static('./src'),
							connect().use(
								'/dist',
								connect.static('./dist')
							),
							connect().use(
								'/bower_components',
								connect.static('./bower_components')
							)
						];
					}
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: {
				src: [
					'Gruntfile.js',
					'src/**/*.js'
				]
			}
		},
		jscs: {
			options: {
				config: '.jscsrc'
			},
			all: {
				src: [
					'Gruntfile.js',
					'src/**/*.js'
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-newer');

	grunt.registerTask('build', [ 'newer:jshint', 'newer:jscs', 'ngtemplates:restart', 'concat:dist', 'concat:distcss' ]);

	grunt.registerTask('serve', [ 'connect:livereload', 'watch' ]);

	grunt.registerTask('default', [ 'build' ]);

};
