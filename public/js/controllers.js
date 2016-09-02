'use strics';
// главная страница
function IndexCtrl($scope, $http) {
  $http.get('/api/documents').
    success(function(data, status, headers, config) {
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.documents = data;
    $scope.numberOfPages=function(){
      return Math.ceil($scope.documents.length/$scope.pageSize);
    };
  });
}
// просмотр обращения
function ReadDocumentCtrl($scope, $http, $location, $routeParams, Categories) {
  $http.get('/api/document/' + $routeParams.id).
    success(function(data) {
      $scope.document = data;
      $scope.category =  Categories.get({id: data.category});
      $scope.map = {
        center: [data.longitude, data.latitude],
        coords: [data.longitude, data.latitude],
        zoom: 17
      };
    });
  $scope.closeDocument = function() {
    $location.url('/');
  };
}
// редактирование обращения
function EditDocumentCtrl($scope, $http, $location, $routeParams, Categories) {
  $scope.form = {};
  $http.get('/api/document/' + $routeParams.id).
    success(function(data) {
      $scope.form = data;
      $scope.categories = Categories.query();
      $scope.category =  Categories.get({id: data.category});
      $scope.map = {
        center: [data.longitude, data.latitude],
        coords: [data.longitude, data.latitude],
        zoom: 17
      };
    });
  // функция обновления документа (кнопка "сохранить")
  $scope.editDocument = function () {
    $scope.form.category = $scope.category._id;
    $http.put('/api/document/' + $routeParams.id, $scope.form).
      success(function(data) {
        $location.url('/readDocument/' + $routeParams.id);
      });
  };
}
// добавление обращения
function AddDocumentCtrl($scope, $http, $location, Categories) {
  $scope.form = {};
  $scope.categories = Categories.query();
  $scope.category =  [{_id: 0, name: "выберите категорию"}];
  $scope.submitDocument = function () {
    $http.post('/api/post', $scope.form).
      success(function(data) {
        $location.path('/');
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