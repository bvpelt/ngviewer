/**
goog.provide('backgroundlayer');

goog.require('ngeo.BackgroundLayerMgr');
goog.require('ngeo.mapDirective');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.layer.Image');
goog.require('ol.layer.Tile');
goog.require('ol.source.ImageWMS');
goog.require('ol.source.OSM');
goog.require('ol.source.Stamen');
**/

/** @const **/
var app = {};


/** @type {!angular.Module} **/
app.module = angular.module('app', ['ngeo']);
/*
  app.module = angular.module('app', ['ngeo'])
  .config(function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });
*/

/**
 * The application-specific background layer directive.
 *
 * The directive is based on Angular's select, ngOptions, ngModel, and
 * ngChange directives. ngChange is used to avoid adding a watcher on
 * the ngModel expression.
 *
 * Note: we don't need two-way binding for ngModel here, but using ::
 * for the ngModel expression doesn't actually make a difference. This
 * is because ngModel doesn't actually watch the ngModel expression.
 *
 * @return {angular.Directive} Directive Defintion Object.
 */
app.backgroundlayerDirective = function() {
  console.log('debug 1');
  return {
    restrict: 'E',
    scope: {
      'map': '=appBackgroundlayerMap'
    },
    templateUrl: './partials/backgroundlayer.html',
    controllerAs: 'ctrl',
    bindToController: true,
    controller: 'AppBackgroundlayerController'
  };
};


app.module.directive('appBackgroundlayer', app.backgroundlayerDirective);



/**
 * @constructor
 * @param {angular.$http} $http Angular http service.
 * @param {ngeo.BackgroundLayerMgr} ngeoBackgroundLayerMgr Background layer
 *     manager.
 * @export
 * @ngInject
 */
app.BackgroundlayerController = function($http, ngeoBackgroundLayerMgr) {
console.log('debug 2');
  /**
   * @type {ol.Map}
   * @export
   */
  this.map;

  /**
   * @type {Array.<Object>|undefined}
   * @export
   */
  this.bgLayers = undefined;

  /**
   * @type {Object}
   * @export
   */
  this.bgLayer = null;

  $http.get('./data/backgroundlayers.json').then(
      function(resp) {
        this.bgLayers = resp.data;
        // use the first layer by default
        this.bgLayer = this.bgLayers[0];
      }.bind(this));

  /**
   * @type {ngeo.BackgroundLayerMgr}
   * @private
   */
  this.backgroundLayerMgr_ = ngeoBackgroundLayerMgr;
};


/**
 * Function called when the user selects a new background layer through
 * the select element. The ngChange directive used in the partial calls
 * it.
 * @export
 */
app.BackgroundlayerController.prototype.change = function() {
  console.log('debug 3');
  var layerSpec = this.bgLayer;
  var layer = this.getLayer_(layerSpec['name']);
  this.backgroundLayerMgr_.set(this.map, layer);
};

proj4.defs('EPSG:28992', "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs");
console.log('Proj4 defs: ' + proj4.defs);


app.projectionExtent = [-285401.92,22598.08,595401.9199999999,903401.9199999999];
app.projection = new ol.proj.Projection({code:'EPSG:28992', units:'m', extent: app.projectionExtent});

app.size = ol.extent.getWidth(app.projectionExtent) / 256;
app.resolutions = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42]
app.matrixIds = new Array(14);

for (var z = 0; z < 15; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  app.matrixIds[z] = 'EPSG:28992:' + z;
}
console.log('Resolutions: ' + app.resolutions);
console.log('MatrixIds: ' + app.matrixIds);

app.EPSG28992 = proj4('EPSG:28992');

/**
 * @param {string} layerName Layer name.
 * @return {ol.layer.Tile} The layer.
 * @private
 */
app.BackgroundlayerController.prototype.getLayer_ = function(layerName) {
  console.log('debug 4');
  var source;
  if (layerName === 'osm') {
    source = new ol.source.OSM();
  } else if (layerName === 'stamen') {
    source = new ol.source.Stamen({
      layer: 'watercolor'
    });
  } else if (layerName === 'brtachtergrondkaart')
  {
    source = new ol.source.WMTS({
            url: 'http://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaart',
            layer: 'brtachtergrondkaart',
            matrixSet: 'EPSG:28992',
            format: 'image/png',
            projection: app.projection,
            tileGrid: new ol.tilegrid.WMTS({
              origin: ol.extent.getTopLeft(app.projectionExtent),
              resolutions: app.resolutions,
              matrixIds: app.matrixIds
            })
          });
                    
  }
  return new ol.layer.Tile({source: source});
};


app.module.controller('AppBackgroundlayerController',
    app.BackgroundlayerController);


/**
 * @constructor
 * @param {angular.Scope} $scope Controller scope.
 * @ngInject
 */
app.MainController = function($scope) {
console.log('debug 5');
  /**
   * @type {ol.Map}
   * @export
   */
  this.map = new ol.Map({
    maxExtent: app.projectionExtent,    
    target: 'map',
    theme: null,
    maxResolution: 860.16,
    numZoomLevels: 12,
    units: 'm',
    displayProjection: app.EPSG28992,
    view: new ol.View({
          center: ol.extent.getCenter(app.projectionExtent),
          zoom: 8
        })
  });

  /**
   * An overlay layer.
   * @type {ol.layer.Image}
   */
  var overlay = new ol.layer.Image({
  
    source: new ol.source.WMTS({
            url: 'http://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaart',
            layer: 'brtachtergrondkaart',
            matrixSet: 'EPSG:28992',
            format: 'image/png',
            projection: app.projection,
            tileGrid: new ol.tilegrid.WMTS({
              origin: ol.extent.getTopLeft(app.projectionExtent),
              resolutions: app.resolutions,
              matrixIds: app.matrixIds
            })
          })
  });

  this.map.addLayer(overlay);

};

console.log('debug 6');
app.module.controller('MainController', app.MainController);
console.log('debug 7');
