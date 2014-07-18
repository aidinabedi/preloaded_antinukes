(function() {
  console.log('puppetmaster')

  var puppetmaster = engine.call
  var puppet = function(method) {
    if (method == 'unit.debug.paste') {
      console.log("Sorry, you're a puppet")
      return undefined;
    } else {
      return puppetmaster.apply(this, arguments);
    }
  }

  model.sandbox(model.cheatAllowCreateUnit())
  engine.call = puppetmaster

  var disableAllCheats = function() {
    model.devMode(false)
    model.cheatAllowChangeControl(false)
    model.cheatAllowCreateUnit(false)
    model.sandbox(false)
    engine.call = puppet
  }

  if (model.isSpectator() == false) {
    disableAllCheats()
  }

  model.isSpectator.subscribe(function(value) {
    console.log('spectator', value)
    if (value == false) {
      disableAllCheats()
    }
  })

  var mouseX = 0
  var mouseY = 0

  var originalMousemove = model.globalMousemoveHandler
  model.globalMousemoveHandler = function(m, e) {
    mouseX = e.offsetX
    mouseY = e.offsetY
    originalMousemove(e)
  }

  var key
  _.forIn(input_maps.hacks.keymap, function(action, combo) {
    if (action == 'paste unit') {
      key = combo
    }
  })

  var originalPaste = api.unit.debug.paste
  input_maps.hacks.dictionary[key] =
    action_sets.hacks['paste unit'] =
    api.unit.debug.paste = 
      function() {
        originalPaste.apply(this, arguments)
        setTimeout(function() {model.holodeck.unitCommand('ping', mouseX, mouseY, false)}, 0)
      }

})()
