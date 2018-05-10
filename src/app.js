'use strict';

angular

.module('sApp', ['dndLists'])

.controller('sCtrl', function($scope) {

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
            'nullable':false
          },
          {
            'expired':false,
            'readOnly':false,
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
  
  function swap(a, x, y) {
    var tmp = a[x];
    a[x] = a[y];
    a[y] = tmp;
  }
  
  $scope.moveGroupUp = function(index) {
    swap($scope.models.ap, index, index-1);
  };
  
  $scope.moveGroupDown = function(index) {
    swap($scope.models.ap, index, index+1);
  };
  
  // Model to JSON for demo purpose
  $scope.$watch('models', function(model) {
    $scope.modelAsJson = angular.toJson(model, true);
  }, true);

})

;

/*
GET /:TA/ap
POST /:TA/ap/groups # associa il gruppo a TA (eventualmente creandolo)
PUT /:TA/ap/groups/:GROUP # modifica il gruppo (cambio descrizione o ordine), se il gruppo è usato da altri TA lo crea
DELETE /:TA/ap/groups/:GROUP # disassocia il gruppo dal TA rendendo tutte le sue properties ungrouped, elimina il gruppo dalla tabella AP_GROUPS se non è usato da altri TA
POST /:TA/ap/groups/:GROUP/properties # aggiunge una property al gruppo
PUT /:TA/ap/groups/:GROUP/properties # modifica una property (posizione, readonly, hidden)
DELETE /:TA/ap/groups/:GROUP/properties # rimuove una property dal gruppo
*/