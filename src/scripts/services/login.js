(function() {

  'use strict';

  function pippo() {
    console.log('pippo');
  }
  
  angular

    .module('api-art')

    .service('apiArtLoginModal', function($uibModal) {
      this.open = function() {
        return $uibModal.open({
          //ariaDescribedBy: 'modal-body',
          templateUrl: 'views/services/login.html',
          //keyboard: false,
          //backdrop: 'static',
          controller: 'pippo',
          resolve: {}
        });
      };
    })
    
    .controller('pippo', pippo)

  ;

})();