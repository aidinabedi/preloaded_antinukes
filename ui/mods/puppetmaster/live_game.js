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

  var enableCheats = function() {
    if (!model.isSpectator()) return

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

  var hackInKeybinding = function(group, key) {
    var action = action_sets[group][key]
    var binding = default_keybinds[group][key]
    console.log(group, key, action, binding, action_sets, default_keybinds)
    var alt
    var use_alt

    if (localStorage['keybinding_' + key] !== undefined)
      binding = decode(localStorage['keybinding_' + key]);

    if (binding && binding.length === 1) {
      alt = binding;
      alt = [alt.toLowerCase(), alt.toUpperCase()];

      if (alt[0] !== alt[1]) {
        use_alt = true;
      }
    }

    var dictionary = input_maps[group].dictionary
    if (use_alt) {
      dictionary[alt[0]] = action
      dictionary[alt[1]] = action
    } else {
      dictionary[binding] = action
    }

    input_maps[group].keymap[binding] = key;
  }

  action_sets.hacks['toggle puppetmaster'] = toggleCheats
  hackInKeybinding('hacks', 'toggle puppetmaster')

  handlers.puppetmasterSpectatorPanelOpened = function() {
    if (model.cheatAllowChangeControl()) {
      model.observerModeCalledOnce(false)
      model.startObserverMode()
    }
  }

  disableCheats()
})()
