'use strict';

angular

.module('sApp', ['api-art'])

//.config(function(apiArtConfigProvider) {
//  apiArtConfigProvider.setWsartRoutesPrefix('http://apu.simpsons.fake/api/art/');
//})

.run(function(apiArtConfig) {
  apiArtConfig.setWsartRoutesPrefix('http://apu.simpsons.fake/wphdtfows/api/art/');
})

.controller('sCtrl', function() {

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