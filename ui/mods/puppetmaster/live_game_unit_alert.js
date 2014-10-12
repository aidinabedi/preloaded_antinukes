(function() {
  console.log('puppetmaster')

  var dropPodSpec = "/pa/puppetmaster/drop_pod_launcher.json"
  var notDropPodEvent = function(alert) {
    return !(alert.watch_type == constants.watch_type.death &&
      alert.spec_id == dropPodSpec)
  }

  var liveGameWatchList = handlers.watch_list
  handlers.watch_list = function(payload) {
    if (liveGameWatchList && payload) {
      payload.list = payload.list.filter(notDropPodEvent)
      liveGameWatchList(payload)
    }
  }
})()
