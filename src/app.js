'use strict';

angular

.module('sApp', ['api-art'])

//.config(function(apiArtConfigProvider) {
//  apiArtConfigProvider.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
//})

.run(function(apiArtConfig) {
  apiArtConfig.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
})

.controller('sCtrl', function() {
})

;
