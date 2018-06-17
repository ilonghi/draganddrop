(function() {

  'use strict';

  angular

    .module('restart')

    .factory('restartIsAuthenticated', function($auth) {
      return function() {
        return $auth.isAuthenticated();
      };
    })

    .factory('restartLogout', function($auth, $location, $window, restartSessionService, sirtiAlert, sirtiLoadingModal) {
      return function(successCallback) {
        var loadingModal = sirtiLoadingModal.open();
        restartSessionService.logout({ TOKEN: $auth.getToken() }).$promise
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

    .factory('restartSessionService', function($resource, restartConfig) {
      return $resource(restartConfig.wsartRoutesPrefix + 'sessions/:TOKEN',
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
            withCredentials: restartConfig.withCredentials,
            skipAuthorization: restartConfig.skipAuthorization
          }
        },
        {
          stripTrailingSlashes: true
        }
      );
    })

    .factory('restartInstanceActivityTypePropertiesService', function($resource, restartConfig) {
      return $resource(restartConfig.wsartRoutesPrefix + 'instance/types/activities/:TYPE/properties',
        {},
        {
          get : {
            method : 'GET',
            params : {},
            withCredentials: restartConfig.withCredentials,
            skipAuthorization: restartConfig.skipAuthorization
          }
        },
        {
          stripTrailingSlashes : true
        }
      );
    })

    .factory('restartInstanceActivityTypeActivityPropertiesService', function($resource, restartConfig) {
      return $resource(restartConfig.wsartRoutesPrefix + 'instance/types/activities/:TYPE/activityProperties',
        {},
        {
          get : {
            method : 'GET',
            params : {},
            isArray: true,
            withCredentials: restartConfig.withCredentials,
            skipAuthorization: restartConfig.skipAuthorization
          },
          modify : {
            method : 'PUT',
            params : {},
            withCredentials: restartConfig.withCredentials,
            skipAuthorization: restartConfig.skipAuthorization
          }
        },
        {
          stripTrailingSlashes : true
        }
      );
    })

    .factory('restartInstanceActivityPropertiesGroupsService', function($resource, restartConfig) {
      return $resource(restartConfig.wsartRoutesPrefix + 'instance/types/activityProperties/groups',
        {},
        {
          get : {
            method : 'GET',
            params : {},
            isArray: true,
            withCredentials: restartConfig.withCredentials,
            skipAuthorization: restartConfig.skipAuthorization
          }
        },
        {
          stripTrailingSlashes : true
        }
      );
    })

  ;

})();