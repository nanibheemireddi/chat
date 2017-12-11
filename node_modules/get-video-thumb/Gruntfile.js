"use strict";

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        buster: {
            default: {}
        },
        jshint: {
            src: [ "src/**/*.js", "test/**/*.js" ],
            options: { jshintrc: true }
        }
    });
    grunt.loadNpmTasks('grunt-buster');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('default', ['jshint', 'buster']);
};