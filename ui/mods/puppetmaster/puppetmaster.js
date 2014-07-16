(function() {
  console.log('puppetmaster')

  model.sandbox(model.cheatAllowCreateUnit())

  var disableAllCheats = function() {
    model.cheatAllowChangeControl(false)
    model.cheatAllowCreateUnit(false)
    model.sandbox(false)
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
