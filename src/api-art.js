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

    .config(function($authProvider, apiArtConfigProvider) {
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
      
      //$authProvider.loginUrl = 'http://localhost/wphdtfows/api/art/sessions';
      $authProvider.loginUrl = apiArtConfigProvider.wsartLoginUrl;
    })

    .provider('apiArtConfig', function($authProvider) {
      this.wsartRoutesPrefix = '/api/art/';
      this.wsartLoginUrl = this.wsartRoutesPrefix + 'sessions';
      this.setWsartRoutesPrefix = function(prefix) {
        // aggiungo lo slash finale se non presente
        this.wsartRoutesPrefix = prefix.match(/\/$/) ? prefix : prefix + '/';
        this.wsartLoginUrl = this.wsartRoutesPrefix + 'sessions';
        $authProvider.loginUrl = this.wsartLoginUrl;
      };
      this.$get = function () {
        return this;
      };
    })

  ;

})();