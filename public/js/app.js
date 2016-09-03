// Declare app level module which depends on filters, and services
angular.module('myApp', ['ngRoute', 'yaMap', 'myApp.filters', 'myApp.services', 'myApp.directives']).
// config(function(ymapsConfig){
//   ymapsConfig.clusterize = true;
//   ymapsConfig.markerOptions.preset = 'islands#darkblueDotIcon';
// }).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.
  when('/', {
    templateUrl: 'partials/index',
    controller: IndexCtrl
  }).
  when('/readDocument/:id', {
    templateUrl: 'partials/readDocument',
    controller: ReadDocumentCtrl
  }).
  when('/editDocument/:id', {
    templateUrl: 'partials/editDocument',
    controller: EditDocumentCtrl
  }).
  when('/addDocument', {
    templateUrl: 'partials/addDocument',
    controller: AddDocumentCtrl
  }).
  when('/addPost', {
    templateUrl: 'partials/addPost',
    controller: AddPostCtrl
  }).
  // when('/readPost/:id', {
  //   templateUrl: 'partials/readPost',
  //   controller: ReadPostCtrl
  // }).
  when('/editPost/:id', {
    templateUrl: 'partials/editPost',
    controller: EditPostCtrl
  }).
  when('/deletePost/:id', {
    templateUrl: 'partials/deletePost',
    controller: DeletePostCtrl
  }).
  otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
}]);