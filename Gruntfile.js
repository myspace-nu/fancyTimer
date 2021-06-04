module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*!\n'+
                ' * fancyTimer v<%= pkg.version %>\n'+
                ' * https://github.com/myspace-nu\n'+
                ' *\n'+
                ' * Copyright 2021 Johan Johansson\n'+
                ' * Released under the MIT license\n'+
                ' */\n'
            },
            build: {
                src: 'src/fancyTimer.js',
                dest: 'dist/fancyTimer.min.js'
            }
        },
        cssmin: {
            target: {
              files: {
                // 'dist/fancyTimer.min.css': ['src/fancyTimer.css']
              }
            }
          }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['uglify','cssmin']);
};