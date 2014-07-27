var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.puppetmaster/'
var stream = 'stable'
var media = require('./lib/path').media(stream)
var build = 'ui/main/shared/js/build.js'
var common = 'ui/main/shared/js/common.js'
var live_game = 'ui/mods/puppetmaster/live_game.js'
var live_game_devmode = 'ui/mods/puppetmaster/live_game_devmode.js'
var live_game_players = 'ui/mods/puppetmaster/live_game_players.js'

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    copy: {
      common: {
        files: [
          {
            src: media + common,
            dest: common,
          },
        ],
      },
      back: {
        files: [
          {
            src: modPath + live_game,
            dest: live_game,
          },
          {
            src: modPath + live_game_devmode,
            dest: live_game_devmode,
          },
          {
            src: modPath + live_game_players,
            dest: live_game_players,
          },
        ],
      },
      mod: {
        files: [
          {
            src: [
              'modinfo.json',
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'ui/**',
              'pa/**',
              'server-script/**'],
            dest: modPath,
          },
        ],
      },
    },
    jsonlint: {
      all: {
        src: [
          'pa/ammo/**/*.json',
          'pa/tools/**/*.json',
          'pa/units/**/*.json'
        ]
      },
    },
    json_schema: {
      all: {
        files: {
          'lib/schema.json': [
            'pa/ammo/**/*.json',
            'pa/tools/**/*.json',
            'pa/units/**/*.json'
          ]
        },
      },
    },
    proc: {
      health: {
        filename_regexp: null,
        process: function(spec) {
          if (spec.max_health) {
            spec.max_health *= 2
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsonlint');
  grunt.loadNpmTasks('grunt-json-schema');

  grunt.registerTask('copy:unitFiles', 'copy files into the mod from PA', function() {
    var done = this.async()
    prompt.get(['filename_regexp'], function(err,result) {
      var specs = spec.specFiles(grunt, result.filename_regexp, media)
      spec.copyUnitFiles(grunt, specs)
      done()
    })
  })

  var proc = function(filename_regexp, process) {
    var specs = spec.specFiles(grunt, filename_regexp)
    spec.copyUnitFiles(grunt, specs, process)
  }

  grunt.registerMultiTask('proc', 'Process unit files', function() {
    var process = this.data.process
    if (this.data.filename_regexp) {
      proc(this.data.filename_regexp, process)
    } else {
      var done = this.async()
      prompt.get(['filename_regexp'], function(err,result) {
        proc(result.filename_regexp, process)
        done()
      })
    }
  })

  grunt.registerTask('hackCommon', 'Add mod hook to common.js', function() {
    var text = grunt.file.read(common)
    var ext = grunt.file.read('common_extensions.js')
    grunt.file.write(common, text + ext)
  })

  // Default task(s).
  grunt.registerTask('default', ['copy:common', 'hackCommon', 'copy:mod']);

};

