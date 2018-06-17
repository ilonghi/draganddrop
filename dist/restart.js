(function () {

  'use strict';

  angular

    .module('restart', [
      'dndLists',
      'ngAnimate',
      'ngResource',
      'ngSanitize',
      'ui.bootstrap',
      'satellizer',
      'sirti-utils'
    ])

    .config(function($authProvider, restartConfigProvider) {
      $authProvider.tokenHeader = 'X-JWT-Authorization';
      $authProvider.tokenType = 'JWT';
      $authProvider.loginUrl = restartConfigProvider.wsartLoginUrl;
      $authProvider.withCredentials = restartConfigProvider.withCredentials;
      /*
       * sessionStorage will only be accessible while and by the window that created it is open.
       * localStorage lasts until you delete it or the user deletes it.
       */
      $authProvider.storageType = 'sessionStorage';
    })

    .provider('restartConfig', function($authProvider) {
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
(function () {

  'use strict';

  function swapElements(a, x, y) {
    var tmp = a[x];
    a[x] = a[y];
    a[y] = tmp;
  }
  
  function insertBeforeLastElement(a, x) {
    var tmp = a[a.length-1];
    a.splice(-1, 1, x);
    a.push(tmp);
  }
  
  function activityPropertyConfigCtrl(
      $scope,
      $q,
      $timeout,
      $window,
      restartInstanceActivityTypePropertiesService,
      restartInstanceActivityTypeActivityPropertiesService,
      restartInstanceActivityPropertiesGroupsService,
      restartLoginModal,
      sirtiLoadingModal,
      sirtiAlert
    ) {

    $scope.loadOk = false;

    var loadingModal = sirtiLoadingModal.open();

    var allProperties = [];

    $scope.models = {
      ap: [],
      properties: []
    };

    $scope.newGroupName = undefined;
    $scope.editingGroupName = false;
    $scope.editingGroupNameIdx = undefined;
    $scope.origGroupName = undefined;

    var promises = [
      restartInstanceActivityTypePropertiesService.get({ TYPE: $scope.activityType }).$promise,
      restartInstanceActivityTypeActivityPropertiesService.get({ TYPE: $scope.activityType }).$promise,
      restartInstanceActivityPropertiesGroupsService.get().$promise
    ];

    $q.all(promises)
      .then(function(responses) {
        loadingModal.close();
        $scope.loadOk = true;
        // FIXME: ????
        delete responses[0].$promise;
        delete responses[0].$resolved;
        allProperties = _.keys(responses[0]);
        $scope.models.ap = responses[1];
        if($scope.models.ap.length === 0) {
          $scope.models.ap.push({ properties: [] });
        }
        $scope.models.apGroups = [];
        _.each(responses[2], function(item) {
          $scope.models.apGroups.push(item.name);
        });
        _.each(allProperties, function(p) {
          var property = {
            name: p,
            readOnly: false,
            nullable: false,
            expired: false,
            type: 'property'
          };
          var found = false;
          _.each($scope.models.ap, function(group) {
            _.each(group.properties, function(ap) {
              ap.type = 'ap';
              if(ap.name === property.name) {
                found = true;
              }
            });
          });
          if(!found) {
            $scope.models.properties.push(property);
          }
        });
        // rimuovo dall'elenco dei gruppi quelli utilizzati
        _.each($scope.models.ap, function(group) {
          $scope.models.apGroups = _.without($scope.models.apGroups, group.group);
        });
      })
      .catch(function(err) {
        loadingModal.close();
        if(err.status === 401) {
          restartLoginModal.open()
            .then(function() {
              $window.location.reload();
            });
        } else {
          sirtiAlert.fatal(err, { referenceId: 'load-ko' });
        }
      });

    $scope.apAdded = function(item) {
      item.type = 'ap';
      return item;
    };

    $scope.apRemoved = function(item) {
      item.type = 'property';
      return item;
    };

    $scope.checkGroupPosition = function(item, index) {
      // non permetto che un gruppo vada in ultima posizione che è riservata agli ungrouped
      // NOTA: sicuramente si tratta di un gruppo e non degli ungrouped in quanto non sono draggabili
      if(index === $scope.models.ap.length) {
        return false;
      }
      return true;
    };

    $scope.addNewGroup = function() {
      if(_.findWhere($scope.models.ap, { group: $scope.newGroupName }) || $scope.models.apGroups.indexOf($scope.newGroupName) !== -1) {
        sirtiAlert.warning('A group named ' + $scope.newGroupName + ' already exists');
        return;
      }
      insertBeforeLastElement($scope.models.ap, {
        group: $scope.newGroupName,
        properties: []
      });
      sirtiAlert.success('Group ' + $scope.newGroupName + ' successfully added');
      $scope.newGroupName = undefined;
    };

    $scope.setEditingGroupName = function(index) {
      $scope.editingGroupName = true;
      $scope.editingGroupNameIdx = index;
      $scope.origGroupName = $scope.models.ap[index].group;
    };

    $scope.editingGroupNameDone = function() {
      var ko = false;
      for(var i = 0; i < $scope.models.ap.length; i++) {
        if(i === $scope.editingGroupNameIdx) {
          continue;
        }
        if($scope.models.ap[i].group === $scope.models.ap[$scope.editingGroupNameIdx].group) {
          ko = true;
          break;
        }
      }
      if($scope.models.apGroups.indexOf($scope.models.ap[$scope.editingGroupNameIdx].group) !== -1) {
        ko = true;
      }
      if(ko) {
        sirtiAlert.warning('A group named ' + $scope.models.ap[$scope.editingGroupNameIdx].group + ' already exists');
        return;
      }
      $scope.editingGroupName = false;
      $scope.editingGroupNameIdx = undefined;
      $scope.origGroupName = undefined;
    };

    $scope.resetGroupName = function(index) {
      $scope.models.ap[index].group = $scope.origGroupName;
      $scope.editingGroupName = false;
      $scope.editingGroupNameIdx = undefined;
      $scope.origGroupName = undefined;
    };

    $scope.moveGroupUp = function(index) {
      swapElements($scope.models.ap, index, index-1);
    };

    $scope.moveGroupDown = function(index) {
      swapElements($scope.models.ap, index, index+1);
    };

    $scope.removeGroup = function(index) {
      var groupName = $scope.models.ap[index].group;
      _.each($scope.models.ap[index].properties, function(item) {
        $scope.models.properties.push(item);
      });
      $scope.models.ap.splice(index, 1);
      // inserisco il nome del gruppo nell'array dei gruppi in modo che l'array resti ordinato
      // http://underscorejs.org/#sortedIndex
      $scope.models.apGroups.splice(_.sortedIndex($scope.models.apGroups, groupName), 0, groupName);
      sirtiAlert.success('Group ' + groupName + ' successfully removed');
    };

    $scope.addExistingGroup = function(groupName) {
      insertBeforeLastElement($scope.models.ap, {
        group: groupName,
        properties: []
      });
      $scope.models.apGroups.splice($scope.models.apGroups.indexOf(groupName), 1);
      sirtiAlert.success('Group ' + groupName + ' successfully added');
    };

    $scope.save = function() {
      var loadingModal = sirtiLoadingModal.open();
      restartInstanceActivityTypeActivityPropertiesService.modify({ TYPE: $scope.activityType }, { ap: $scope.models.ap }).$promise
        .then(function() {
          loadingModal.close();
          sirtiAlert.success('Activity property successfully saved');
        })
        .catch(function(err) {
          loadingModal.close();
          if(err.status === 401) {
            restartLoginModal.open()
              .then(function() {
                sirtiAlert.warning('Activity property was not saved');
              });
          } else {
            sirtiAlert.error(err);
          }
        });
      // $timeout(function() {
      //   loadingModal.close();
      //   sirtiAlert.error('Not yet implemented!');
      // }, 2000);
    };

    // Model to JSON for demo purpose
    $scope.$watch('models', function(model) {
      $scope.modelAsJson = angular.toJson(model, true);
    }, true);

  }

  function activityPropertyConfigDirective() {
    return {
      restrict: 'E',
      scope: {
        activityType: '@',
      },
      templateUrl: 'views/directives/activity-property-config.html',
      controller: activityPropertyConfigCtrl
    };
  }

  angular

    .module('restart')

    /*
     * direttiva restart-activity-property-config
     */
    .directive('restartActivityPropertyConfig', activityPropertyConfigDirective)

  ;

})();
(function() {

  'use strict';

  function restartLoginModalCtrl($scope, $auth, sirtiAlert) {
    $scope.login = function() {
      $auth.login({
        username: $scope.username,
        password: $scope.password
      })
        .then(function() {
          // TODO: la funzione viene invocata con la response della chiamata rest
          // da raccogliere per settare il profilo dell'utente
          // console.log(response);
          // console.log($auth.getToken());
          $scope.$close();
        })
        .catch(function(err) {
          // console.log(err);
          sirtiAlert.error(err, { referenceId: 'login-form', ttl: 3000 });
        });
    };
  }
  
  angular

    .module('restart')

    .service('restartLoginModal', function($uibModal) {
      this.open = function() {
        // restituisce una promise che si risolve al login dell'utente
        // ma non viene mai rejected in quanto la finestra di login non può
        // essere chiusa
        return $uibModal.open({
          ariaDescribedBy: 'modal-body',
          templateUrl: 'views/services/login.html',
          keyboard: false,
          backdrop: 'static',
          size: 'sm',
          controller: restartLoginModalCtrl
        }).result;
      };
    })

  ;

})();
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
angular.module('restart').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/activity-property-config.html',
    "<div class=\"container-fluid\">\n" +
    "\n" +
    "\t<sirti-alert inline=\"true\" reference=\"load-ko\"></sirti-alert>\n" +
    "\n" +
    "\t<div class=\"panel panel-primary\" ng-show=\"loadOk\">\n" +
    "\t\t<div class=\"panel-heading\">\n" +
    "\t\t\t<h3 class=\"panel-title\">Groups</h3>\n" +
    "\t\t</div>\n" +
    "\t\t<div class=\"panel-body\">\n" +
    "\t\t\t<ul id=\"\" class=\"list-inline\">\n" +
    "\t\t\t\t<li ng-repeat=\"group in models.apGroups\">\n" +
    "\t\t\t\t\t<div class=\"panel panel-primary\">\n" +
    "\t\t\t\t\t\t<div class=\"panel-body\">\n" +
    "\t\t\t\t\t\t\t<div class=\"row\">\n" +
    "\t\t\t\t\t\t\t\t<div class=\"col-md-8 text-left text-nowrap\">\n" +
    "\t\t\t\t\t\t\t\t\t{{group}}\n" +
    "\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t<div class=\"col-md-4 text-right\">\n" +
    "\t\t\t\t\t\t\t\t\t<div class=\"btn-group\">\n" +
    "\t\t\t\t\t\t\t\t\t\t<button\n" +
    "\t\t\t\t\t\t\t\t\t\t\tclass=\"btn btn-default btn-xs\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\tng-click=\"addExistingGroup(group)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\tng-disabled=\"editingGroupName\"\n" +
    "\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-plus\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</li>\n" +
    "\t\t\t</ul>\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "\n" +
    "\t<div class=\"panel panel-primary\" ng-show=\"loadOk\">\n" +
    "\t\t<div class=\"panel-heading\">\n" +
    "\t\t\t<h1 class=\"panel-title\">Activity type {{ activityType }}</h1>\n" +
    "\t\t</div>\n" +
    "\t\t<div class=\"panel-body\">\n" +
    "\n" +
    "\t\t\t<div class=\"row\">\n" +
    "\t\t\t\n" +
    "\t\t\t\t<div class=\"col-md-12\">\n" +
    "\t\t\t\t\t<div class=\"row\">\n" +
    "\t\t\t\t\t\t<div class=\"col-md-4\">\n" +
    "\t\t\t\t\t\t\t<div class=\"panel panel-primary\">\n" +
    "\t\t\t\t\t\t\t\t<div class=\"panel-heading\">\n" +
    "\t\t\t\t\t\t\t\t\t<h3 class=\"panel-title\">Properties</h3>\n" +
    "\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t<div class=\"panel-body\">\n" +
    "\t\t\t\t\t\t\t\t\t<!-- The dnd-list directive allows to drop elements into it.\n" +
    "\t\t\t\t\t\t\t\t\t\t The dropped data will be added to the referenced list -->\n" +
    "\t\t\t\t\t\t\t\t\t<ul dnd-list=\"models.properties\"\n" +
    "\t\t\t\t\t\t\t\t\t\tdnd-drop=\"apRemoved(item)\"\n" +
    "\t\t\t\t\t\t\t\t\t\tdnd-allowed-types=\"['ap']\"\n" +
    "\t\t\t\t\t\t\t\t\t\tdnd-disable-if=\"editingGroupName\"\n" +
    "\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t<!-- The dnd-draggable directive makes an element draggable and will\n" +
    "\t\t\t\t\t\t\t\t\t\t\t transfer the object that was assigned to it. If an element was\n" +
    "\t\t\t\t\t\t\t\t\t\t\t dragged away, you have to remove it from the original list\n" +
    "\t\t\t\t\t\t\t\t\t\t\t yourself using the dnd-moved attribute -->\n" +
    "\t\t\t\t\t\t\t\t\t\t<li ng-repeat=\"item in models.properties\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\tdnd-draggable=\"item\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\tdnd-type=\"item.type\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\tdnd-moved=\"models.properties.splice($index, 1)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\tdnd-effect-allowed=\"move\"\n" +
    "\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t{{item.name}}\n" +
    "\t\t\t\t\t\t\t\t\t\t\t<sup class=\"text-warning\" ng-if=\"item.expired\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-alert\"></span> expired\n" +
    "\t\t\t\t\t\t\t\t\t\t\t</sup>\n" +
    "\t\t\t\t\t\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t\t\t\t\t</ul>\n" +
    "\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t<div class=\"col-md-8\">\n" +
    "\t\t\t\t\t\t\t<form>\n" +
    "\t\t\t\t\t\t\t\t<div class=\"col-md-12\">\n" +
    "\t\t\t\t\t\t\t\t\t<div class=\"panel panel-primary\">\n" +
    "\t\t\t\t\t\t\t\t\t\t<div class=\"panel-heading\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t<h3 class=\"panel-title\">Activity Properties</h3>\n" +
    "\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t<div class=\"panel-body\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t<div class=\"panel panel-default\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"panel-body\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"form-inline\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"form-group\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input type=\"text\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-model=\"newGroupName\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"form-control\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tplaceholder=\"new group name\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button ng-disabled=\"!newGroupName || editingGroupName\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-click=\"addNewGroup()\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"form-control btn btn-primary\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-ok\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t<div class=\"panel panel-info\" ng-repeat=\"group in models.ap\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"panel-heading\" ng-if=\"$index !== models.ap.length-1\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"row\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"panel-title col-md-10\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div ng-show=\"editingGroupNameIdx !== $index\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tGroup {{ group.group }}\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div ng-show=\"editingGroupNameIdx === $index\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"form-inline\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tGroup\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input type=\"text\" ng-model=\"group.group\" class=\"form-control\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button ng-disabled=\"!group.group\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-click=\"editingGroupNameDone()\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"form-control btn btn-primary\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-ok\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-click=\"resetGroupName($index)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"form-control btn btn-primary\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-remove\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"col-md-2 text-right\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"btn btn-default btn-xs\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-click=\"setEditingGroupName($index)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-disabled=\"editingGroupName\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-pencil\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"btn btn-default btn-xs\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-click=\"removeGroup($index)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-disabled=\"editingGroupName\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-trash\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-disabled=\"models.ap.length <= 2 || $index === 0 || editingGroupName\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"btn btn-default btn-xs\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-click=\"moveGroupUp($index)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-arrow-up\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"btn btn-default btn-xs\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-disabled=\"models.ap.length <= 2 || $index === models.ap.length-2 || editingGroupName\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-click=\"moveGroupDown($index)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-arrow-down\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"panel-heading\" ng-if=\"$index === models.ap.length-1\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"panel-title\">Ungrouped</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"panel-body\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t<!-- The dnd-list directive allows to drop elements into it.\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t The dropped data will be added to the referenced list -->\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t<ul dnd-list=\"group.properties\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\tdnd-drop=\"apAdded(item)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\tdnd-allowed-types=\"['ap','property']\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\tdnd-disable-if=\"editingGroupName\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t<!-- The dnd-draggable directive makes an element draggable and will\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t transfer the object that was assigned to it. If an element was\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t dragged away, you have to remove it from the original list\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t yourself using the dnd-moved attribute -->\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t<li ng-repeat=\"item in group.properties\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tdnd-draggable=\"item\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tdnd-type=\"item.type\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tdnd-moved=\"group.properties.splice($index, 1)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tdnd-effect-allowed=\"move\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{{item.name}}\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<sup class=\"text-warning\" ng-if=\"item.expired\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-alert\"></span> expired\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</sup>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<dnd-nodrag>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"pull-right\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class=\"btn btn-xs btn-default\" ng-model=\"item.readOnly\" uib-btn-checkbox uib-tooltip=\"read only\" ng-disabled=\"editingGroupName\">RO</label>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class=\"btn btn-xs btn-default\" ng-model=\"item.nullable\" uib-btn-checkbox uib-tooltip=\"nullable\" ng-disabled=\"editingGroupName\">N</label>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</dnd-nodrag>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t</ul>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t</form>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t\n" +
    "\t\t\t\t<!-- <div class=\"col-md-4\">\n" +
    "\t\t\t\t\t<div class=\"panel panel-default\">\n" +
    "\t\t\t\t\t\t<div class=\"panel-heading\">\n" +
    "\t\t\t\t\t\t\t<h3 class=\"panel-title\">Generated Model</h3>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t<div class=\"panel-body\">\n" +
    "\t\t\t\t\t\t\t<pre class=\"code\">{{modelAsJson}}</pre>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div> -->\n" +
    "\t\t\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\n" +
    "\t\t<div class=\"panel-footer\">\n" +
    "\t\t\t<div class=\"row\">\n" +
    "\t\t\t\t<div class=\"col-md-12 text-right\">\n" +
    "\t\t\t\t\t<button class=\"btn btn-primary btn-lg\"\n" +
    "\t\t\t\t\t\tng-click=\"save()\"\n" +
    "\t\t\t\t\t\tng-disabled=\"editingGroupName\"\n" +
    "\t\t\t\t\t>\n" +
    "\t\t\t\t\t\tSave\n" +
    "\t\t\t\t\t</button>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\n" +
    "\t</div>\n" +
    "\n" +
    "</div>\n"
  );


  $templateCache.put('views/services/login.html',
    "\t\t\t<div class=\"modal-header\">\n" +
    "\t\t\t\t<h4 class=\"modal-title\">Authentication required</h4>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"modal-body\">\n" +
    "\t\t\t\t<form id=\"loginForm\" name=\"loginForm\" class=\"form-inline css-form\" novalidate>\n" +
    "\t\t\t\t<div class=\"form-group has-feedback\" ng-class=\"{ 'has-error': loginForm.username.$invalid && loginForm.username.$touched }\">\n" +
    "\t\t\t\t\t<label class=\"control-label sr-only\" for=\"username\">Username</label>\n" +
    "\t\t\t\t\t<div class=\"input-group\">\n" +
    "\t\t\t\t\t\t<span class=\"input-group-addon\" id=\"basic-addon1\"><span class=\"glyphicon glyphicon-user\"></span></span>\n" +
    "\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" id=\"username\" name=\"username\" ng-model=\"username\" placeholder=\"Username\" required>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<span class=\"glyphicon glyphicon-remove form-control-feedback\" ng-show=\"loginForm.username.$invalid && loginForm.username.$touched\"></span>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t<div class=\"clearfix\" /><br />\n" +
    "\t\t\t\t<div class=\"form-group has-feedback\" ng-class=\"{ 'has-error': loginForm.password.$invalid && loginForm.password.$touched }\">\n" +
    "\t\t\t\t\t<label class=\"control-label sr-only\" for=\"password\">Password</label>\n" +
    "\t\t\t\t\t<div class=\"input-group\">\n" +
    "\t\t\t\t\t\t<span class=\"input-group-addon\" id=\"basic-addon1\"><span class=\"glyphicon glyphicon-option-horizontal\"></span></span>\n" +
    "\t\t\t\t\t\t<input type=\"password\" class=\"form-control\" ng-keypress=\"loginOnKeyEnter($event)\" id=\"password\" name=\"password\" ng-model=\"password\" placeholder=\"Password\" required>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<span class=\"glyphicon glyphicon-remove form-control-feedback\" ng-show=\"loginForm.password.$invalid && loginForm.password.$touched\"></span>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t</form>\n" +
    "\t\t\t\t<div class=\"clearfix\" /><br />\n" +
    "\t\t\t\t<sirti-alert reference=\"login-form\" inline=\"true\"></sirti-alert>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"modal-footer\">\n" +
    "\t\t\t\t<div class=\"form-group\">\n" +
    "\t\t\t\t\t<button class=\"btn btn-primary\" ng-click=\"login()\" ng-disabled=\"loading || loginForm.$invalid\">\n" +
    "\t\t\t\t\t\t<span ng-if=\"loading\" class=\"glyphicon glyphicon-refresh glyphicon-refresh-animate\"></span><span ng-if=\"!loading\" class=\"glyphicon glyphicon-log-in\"></span> Login\n" +
    "\t\t\t\t\t</button>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div>\n" +
    "\n" +
    "<!-- \n" +
    "<div class=\"modal-dialog modal-sm text-center\">\n" +
    "\t<div class=\"modal-header\">\n" +
    "\t\t<h4 class=\"modal-title\" translate>Authentication required</h4>\n" +
    "\t</div>\n" +
    "\t<div class=\"modal-body\">\n" +
    "\t\t<form id=\"loginForm\" name=\"loginForm\" class=\"form-inline css-form\" novalidate>\n" +
    "\t\t\t<div class=\"form-group\">\n" +
    "\t\t\t\t<label for=\"login-username\">Username</label>\n" +
    "\t\t\t\t<input type=\"text\" class=\"form-control\" id=\"login-username\" placeholder=\"Username\">\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"form-group\">\n" +
    "\t\t\t\t<label for=\"login-password\">Password</label>\n" +
    "\t\t\t\t<input type=\"password\" class=\"form-control\" id=\"login-password\" placeholder=\"Password\">\n" +
    "\t\t\t</div>\n" +
    "\t\t</form>\n" +
    "\t</div>\n" +
    "\t<div class=\"sirti-utils-loading-modal\">\n" +
    "\t\t<span class=\"glyphicon glyphicon-repeat sirti-utils-glyphicon-animate\"></span>\n" +
    "\t</div>\n" +
    "</div>\n" +
    " -->"
  );

}]);
