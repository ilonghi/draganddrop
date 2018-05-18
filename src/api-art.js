(function () {

  'use strict';

  angular

    .module('api-art', [
      'dndLists',
      'ngAnimate',
      'ngSanitize',
      'ui.bootstrap',
      'sirti-alert'
    ])

    .provider('apiArtConfig', function () {
      this.$get = function () {
        return this;
      };
    })

  ;

})();