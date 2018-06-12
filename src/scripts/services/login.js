(function() {

  'use strict';

  function apiArtLoginModalCtrl($scope, $auth, sirtiAlert) {
    $scope.login = function() {
      $auth.login({
        username: $scope.username,
        password: $scope.password
      })
        .then(function(response) {
          console.log(response);
          // console.log($auth.getToken());
          $scope.$close();
        })
        .catch(function(err) {
          // console.log(err);
          sirtiAlert.error(err, { referenceId: 'login-form', ttl: 3000 });
        });
    };
  }
  
  angular

    .module('api-art')

    .service('apiArtLoginModal', function($uibModal) {
      this.open = function() {
        return $uibModal.open({
          ariaDescribedBy: 'modal-body',
          templateUrl: 'views/services/login.html',
          keyboard: false,
          backdrop: 'static',
          size: 'sm',
          controller: apiArtLoginModalCtrl
        });
      };
    })

  ;

})();