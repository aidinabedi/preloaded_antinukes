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

  var lastPingTime = 0
  var ping = function() {
    lastPingTime = Date.now()
    hdeck.unitCommand('ping', mouseX, mouseY, false)
  }

  var maybePing = function() {
    if (Date.now() - lastPingTime > 500) {
      setTimeout(ping, 0)
    }
  }

  var pasteCount = ko.observable(0)
  pasteCount.subscribe(function(count) {
    api.panels.devmode && api.panels.devmode.message('pasteCount', count);
  })
  var pasteReset = null
  var resetCount = function() {
    console.log('reset')
    pasteCount(0)
    clearTimeout(pasteReset)
    pasteReset = null
  }
  var increment = function() {
    pasteCount(pasteCount() + 1)
    clearTimeout(pasteReset)
    pasteReset = setTimeout(resetCount, 2000)
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
      increment()
      maybePing()
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
