(scene_mod_list['live_game'] = scene_mod_list['live_game'] || []).
  unshift('coui://ui/mods/puppetmaster/live_game.js');
(scene_mod_list['live_game_devmode'] = scene_mod_list['live_game_devmode'] || []).
  unshift('coui://ui/mods/puppetmaster/live_game_devmode.js');
(scene_mod_list['live_game_players'] = scene_mod_list['live_game_players'] || []).
  unshift('coui://ui/mods/puppetmaster/live_game_players.js');

action_sets.hacks['toggle puppetmaster'] = function () {} // stub
default_keybinds.hacks['toggle puppetmaster'] = 'alt+ctrl+shift+p'

if (window.location.href != 'coui://ui/main/game/live_game/live_game.html') {
  (function() {
    var originalCall = engine.call
    engine.call = function(method) {
      if (method == 'unit.debug.paste') {
        console.log("Sorry, you're a puppet")
        return undefined;
      } else {
        return originalCall.apply(this, arguments);
      }
    }
  })()
}
