(function() {

  'use strict';

  angular

    .module('api-art')

    .factory('apiArtIsAuthenticated', function($auth) {
      return function() {
        return $auth.isAuthenticated();
      };
    })

    .factory('apiArtLogout', function($auth, $location, $window, apiArtSessionService, sirtiAlert, sirtiLoadingModal) {
      return function(successCallback) {
        var loadingModal = sirtiLoadingModal.open();
        apiArtSessionService.logout({ TOKEN: $auth.getToken() }).$promise
          .then(function() {
            $auth.logout();
            loadingModal.close();
            successCallback();
          })
          .catch(function(err) {
            loadingModal.close();
            sirtiAlert.error(err);
          });
      };
    })

    .factory('apiArtSessionService', function($resource, apiArtConfig) {
      return $resource(apiArtConfig.wsartRoutesPrefix + 'sessions/:TOKEN',
        {},
        {
          login: {
            method: 'POST',
            params: {},
            withCredentials: false,
            skipAuthorization: false
          },
          logout: {
            method: 'DELETE',
            params: {},
            withCredentials: apiArtConfig.withCredentials,
            skipAuthorization: apiArtConfig.skipAuthorization
          }
        },
        {
          stripTrailingSlashes: true
        }
      );
    })

    .factory('apiArtInstanceActivityTypePropertiesService', function($resource, apiArtConfig) {
      return $resource(apiArtConfig.wsartRoutesPrefix + 'instance/types/activities/:TYPE/properties',
        {},
        {
          get : {
            method : 'GET',
            params : {},
            withCredentials: apiArtConfig.withCredentials,
            skipAuthorization: apiArtConfig.skipAuthorization
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
            withCredentials: apiArtConfig.withCredentials,
            skipAuthorization: apiArtConfig.skipAuthorization
          },
          modify : {
            method : 'PUT',
            params : {},
            withCredentials: apiArtConfig.withCredentials,
            skipAuthorization: apiArtConfig.skipAuthorization
          }
        },
        {
          stripTrailingSlashes : true
        }
      );
    })

    .factory('apiArtInstanceActivityPropertiesGroupsService', function($resource, apiArtConfig) {
      return $resource(apiArtConfig.wsartRoutesPrefix + 'instance/types/activityProperties/groups',
        {},
        {
          get : {
            method : 'GET',
            params : {},
            isArray: true,
            withCredentials: apiArtConfig.withCredentials,
            skipAuthorization: apiArtConfig.skipAuthorization
          }
        },
        {
          stripTrailingSlashes : true
        }
      );
    })

  ;

})();