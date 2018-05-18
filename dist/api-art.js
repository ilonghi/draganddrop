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
  
  function activityPropertyConfigCtrl($scope, sirtiAlert) {

    var allProperties = [
      'END_DATE',
      'ENGAGE_DESCRIPTION',
      'ESTIMATED_EFFORT',
      'ESTIMATED_EFFORT_OUTLOOK',
      'ID_EPRL',
      'PROJECT_COMMESSA',
      'REASON',
      'RESOURCE',
      'RESOURCE_ENGAGE_DESC',
      'RESOURCE_ENGAGE_END_DATE',
      'RESOURCE_ENGAGE_SHORT_DESC',
      'RESOURCE_ENGAGE_START_DATE',
      'RESOURCE_LIST',
      'RESOURCE_LIST_BL',
      'RESOURCE_LIST_OG',
      'RESOURCE_REVOKE',
      'SCOPE'
    ];
    
    $scope.models = {
      ap: [
        {
          'group': 'GROUP_1',
          'id' : 1,
          'properties': [
            {
              'expired':false,
              'readOnly':false,
              'name':'END_DATE',
              'nullable':true
            },
            {
              'expired':false,
              'readOnly':true,
              'name':'ENGAGE_DESCRIPTION',
              'nullable':false
            }
          ]
        },
        {
          'group': 'GROUP_2',
          'id' : 2,
          'properties': [
            {
              'expired':false,
              'readOnly':false,
              'name':'ESTIMATED_EFFORT',
              'nullable':false
            },
            {
              'expired':true,
              'readOnly':false,
              'name':'ESTIMATED_EFFORT_OUTLOOK',
              'nullable':false
            }
          ]
        },
        {
          'group': 'GROUP_3',
          'id' : 3,
          'properties': [
            {
              'expired':false,
              'readOnly':false,
              'name':'RESOURCE_LIST',
              'nullable':false
            },
            {
              'expired':false,
              'readOnly':false,
              'name':'RESOURCE_LIST_BL',
              'nullable':false
            }
          ]
        },
        {
          'properties':[
            {
              'expired':false,
              'readOnly':false,
              'name':'ACCOUNTED_EFFORT',
              'nullable':false
            },
            {
              'expired':false,
              'readOnly':false,
              'name':'CATEGORY_LIST',
              'nullable':false
            },
            {
              'expired':false,
              'readOnly':false,
              'name':'COMPETENCE_CENTER_MANAGER',
              'nullable':false
            }
          ]
        }
      ],
      properties: []
    };

    $scope.newGroupName = undefined;

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
angular.module('api-art').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/activity-property-config.html',
    "<div class=\"container-fluid\">\n" +
    "\n" +
    "\t<div class=\"panel panel-primary\">\n" +
    "\t\t<div class=\"panel-heading\">\n" +
    "\t\t\t<h1 class=\"panel-title\">Activity type {{ activityType }}</h1>\n" +
    "\t\t</div>\n" +
    "\t\t<div class=\"panel-body\">\n" +
    "\n" +
    "\t\t\t<div class=\"row\">\n" +
    "\t\t\t\n" +
    "\t\t\t\t<div class=\"col-md-8\">\n" +
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
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button ng-disabled=\"!newGroupName\"\n" +
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
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tGroup {{ group.group }}\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<!-- <div class=\"form-inline\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label for=\"group-name-{{$index}}\">Group</label>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input type=\"text\" ng-model=\"group.group\" id=\"group-name-{{$index}}\" class=\"form-control\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div> -->\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"col-md-2 text-right\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"btn btn-default btn-xs\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-click=\"removeGroup($index)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-remove text-danger\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group\">\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-disabled=\"models.ap.length <= 2 || $index === 0\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"btn btn-default btn-xs\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-click=\"moveGroupUp($index)\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-arrow-up\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"btn btn-default btn-xs\"\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tng-disabled=\"models.ap.length <= 2 || $index === models.ap.length-2\"\n" +
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
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class=\"btn btn-xs btn-default\" ng-model=\"item.readOnly\" uib-btn-checkbox uib-tooltip=\"read only\">RO</label>\n" +
    "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class=\"btn btn-xs btn-default\" ng-model=\"item.nullable\" uib-btn-checkbox uib-tooltip=\"nullable\">N</label>\n" +
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
    "\t\t\t\t<div class=\"col-md-4\">\n" +
    "\t\t\t\t\t<div class=\"panel panel-default\">\n" +
    "\t\t\t\t\t\t<div class=\"panel-heading\">\n" +
    "\t\t\t\t\t\t\t<h3 class=\"panel-title\">Generated Model</h3>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t<div class=\"panel-body\">\n" +
    "\t\t\t\t\t\t\t<pre class=\"code\">{{modelAsJson}}</pre>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "\n" +
    "</div>\n"
  );

}]);
