var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.puppetmaster/'
var stream = 'stable'
var media = require('./lib/path').media(stream)
var build = 'ui/main/shared/js/build.js'
var common = 'ui/main/shared/js/common.js'
var live_game = 'ui/mods/puppetmaster/live_game.js'
var live_game_unit_alert = 'ui/mods/puppetmaster/live_game_unit_alert.js'
var live_game_devmode = 'ui/mods/puppetmaster/live_game_devmode.js'
var live_game_players = 'ui/mods/puppetmaster/live_game_players.js'
var live_game_sandbox = 'ui/mods/puppetmaster/live_game_sandbox.js'

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
            src: modPath + live_game_unit_alert,
            dest: live_game_unit_alert,
          },
          {
            src: modPath + live_game_devmode,
            dest: live_game_devmode,
          },
          {
            src: modPath + live_game_players,
            dest: live_game_players,
          },
          {
            src: modPath + live_game_sandbox,
            dest: live_game_sandbox,
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
              'com.wondible.pa.puppetmaster/**',
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
      nuke: {
        src: [
          'pa/units/land/nuke_launcher/nuke_launcher.json',
          'pa/units/land/nuke_launcher/nuke_launcher_ammo.json'
        ],
        cwd: media,
        dest: 'pa/units/land/nuke_launcher/nuke_launcher.json',
        process: function(spec, ammo) {
          spec.factory.default_ammo = [ spec.factory.initial_build_spec ]
          spec.build_metal_cost += ammo.build_metal_cost
          return spec
        }
      },
      antinuke: {
        src: [
          'pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json',
          'pa/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json'
        ],
        cwd: media,
        dest: 'pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json',
        process: function(spec, ammo) {
          spec.factory.default_ammo = [ spec.factory.initial_build_spec ]
          spec.build_metal_cost += ammo.build_metal_cost
          return spec
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsonlint');
  grunt.loadNpmTasks('grunt-json-schema');

  grunt.registerMultiTask('proc', 'Process unit files', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      spec.copyUnitFiles(grunt, specs, this.data.process)
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  grunt.registerTask('hackCommon', 'Add mod hook to common.js', function() {
    var text = grunt.file.read(common)
    var ext = grunt.file.read('common_extensions.js')
    grunt.file.write(common, text + ext)
  })

  // Default task(s).
  grunt.registerTask('default', ['proc', 'copy:common', 'hackCommon', 'copy:mod']);

};

