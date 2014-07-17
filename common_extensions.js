scene_mod_list['live_game'].push('coui://ui/mods/puppetmaster/live_game.js');

engine.puppetmaster = engine.call
engine.puppet = function(method) {
  if (method == 'unit.debug.paste') {
    console.log("Sorry, you're a puppet")
    return undefined;
  } else {
    return engine.puppetmaster.apply(this, arguments);
  }
}
engine.call = engine.puppet
