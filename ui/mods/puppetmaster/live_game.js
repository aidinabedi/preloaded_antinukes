(function() {
  console.log('puppetmaster')

  model.sandbox(model.cheatAllowCreateUnit())
  engine.call = engine.puppetmaster

  var disableAllCheats = function() {
    model.devMode(false)
    model.cheatAllowChangeControl(false)
    model.cheatAllowCreateUnit(false)
    model.sandbox(false)
    engine.call = engine.puppet
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
