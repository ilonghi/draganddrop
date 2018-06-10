(function () {

  'use strict';

  angular

    .module('api-art', [
      'dndLists',
      'ngAnimate',
      'ngResource',
      'ngSanitize',
      'ui.bootstrap',
      'satellizer',
      'sirti-utils'
    ])

    .config(function ($authProvider) {
      $authProvider.authHeader = 'X-JWT-Authorization';
      $authProvider.authToken = 'JWT';
      $authProvider.withCredentials = false;
      /*
       * sessionStorage will only be accessible while and by the window that created it is open.
       * localStorage lasts until you delete it or the user deletes it.
       */
      $authProvider.storageType = 'sessionStorage';

      $authProvider.tokenHeader = 'X-JWT-Authorization';
      $authProvider.tokenType = 'JWT';
      $authProvider.withCredentials = false;
      /*
       * sessionStorage will only be accessible while and by the window that created it is open.
       * localStorage lasts until you delete it or the user deletes it.
       */
      $authProvider.storageType = 'sessionStorage';
      
      $authProvider.loginUrl = 'http://localhost/wphdtfows/api/art/sessions';
    })

    .provider('apiArtConfig', function () {
      this.wsartRoutesPrefix = '/api/art/';
      this.setWsartRoutesPrefix = function(prefix) {
        this.wsartRoutesPrefix = prefix;
      };
      this.$get = function () {
        return this;
      };
    })

  ;

})();