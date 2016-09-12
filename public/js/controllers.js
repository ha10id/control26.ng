'use strics';
// function ModalCtrl($uibModal, $log) {
//   var $ctrl = this;
//   $ctrl.animationsEnabled = true;
//   $ctrl.open = function (size) {
//     var modalInstance = $uibModal.open({
//       animation: $ctrl.animationsEnabled,
//       ariaLabelledBy: 'modal-title',
//       ariaDescribedBy: 'modal-body',
//       templateUrl: 'myModalContent.html',
//       controller: 'ModalInstanceCtrl',
//       controllerAs: '$ctrl',
//       size: size,
//       resolve: {
//         items: function () {
//           return $ctrl.items;
//         }
//       }
//     });
//   };
// }
// главная страница
function IndexCtrl($scope, $location, $routeParams, Documents, Categories) {
  $scope.currentPage = 0;
  $scope.pageSize = 10;
  // заливаем объекты Documents и Cate скоуп
  $scope.documents = Documents.query();
  $scope.categories = Categories.query();
  // вешаем событие на click на карте
  $scope.mapClick = function(e){
    var coords = e.get('coords');
    $location.url('/addDocument/' + coords);
  };
  // посчитаем количество страниц
  $scope.numberOfPages=function(){
    return Math.ceil($scope.filterDocuments.length/$scope.pageSize);
  };
}
// просмотр обращения
function ReadDocumentCtrl($scope, $location, $routeParams, Documents, Categories) {
  var data = Documents.get({id: $routeParams.id}, function(){
    $scope.document = data;
    // $scope.document.images[0] = "/img/epmty.png";
    $scope.category =  Categories.get({id: data.category});
    // широта latitude (45)
    $scope.map = {
      center: [data.longitude, data.latitude],
      point: { geometry: {type: "Point",coordinates: [data.longitude, data.latitude]}},
      zoom: 17
    };
  });
  // событие кнопки "закрыть"
  $scope.closeDocument = function() {
    $location.url('/');
  };
}

// редактирование обращения
function EditDocumentCtrl($scope, $location, $routeParams, Documents, Categories) {
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

  Documents.get({id: $routeParams.id}, function(data){
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
    // заменяем объект на id
    $scope.form.category = $scope.category._id;
    Documents.update({id: $routeParams.id}, $scope.form);
    $location.url('/readDocument/' + $routeParams.id);
  };
}
// добавление обращения
function AddDocumentCtrl($scope, $location, $routeParams, Documents, Categories) {
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
    $scope.form.category = $scope.category._id;
    var newDocument = new Documents($scope.form);
    // alert(newDocument.title);
    newDocument.$save().then(function (data) {
      $location.url('/readDocument/' + data.id);
    }, function (err) {
          // сообщаем об ошибке.
          alert(err.message);
    });
  };
}

// главная страница личного кабинета
function PersonalAreaCtrl($scope, $http, $location, $routeParams, Categories) {
  $http.get('/api/documents').
    success(function(data, status, headers, config) {
      $scope.currentPage = 0;
      $scope.pageSize = 10;
      // заливаем результат запроса в скоуп
      $scope.documents = data;
      $scope.categories = Categories.query();
      // вешаем событие на click на карте
      $scope.mapClick = function(e){
        var coords = e.get('coords');
        $location.url('/addDocument/' + coords);
      };
      // посчитаем количество страниц
      $scope.numberOfPages=function(){
        return Math.ceil($scope.documents.length/$scope.pageSize);
      };
    });
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