// Declare app level module which depends on filters, and services
angular.module('myApp', ['auth', 'ngRoute', 'yaMap', 'ui.bootstrap', 'ngFileUpload', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.components']).
run(function($rootScope, AuthService) {
    console.log("app run");
    var session = AuthService.getSession();
    console.log(session);
    if(AuthService.isAuthorized()) {
      console.log("authorized");
      $rootScope.isAuthorized = true;
    } else {
      console.log("unauthorized");
      $rootScope.isAuthorized = false;
    }
}).
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
  when('/login', {
    templateUrl: 'partials/login',
    controller:  LoginCtrl
  }).
  when('/logout', {
    templateUrl: 'partials/login',
    controller:  LogoutCtrl
  }).
  otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
}]);