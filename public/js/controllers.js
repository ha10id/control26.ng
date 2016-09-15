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

// использование промисов (устарело)
// var query = UserService.query();
// query.$promise.then(function(data) {
//      $scope.users = data;
//      // Do whatever when the request is finished
// });

// главная страница
function IndexCtrl($scope, $location, $routeParams, Documents, Categories) {
  'use strict';
  // подготовим пагинатор
  $scope.currentPage = 0;
  $scope.pageSize = 10;
  $scope.filterDocuments = [];
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
  'use strict';
  var data = Documents.get({id: $routeParams.id}, function(){
    $scope.document = data;
    $scope.category =  Categories.get({id: data.category});
    // широта latitude (45) долгота longitude (41)
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
function EditDocumentCtrl($scope, $location, $routeParams, Documents, Categories, Upload, $timeout, $log) {
  'use strict';
  $scope.invisible = true;
  $scope.form = {};
  // вешаем событие на dragend маркера
  $scope.dragEnd = function(e){
    var coords = e.get('target').geometry.getCoordinates();
    ymaps.geocode([coords[0], coords[1]], { results: 1 }).then(function (res) {
        // Выбираем первый результат геокодирования.
        var firstGeoObject = res.geoObjects.get(0);
        coords = firstGeoObject.geometry.getCoordinates();
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
  // загрузка фоток
  $scope.uploadFiles = function(file, errFiles) {
    $scope.form.file = file;
    $scope.form.errFile = errFiles && errFiles[0];
    if (file) {
      $scope.upload($scope.form.file);
      $log.warn("++++++++++++++++++++++++++++");
      $log.info("scope is: ", $scope)
    }
    if (errFiles) {
      $log.error("слишком большой файл");
    }
  };
  // upload on file select or drop
  $scope.upload = function (file) {
      Upload.upload({
          url: '/api/image/upload',
          data: {document_id: $routeParams.id, file: $scope.form.file}
      }).then(function (resp) {
          $log.debug('Success ' + resp.config.data.file.name + ' uploaded. Response: ' + JSON.stringify(resp.data));
          $timeout(function () {
            $scope.$apply(function(){
              $scope.form = resp.data;
            });
          }, 1000);
      }, function (resp) {
          $log.debug('Error status: ' + resp.status);
      }, function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $log.debug('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      });
  };
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

  // координаты обращения
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