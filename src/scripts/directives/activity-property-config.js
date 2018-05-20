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
  
  function activityPropertyConfigCtrl($scope, $q, $uibModal, $timeout, apiArtInstanceActivityTypePropertiesService, apiArtInstanceActivityTypeActivityPropertiesService, sirtiAlert) {

    $scope.loadOk = false;

    // FIXME: rendere un servizio il modal loading
    var modalInstance = $uibModal.open({
      ariaDescribedBy: 'modal-body',
      templateUrl: 'modal-loading.html',
      keyboard: false,
      backdrop: 'static'
    });

    var allProperties = [];

    $scope.models = {
      ap: [],
      properties: []
    };

    $scope.newGroupName = undefined;

    var promises = [
      apiArtInstanceActivityTypePropertiesService.get({ TYPE: $scope.activityType }).$promise,
      apiArtInstanceActivityTypeActivityPropertiesService.get({ TYPE: $scope.activityType }).$promise
    ];

    $q.all(promises)
      .then(function(responses) {
        modalInstance.close();
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
        modalInstance.close();
        sirtiAlert.fatal(err.data, { referenceId: 'load-ko' });
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

    $scope.save = function() {
      var modalInstance = $uibModal.open({
        ariaDescribedBy: 'modal-body',
        templateUrl: 'modal-loading.html',
        keyboard: false,
        backdrop: 'static'
      });
      // FIXME: implementare
      $timeout(function() {
        modalInstance.close();
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