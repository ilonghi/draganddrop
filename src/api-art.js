(function () {

  'use strict';

  angular

    .module('api-art', [
      'dndLists',
      'ngAnimate',
      'ngResource',
      'ngSanitize',
      'ui.bootstrap',
      'sirti-utils'
    ])

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