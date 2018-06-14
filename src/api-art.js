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
      $authProvider.tokenHeader = 'X-JWT-Authorization';
      $authProvider.tokenType = 'JWT';
      $authProvider.loginUrl = apiArtConfigProvider.wsartLoginUrl;
      $authProvider.withCredentials = apiArtConfigProvider.withCredentials;
      /*
       * sessionStorage will only be accessible while and by the window that created it is open.
       * localStorage lasts until you delete it or the user deletes it.
       */
      $authProvider.storageType = 'sessionStorage';
    })

    .provider('apiArtConfig', function($authProvider) {
      this.wsartRoutesPrefix = '/api/art/';
      this.wsartLoginUrl = this.wsartRoutesPrefix + 'sessions';
      this.authType = 'JWT'; // JWT|cookie
      this.skipAuthorization = false;
      this.withCredentials = false;
      this.setWsartRoutesPrefix = function(prefix) {
        // aggiungo lo slash finale se non presente
        this.wsartRoutesPrefix = prefix.match(/\/$/) ? prefix : prefix + '/';
        this.wsartLoginUrl = this.wsartRoutesPrefix + 'sessions';
        $authProvider.loginUrl = this.wsartLoginUrl;
      };
      this.setAuthType = function(type) {
        if(!type.match(/^(JWT|cookie)$/)) {
          throw(new Error('Allowed types: JWT|cookie'));
        }
        this.authType = type;
        this.skipAuthorization = this.authType === 'JWT' ? false : true;
        this.withCredentials = this.authType === 'JWT' ? false : true;
        $authProvider.withCredentials = this.withCredentials;
      };
      this.$get = function () {
        return this;
      };
    })

  ;

})();