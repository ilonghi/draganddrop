(function () {

  'use strict';

  angular

    .module('api-art', [
      'dndLists',
      'ngAnimate',
      'ngResource',
      'ngSanitize',
      'ui.bootstrap',
      'sirti-alert'
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
(function () {

  'use strict';

  function swapElements(a, x, y) {
    var tmp = a[x];
    a[x] = a[y];
    a[y] = tmp;
  }
  
  function insertBeforLastElement(a, x) {
    var tmp = a[a.length-1];
    a.splice(-1, 1, x);
    a.push(tmp);
  }
  
  function activityPropertyConfigCtrl(
      $scope,
      $q,
      $timeout,
      apiArtInstanceActivityTypePropertiesService,
      apiArtInstanceActivityTypeActivityPropertiesService,
      apiArtLoadingModal,
      sirtiAlert
    ) {

    $scope.loadOk = false;

    var loadingModal = apiArtLoadingModal.open();

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
      apiArtInstanceActivityTypePropertiesService.get({ TYPE: $scope.activityType }).$promise,
      apiArtInstanceActivityTypeActivityPropertiesService.get({ TYPE: $scope.activityType }).$promise
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
      })
      .catch(function(err) {
        loadingModal.close();
        sirtiAlert.fatal(err, { referenceId: 'load-ko' });
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
      if(_.findWhere($scope.models.ap, { group: $scope.newGroupName })) {
        sirtiAlert.error('A group named ' + $scope.newGroupName + ' already exists');
        $scope.newGroupName = undefined;
        return;
      }
      insertBeforLastElement($scope.models.ap, {
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
      $scope.editingGroupName = false;
      $scope.editingGroupNameIdx = undefined;
      $scope.origGroupName = undefined;
    };

    $scope.resetGroupName = function(index) {
      $scope.models.ap[index].group = $scope.origGroupName;
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
      sirtiAlert.success('Group ' + groupName + ' successfully removed');
    };

    $scope.save = function() {
      var loadingModal = apiArtLoadingModal.open();
      // FIXME: implementare
      $timeout(function() {
        loadingModal.close();
        sirtiAlert.error('Not yet implemented!');
      }, 2000);
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

    .module('api-art')

    /*
     * direttiva api-art-activity-property-config
     */
    .directive('apiArtActivityPropertyConfig', activityPropertyConfigDirective)

  ;

})();
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
angular.module('api-art').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/activity-property-config.html',
    "<div class=\"container-fluid\">\n" +
    "\n" +
    "\t<sirti-alert inline=\"true\" reference=\"load-ko\"></sirti-alert>\n" +
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


  $templateCache.put('views/loading-modal.html',
    "<div class=\"modal-dialog modal-sm text-center\">\n" +
    "\t<div class=\"api-art-loading-modal\">\n" +
    "\t\t<span class=\"glyphicon glyphicon-repeat api-art-glyphicon-animate\"></span>\n" +
    "\t</div>\n" +
    "</div>"
  );

}]);
