'use strict';

angular

.module('sApp', ['api-art'])

//.config(function(apiArtConfigProvider) {
//  apiArtConfigProvider.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
//  apiArtConfigProvider.setWsartRoutesPrefix('http://dvmas003.ict.sirti.net:10128/wphdtfows/api/art/');
//  apiArtConfigProvider.setAuthType('JWT');
//  apiArtConfigProvider.setAuthType('cookie');
//})

.run(function(apiArtConfig) {
  apiArtConfig.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
  // apiArtConfig.setWsartRoutesPrefix('http://dvmas003.ict.sirti.net:10128/wphdtfows/api/art/');
  // apiArtConfig.setAuthType('JWT');
  apiArtConfig.setAuthType('cookie');
})

.controller('sCtrl', function($scope, apiArtLogout, $location, $window) {
  $scope.logout = function() {
    apiArtLogout(function() {
      $location.url('/');
      $window.location.reload();
    });
  };
})

;
