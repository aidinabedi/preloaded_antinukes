(function() {
  console.log('puppetmaster')

  model.pinSpectatorPanel.subscribe(function(value) {
    if (value) {
      api.Panel.message(api.Panel.parentId, 'puppetmasterSpectatorPanelOpened'); 
    }
  })
})()
