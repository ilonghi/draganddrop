'use strict';

angular

.module('sApp', ['restart'])

//.config(function(restartConfigProvider) {
//  restartConfigProvider.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
//  restartConfigProvider.setWsartRoutesPrefix('http://dvmas003.ict.sirti.net:10128/wphdtfows/api/art/');
//  restartConfigProvider.setAuthType('JWT');
//  restartConfigProvider.setAuthType('cookie');
//})

.run(function(restartConfig) {
  restartConfig.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
  // restartConfig.setWsartRoutesPrefix('http://dvmas003.ict.sirti.net:10128/wphdtfows/api/art/');
  // restartConfig.setAuthType('JWT');
  restartConfig.setAuthType('cookie');
})

.controller('sCtrl', function($scope, restartLogout, $location, $window, restartUserProfile, restartIsAuthenticated) {
  
  $scope.user = restartUserProfile.get();
  
  $scope.isAuthenticated = function() {
    return restartIsAuthenticated();
  };
  
  $scope.logout = function() {
    restartLogout(function() {
      $location.url('/');
      $window.location.reload();
    });
  };
})

;
