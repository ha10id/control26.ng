// Declare app level module which depends on filters, and services
angular.module('myApp', ['auth', 'ngRoute', 'yaMap', 'ui.bootstrap', 'ngFileUpload', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.components']).
config(function (yaMapSettingsProvider) {
  yaMapSettingsProvider.setOrder('latlong');
}).
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
  when('/addDocument/:longitude,:latitude', {
    templateUrl: 'partials/addDocument',
    controller: AddDocumentCtrl
  }).
  when('/personalArea', {
    templateUrl: 'partials/personalArea',
    controller: PersonalAreaCtrl
  }).
  when('/adminPanel', {
    templateUrl: 'partials/adminPanel',
    controller: AdminPanelCtrl
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
  when('/loginESIA', {
    redirectTo: '/login'
  }).
  // when('/loginESIA', {
  //   // redirectTo: function($location) {
  //   //   $location.href('/login');
  //   //   $location.replace();
  //   //   // $location.href = "/404.html";
  //   // }
  //     controller: ['$location', function($location){
  //       $location.absUrl('http://localhost:3000/login');
  //   }]
  // }).
  otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
}]);