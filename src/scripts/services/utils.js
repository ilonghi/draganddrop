(function() {

  'use strict';

  angular

    .module('api-art')

    .service('apiArtLoadingModal', function($uibModal, sirtiAlert) {
      this.open = function() {
        sirtiAlert.clear();
        return $uibModal.open({
          ariaDescribedBy: 'modal-body',
          templateUrl: 'views/loading-modal.html',
          keyboard: false,
          backdrop: 'static'
        });
      };
    })

  ;

})();