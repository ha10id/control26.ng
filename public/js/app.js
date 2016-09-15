// Declare app level module which depends on filters, and services
angular.module('myApp', ['ngRoute', 'yaMap', 'ui.bootstrap', 'ngFileUpload', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.components']).
config(function (yaMapSettingsProvider) { yaMapSettingsProvider.setOrder('latlong'); }).
// config(function(ymapsConfig){
//   ymapsConfig.clusterize = true;
//   ymapsConfig.markerOptions.preset = 'islands#darkblueDotIcon';
// }).
// config(["$provide", function($provide){
//   // Use the `decorator` solution to substitute or attach behaviors to
//   // original service instance; @see angular-mocks for more examples....
//   $provide.decorator( '$log', [ "$delegate", function( $delegate )
//   {
//       // Save the original $log.debug()
//       var debugFn = $delegate.debug;

//       $delegate.debug = function( )
//       {
//         var args    = [].slice.call(arguments),
//             now     = new Date();

//         // Prepend timestamp
//         args[0] = supplant("{0} - {1}", [ now, args[0] ]);

//         // Call the original with the output prepended with formatted timestamp
//         debugFn.apply(null, args)
//       };

//       return $delegate;
//   }])
// }]).
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