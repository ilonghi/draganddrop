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
      apiArtInstanceActivityTypePropertiesService,
      apiArtInstanceActivityTypeActivityPropertiesService,
      apiArtInstanceActivityPropertiesGroupsService,
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
      apiArtInstanceActivityTypePropertiesService.get({ TYPE: $scope.activityType }).$promise,
      apiArtInstanceActivityTypeActivityPropertiesService.get({ TYPE: $scope.activityType }).$promise,
      apiArtInstanceActivityPropertiesGroupsService.get().$promise
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
      apiArtInstanceActivityTypeActivityPropertiesService.modify({ TYPE: $scope.activityType }, { ap: $scope.models.ap }).$promise
        .then(function(result) {
          loadingModal.close();
          sirtiAlert.success('Activity property successfully saved');
        })
        .catch(function(err) {
          loadingModal.close();
          sirtiAlert.error(err);
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

    .module('api-art')

    /*
     * direttiva api-art-activity-property-config
     */
    .directive('apiArtActivityPropertyConfig', activityPropertyConfigDirective)

  ;

})();