(function() {

  'use strict';

  function restartLoginModalCtrl($scope, $auth, sirtiAlert) {
    $scope.login = function() {
      $auth.login({
        username: $scope.username,
        password: $scope.password
      })
        .then(function() {
          // TODO: la funzione viene invocata con la response della chiamata rest
          // da raccogliere per settare il profilo dell'utente
          // console.log(response);
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

    .module('restart')

    .service('restartLoginModal', function($uibModal) {
      this.open = function() {
        // restituisce una promise che si risolve al login dell'utente
        // ma non viene mai rejected in quanto la finestra di login non può
        // essere chiusa
        return $uibModal.open({
          ariaDescribedBy: 'modal-body',
          templateUrl: 'views/services/login.html',
          keyboard: false,
          backdrop: 'static',
          size: 'sm',
          controller: restartLoginModalCtrl
        }).result;
      };
    })

  ;

})();