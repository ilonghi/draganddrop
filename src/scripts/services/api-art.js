(function() {

  'use strict';

  angular

    .module('api-art')

    .factory('apiArtInstanceActivityTypePropertiesService', function($resource, apiArtConfig) {
      return $resource(apiArtConfig.wsartRoutesPrefix + 'instance/types/activities/:TYPE/properties',
        {},
        {
          get : {
            method : 'GET',
            params : {},
            withCredentials : true
          }
        },
        {
          stripTrailingSlashes : true
        }
      );
    })

    .factory('apiArtInstanceActivityTypeActivityPropertiesService', function($resource, apiArtConfig) {
      return $resource(apiArtConfig.wsartRoutesPrefix + 'instance/types/activities/:TYPE/activityProperties',
        {},
        {
          get : {
            method : 'GET',
            params : {},
            isArray: true,
            withCredentials : true
          }
        },
        {
          stripTrailingSlashes : true
        }
      );
    })

  ;

})();