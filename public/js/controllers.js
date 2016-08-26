'use strict';

function IndexCtrl($scope, $http) {
  $http.get('/api/documents').
    success(function(data, status, headers, config) {
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.documents = data;
  //   var posts = [];
  // data.posts.forEach(function (post, i) {
  //   posts.push({
  //     id: i,
  //     title: post.title,
  //     text: post.text.substr(0, 50) + '...'
  //   });
  // });
    $scope.numberOfPages=function(){
      return Math.ceil($scope.documents.length/$scope.pageSize);
    }
  });
}

function ReadDocumentCtrl($scope, $http, $routeParams) {
  $http.get('/api/document/' + $routeParams.id).
    success(function(data) {
      $scope.document = data;
      $scope.map = {
        center: [data.longitude, data.latitude],
        coords: [data.longitude, data.latitude],
        zoom: 17
      };
    });
}
function EditDocumentCtrl($scope, $http, $location, $routeParams) {
  $scope.form = {};
  $http.get('/api/document/' + $routeParams.id).
    success(function(data) {
      $scope.form = data;
      $scope.map = {
        center: [data.longitude, data.latitude],
        coords: [data.longitude, data.latitude],
        zoom: 17
      };
    });

  $scope.editDocument = function () {
    $http.put('/api/document/' + $routeParams.id, $scope.form).
      success(function(data) {
        $location.url('/readDocument/' + $routeParams.id);
      });
  };
}
// function IndexCtrl($scope, $http) {
//   $http.get('/api/posts').
//     success(function(data, status, headers, config) {
//       $scope.posts = data.posts;
//     });
// }


function AddPostCtrl($scope, $http, $location) {
  $scope.form = {};
  $scope.submitPost = function () {
    $http.post('/api/post', $scope.form).
      success(function(data) {
        $location.path('/');
      });
  };
}

function ReadPostCtrl($scope, $http, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });
}

function EditPostCtrl($scope, $http, $location, $routeParams) {
  $scope.form = {};
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.form = data.post;
    });

  $scope.editPost = function () {
    $http.put('/api/post/' + $routeParams.id, $scope.form).
      success(function(data) {
        $location.url('/readPost/' + $routeParams.id);
      });
  };
}

function DeletePostCtrl($scope, $http, $location, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });

  $scope.deletePost = function () {
    $http.delete('/api/post/' + $routeParams.id).
      success(function(data) {
        $location.url('/');
      });
  };

  $scope.home = function () {
    $location.url('/');
  };
}