'use strics';
// главная страница
function IndexCtrl($scope, $http, $location, $routeParams) {
  $http.get('/api/documents').
    success(function(data, status, headers, config) {
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.documents = data;
    // var _map;
    //   $scope.afterMapInit = function(map){
    // _map = map;
    // };
    // вешаем событие на click на карте
    $scope.mapClick = function(e){
      var coords = e.get('coords');
      $location.url('/addDocument/' + coords);
    };
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
      $scope.document.images[0] = "/img/epmty.png";
      $scope.category =  Categories.get({id: data.category});
      var _map;
        $scope.afterMapInit = function(nMap){
      _map = nMap;
      };
      // широта latitude (45)
      $scope.map = {
        center: [data.longitude, data.latitude],
        point: { geometry: {type: "Point",coordinates: [data.longitude, data.latitude]}},
        zoom: 17
      };
    });
  $scope.closeDocument = function() {
    $location.url('/');
  };
}
// редактирование обращения
function EditDocumentCtrl($scope, $http, $location, $routeParams, Categories) {
  $scope.invisible = true;
  $scope.form = {};
  // вешаем событие на dragend маркера
  $scope.dragEnd = function(e){
    var coords = e.get('target').geometry.getCoordinates();
    ymaps.geocode([coords[0], coords[1]], { results: 1 }).then(function (res) {
        // Выбираем первый результат геокодирования.
        var firstGeoObject = res.geoObjects.get(0);
        var coords = firstGeoObject.geometry.getCoordinates();
        // alert(firstGeoObject.geometry.getCoordinates());
        // Задаем адрес из результата геокодирования.
        $scope.$apply(function(){
            // $scope.center = firstGeoObject.geometry.getCoordinates();
            $scope.form.latitude = coords[1];
            $scope.form.longitude = coords[0];
            $scope.form.address = firstGeoObject.properties.get('text');
        });
    }, function (err) {
        // Если геокодирование не удалось, сообщаем об ошибке.
        alert(err.message);
    });
  };

  $scope.form.latitude = $routeParams.latitude;
  $scope.form.longitude = $routeParams.longitude;

  $http.get('/api/document/' + $routeParams.id).
    success(function(data) {
      $scope.form = data;
      $scope.categories = Categories.query();
      $scope.category =  Categories.get({id: data.category});
      $scope.map = {
        center: [data.longitude, data.latitude],
        point: { geometry: {type: "Point",coordinates: [data.longitude, data.latitude]}},
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
function AddDocumentCtrl($scope, $http, $location, $routeParams, Categories) {
  // alert("долгота: " + $routeParams.longitude + ", широта: " + $routeParams.latitude);
  $scope.invisible = true;
  $scope.form = {};
  $scope.map = {
    center: [$routeParams.longitude, $routeParams.latitude],
    point: { geometry: {type: "Point",coordinates: [$routeParams.longitude, $routeParams.latitude]}},
    zoom: 17
  };

  $scope.beforeInit = function(){
      ymaps.geocode([$routeParams.longitude, $routeParams.latitude], { results: 1 }).then(function (res) {
          // Выбираем первый результат геокодирования.
          var firstGeoObject = res.geoObjects.get(0);
          // Задаем адрес из результата геокодирования.
          $scope.$apply(function(){
              // $scope.center = firstGeoObject.geometry.getCoordinates();
              $scope.form.address = firstGeoObject.properties.get('text');
          });
      }, function (err) {
          // Если геокодирование не удалось, сообщаем об ошибке.
          alert(err.message);
      });
  };
  // вешаем событие на dragend маркера
  $scope.dragEnd = function(e){
    var coords = e.get('target').geometry.getCoordinates();
      ymaps.geocode([coords[0], coords[1]], { results: 1 }).then(function (res) {
          // Выбираем первый результат геокодирования.
          var firstGeoObject = res.geoObjects.get(0);
          var coords = firstGeoObject.geometry.getCoordinates();
          // alert(firstGeoObject.geometry.getCoordinates());
          // Задаем адрес из результата геокодирования.
          $scope.$apply(function(){
              // $scope.map.center = coords;
              $scope.form.latitude = coords[1];
              $scope.form.longitude = coords[0];
              $scope.form.address = firstGeoObject.properties.get('text');
          });
      }, function (err) {
          // Если геокодирование не удалось, сообщаем об ошибке.
          alert(err.message);
      });
    };

  $scope.form.latitude = $routeParams.latitude;
  $scope.form.longitude = $routeParams.longitude;

  $scope.categories = Categories.query();
  $scope.category =  [{_id: 0, name: "выберите категорию"}];

  $scope.submitDocument = function () {
    $http.post('/api/document', $scope.form).
      success(function(data) {
        // $location.path('/');
        $location.url('/readDocument/' + data.id);
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