(function() {
  console.log('puppetmaster')

  var mouseX = 0
  var mouseY = 0
  var hdeck = model.holodeck

  var mousetrack = function(e) {
    mouseX = e.offsetX
    mouseY = e.offsetY
    hdeck = $(this).data('holodeck')
  }

  var engineCall = engine.call
  var puppet = function(method) {
    if (method == 'unit.debug.paste') {
      console.log("Sorry, you're a puppet")
      return undefined;
    } else {
      return engineCall.apply(this, arguments);
    }
  }
  var puppetmaster = function(method) {
    if (method == 'unit.debug.paste') {
      setTimeout(function() {hdeck.unitCommand('ping', mouseX, mouseY, false)}, 0)
    }

    return engineCall.apply(this, arguments);
  }

  model.sandbox(model.cheatAllowCreateUnit())
  engine.call = puppetmaster
  $('body').on('mousemove', 'holodeck', mousetrack)

  var disableAllCheats = function() {
    model.devMode(false)
    model.cheatAllowChangeControl(false)
    model.cheatAllowCreateUnit(false)
    model.sandbox(false)
    engine.call = puppet
    $('body').off('mousemove', 'holodeck', mousetrack)
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
})()
