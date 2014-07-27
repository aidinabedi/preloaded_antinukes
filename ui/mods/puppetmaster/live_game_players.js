(function() {
  console.log('puppetmaster')

  model.pinSpectatorPanel.subscribe(function(value) {
    api.Panel.message(api.Panel.parentId, 'puppetmasterSpectatorPanelStatus', value); 
  })
})()
