(function() {
  console.log('puppetmaster')

  var mouseX = 0
  var mouseY = 0
  var hdeck = model.holodeck
  var lastHover = {name: '', spec: ''}
  var selectedUnit = lastHover
  var previousPlayerControl = -1

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

  var dropPod = function() {
    engineCall("unit.debug.setSpecId", "/pa/puppetmaster/drop_pod_launcher.json")
    engineCall("unit.debug.paste")
    engineCall("unit.debug.setSpecId", selectedUnit.spec)
  }

  var pasteCount = ko.observable(0)
  pasteCount.subscribe(function(count) {
    api.panels.devmode && api.panels.devmode.message('pasteCount', count);
  })
  var pasteReset = null
  var resetCount = function() {
    announceGift(selectedPlayer(), pasteCount(), selectedUnit.name)

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
      dropPod()
      increment()
      maybePing()
    } else if (method == 'unit.debug.copy') {
      selectedUnit = lastHover
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

  handlers.puppetmasterSpectatorPanelStatus = function(status) {
    if (model.cheatAllowChangeControl()) {
      if (status) {
        previousPlayerControl = model.playerControlFlags().indexOf(true)
        model.observerModeCalledOnce(false)
        model.startObserverMode()
      } else if (previousPlayerControl != -1) {
        api.panels.devmode.message('puppetmasterRestoreControl', previousPlayerControl)
      }
    }
  }

  handlers.puppetmasterUnitSelected = function(spec) {
    var unit = model.unitSpecs[spec]
    selectedUnit = {spec: spec, name: (unit && unit.name) || 'unknown'}
  }

  var liveGameHover = handlers.hover
  handlers.hover = function(payload) {
    liveGameHover(payload)

    if (payload) {
      lastHover = {spec: payload.spec_id || '', name: payload.name || 'unknown'}
    }
  }

  disableCheats()
})()
