(function() {
  console.log('puppetmaster')

  var mouseX = 0
  var mouseY = 0
  var hdeck = model.holodeck
  var puppetmasterSelectedUnit = ko.observable('')
  var puppetmasterLastHover = ''

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

  var announceGift = function(who, count, what) {
    model.send_message("team_chat_message",
      {message: who + ' gets ' + count.toString() + ' ' + what });
  }

  var selectedPlayer = ko.computed(function() {
    var index = model.playerControlFlags().indexOf(true)
    if (index == -1) {
      return 'nobody'
    } else {
      return model.players()[index].name
    }
  })

  var pasteCount = ko.observable(0)
  pasteCount.subscribe(function(count) {
    api.panels.devmode && api.panels.devmode.message('pasteCount', count);
  })
  var pasteReset = null
  var resetCount = function() {
    announceGift(selectedPlayer(), pasteCount(), puppetmasterSelectedUnit())

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
    } else if (method == 'unit.debug.copy') {
      puppetmasterSelectedUnit(puppetmasterLastHover)
    }

    return engineCall.apply(this, arguments);
  }

  var hasBeenPlayer = !model.isSpectator()

  model.isSpectator.subscribe(function(value) {
    if (value == false) {
      hasBeenPlayer = true
    }
  })

  var enableCheats = function() {
    if (hasBeenPlayer) return

    model.cheatAllowChangeControl(true)
    model.cheatAllowCreateUnit(true)
    model.sandbox(true)
    engine.call = puppetmaster
    $('body').on('mousemove', 'holodeck', mousetrack)
  }

  var disableCheats = function() {
    model.devMode(false)
    model.cheatAllowChangeControl(false)
    model.cheatAllowCreateUnit(false)
    model.sandbox(false)
    engine.call = puppet
    $('body').off('mousemove', 'holodeck', mousetrack)
  }

  var toggleCheats = function() {
    console.log('toggle')
    if (model.cheatAllowCreateUnit()) {
      disableCheats()
    } else {
      enableCheats()
    }
  }

  action_sets.hacks['toggle puppetmaster'] = toggleCheats
  api.Panel.message('', 'inputmap.reload');

  handlers.puppetmasterSpectatorPanelOpened = function() {
    if (model.cheatAllowChangeControl()) {
      model.observerModeCalledOnce(false)
      model.startObserverMode()
    }
  }

  handlers.puppetmasterUnitSelected = function(spec) {
    var unit = model.unitSpecs[spec]
    if (unit && unit.name) {
      puppetmasterSelectedUnit(unit.name)
    }
  }

  var liveGameHover = handlers.hover
  handlers.hover = function(payload) {
    liveGameHover(payload)

    if (payload && payload.name) {
      puppetmasterLastHover = payload.name
    }
  }

  disableCheats()
})()
