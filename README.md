# restart

...

Il codice è mantenuto nel repo Bitbucket [Working+ / Common / JS::NG::Restart](https://bitbucket.org/SirtiWPL/js-ng-restart.git)
ma la distribuzione per l'aggiunta a progetti `Angular 1.x` avviene attraverso
un [repo 'locale'](http://dvmas003.ict.sirti.net:10090/git/js-ng-restart.git) per
consentire lo scaricamento da Git senza la necessità di specificare credenziali d'accesso.

## Install

E' possibile aggiungere la direttiva ad un progetto `Angular 1.x` mediante `bower` o `npm`:

```shell
bower install --save restart=http://dvmas003.ict.sirti.net:10090/git/js-ng-restart.git
```

```shell
npm install --save http://dvmas003.ict.sirti.net:10090/git/js-ng-restart.git
```

Includere i file nel progetto:

```html
<!-- bower -->
<link rel="stylesheet" href="bower_components/restart/dist/restart.css">
<script src="bower_components/restart/dist/restart.js"></script>

<!-- npm -->
<link rel="stylesheet" href="node_modules/restart/dist/restart.css">
<script src="node_modules/restart/dist/restart.js"></script>
```

Aggiunta componente all'app di `Angular`:

```javascript
angular.module('myApp', ['restart'])
```

E' inoltre necessario caricare le seguenti dipendenze:

```html
<!-- bower -->
<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap-theme.min.css">
<link rel="stylesheet" href="bower_components/angular-growl-v2/build/angular-growl.min.css">
<link rel="stylesheet" href="bower_components/sirti-utils/dist/sirti-utils.css">
<script src="bower_components/jquery/dist/jquery.min.js"></script>
<script src="bower_components/angular/angular.min.js"></script>
<script src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="bower_components/angular-animate/angular-animate.min.js"></script>
<script src="bower_components/angular-resource/angular-resource.min.js"></script>
<script src="bower_components/angular-sanitize/angular-sanitize.min.js"></script>
<script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"></script>
<script src="bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js"></script>
<script src="bower_components/angular-growl-v2/build/angular-growl.min.js"></script>
<script src="bower_components/underscore/underscore-min.js"></script>
<script src="bower_components/satellizer/dist/satellizer.min.js"></script>
<script src="bower_components/sirti-utils/dist/sirti-utils.js"></script>

<!-- npm -->
<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap-theme.min.css">
<link rel="stylesheet" href="node_modules/angular-growl-v2/build/angular-growl.min.css">
<link rel="stylesheet" href="node_modules/sirti-utils/dist/sirti-utils.css">
<script src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="node_modules/angular/angular.min.js"></script>
<script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="node_modules/angular-animate/angular-animate.min.js"></script>
<script src="node_modules/angular-resource/angular-resource.min.js"></script>
<script src="node_modules/angular-sanitize/angular-sanitize.min.js"></script>
<script src="node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js"></script>
<script src="node_modules/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js"></script>
<script src="node_modules/angular-growl-v2/build/angular-growl.min.js"></script>
<script src="node_modules/underscore/underscore-min.js"></script>
<script src="node_modules/satellizer/satellizer.js"></script>
<script src="node_modules/ngstorage/ngStorage.min.js"></script>
<script src="node_modules/sirti-utils/dist/sirti-utils.js"></script>
```

## Documentation

Puoi trovare esempi di utilizzo nei file `index.html` e `app.js` nella cartella `src`.

### Direttive

#### restart-activity-property-config

## Changelog

* **0.1.0**
    * prima versione stabile

## License

Copyright (c) 2018 Sirti S.p.A. - All rights reserved
