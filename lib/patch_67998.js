var fixAnim = function(object) {
  if (object.animtree && !object.animtree.match(/_anim_tree.json$/)) {
    object.animtree = object.animtree.replace(/.json$/, '_anim_tree.json')
  }
}

module.exports.fixSpecs = function(grunt) {
  var specLib = require('./spec')
  var specs = specLib.specFiles(grunt)
  specLib.copyUnitFiles(grunt, specs, function(spec) {
    if (spec.events && spec.events.firing) {
      spec.events.fired = spec.events.firing
      delete(spec.events.firing)
    }

    if (spec.model) {
      if (Array.isArray(spec.model)) {
        spec.model.forEach(fixAnim)
      } else {
        fixAnim(spec.model)
      }
    }
  })
}
