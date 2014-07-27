(function() {
  console.log('puppetmaster')

  model.pasteCount = ko.observable(0)

  $('.container div:first').append(' <span data-bind="text: pasteCount">0</span>')

  handlers.pasteCount = function(count) {
    model.pasteCount(count)
  }

  handlers.puppetmasterRestoreControl = model.updatePlayerControlFlag

})()
