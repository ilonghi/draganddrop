'use strict';

angular

.module('sApp', ['api-art'])

//.config(function(apiArtConfigProvider) {
//  apiArtConfigProvider.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
//})

.run(function(apiArtConfig) {
  apiArtConfig.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
})

//.run(function($auth, apiArtIsAuthenticated) {
////  $auth.setToken('eyJhbGciOiJIUzI1NiJ9.eyJzaWQiOiJXeDAtNkZTcUROc2JzQzhfanZCRzJEN3pzWm9GRkZUQSJ9.vfz7lE0ZkdjkmJ9R_hsz1mrwbE_G8Mdff-bpv7Dt6Sc');
//  console.log("is authenticated: ", apiArtIsAuthenticated());
//  $auth.removeToken();
//  console.log("is authenticated: ", apiArtIsAuthenticated());
////  $auth.setToken('pippo');
////  $auth.login({
////    "username": "root",
////    "password": "pippo123"
////  })
////    .then(function(response) {
////      console.log($auth.getToken());
////      console.log("is authenticated: ", apiArtIsAuthenticated());
////      // Redirect user here after a successful log in.
////    })
////    .catch(function(response) {
////      // Handle errors here, such as displaying a notification
////      // for invalid email and/or password.
////    });
//})

.controller('sCtrl', function(apiArtLoginModal) {
  apiArtLoginModal.open();
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