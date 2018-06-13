'use strict';

angular

.module('sApp', ['api-art'])

//.config(function(apiArtConfigProvider) {
//  apiArtConfig.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
//  apiArtConfig.setWsartRoutesPrefix('http://dvmas003.ict.sirti.net:10128/wphdtfows/api/art/');
//})

.run(function(apiArtConfig) {
  apiArtConfig.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
  // apiArtConfig.setWsartRoutesPrefix('http://dvmas003.ict.sirti.net:10128/wphdtfows/api/art/');
})

.controller('sCtrl', function() {
})

;
