# api-art

...

Il codice è mantenuto nel repo Bitbucket [Working+ / Common / JS::NG::ApiArt](https://bitbucket.org/SirtiWPL/js-ng-apiart.git)
ma la distribuzione per l'aggiunta a progetti `Angular 1.x` avviene attraverso
un [repo 'locale'](http://dvmas003.ict.sirti.net:10090/git/js-ng-apiart.git) per
consentire lo scaricamento da Git senza la necessità di specificare credenziali d'accesso.

## Install

E' possibile aggiungere la direttiva ad un progetto `Angular 1.x` mediante `bower`:

```shell
bower install --save api-art=http://dvmas003.ict.sirti.net:10090/git/js-ng-apiart.git
```

I file da includere nel progetto si troveranno al seguente path `bower_components/api-art/dist`:

```html
<link rel="stylesheet" href="bower_components/sirti-column-sort-and-filter/dist/api-art.css">
<script src="bower_components/sirti-column-sort-and-filter/dist/api-art.js"></script>
```

Aggiunta componente all'app di `Angular`:

```javascript
angular.module('myApp', ['api-art'])
```

E' inoltre necessario caricare le seguenti dipendenze:

```html
<!-- stylesheets -->
<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap-theme.min.css">
<link rel="stylesheet" href="bower_components/angular-growl-v2/build/angular-growl.min.css">

<!-- scripts -->
<script src="bower_components/jquery/dist/jquery.min.js"></script>
<script src="bower_components/angular/angular.min.js"></script>
<script src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="bower_components/angular-animate/angular-animate.min.js"></script>
<script src="bower_components/angular-sanitize/angular-sanitize.min.js"></script>
<script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"></script>
<script src="bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js"></script>
<script src="bower_components/sirti-alert/dist/sirti-alert.js"></script>
<script src="bower_components/angular-growl-v2/build/angular-growl.min.js"></script>
<script src="bower_components/underscore/underscore-min.js"></script>
```

## Documentation

### Direttive

#### api-art-activity-property-config

## Changelog

* **0.0.1**
    * prima versione stabile

## License

Copyright (c) 2017 Sirti S.p.A. - All rights reserved
