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
  // $scope.url = $location.url();

  // вешаем событие на click на карте
  $scope.mapClick = function(e){
    var coords = e.get('coords');
    $location.url('/addDocument/' + coords);
  };

  // обработка ошибок
  $scope.showErrors = false;
  $scope.errors = [];

  // $scope.doDialog = function(place) {
  //   var title = 'Confirm';
  //   var msg = 'Do you really want to delete this place?';
  //   var btns = [{result:'no', label: 'No'}, {result:'yes', label: 'Yes', cssClass: 'btn-danger'}];

  //   $dialog.messageBox(title, msg, btns)
  //       .open()
  //       .then(function(result){
  //           if (result === 'yes') {
  //               $scope.delete(place);
  //           }
  //       });
  //   };
  // посчитаем количество страниц
  $scope.numberOfPages=function(){
    return Math.ceil($scope.filterDocuments.length/$scope.pageSize);
  };
}
// просмотр обращения
function ReadDocumentCtrl($scope, $location, $routeParams, Documents, Categories, $log) {
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
    history.back();
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
  // берем документ из базы
  Documents.get({id: $routeParams.id}, function(data){
    $scope.form = data;
    // категории
    $scope.categories = Categories.query();
    // категория в документе
    $scope.category =  Categories.get({id: data.category});
    // подготавливаем значения для карты
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
    // категория: заменяем объект на id
    $scope.form.category = $scope.category._id;
    Documents.update({id: $routeParams.id}, $scope.form);
    history.back();
  };
}
// добавление обращения
function AddDocumentCtrl($scope, $location, $routeParams, Documents, Categories, Upload, $timeout, $log) {
  'use strict';
  // $log.info("долгота: " + $routeParams.longitude + ", широта: " + $routeParams.latitude);
  // скрытие полей координат на форме (false для отладки)
  $scope.invisible = true;
  // чистим поля формы
  $scope.form = {};
  // устанавливаем центр и координаты метки
  $scope.map = {
    center: [$routeParams.longitude, $routeParams.latitude],
    point: { geometry: {type: "Point",coordinates: [$routeParams.longitude, $routeParams.latitude]}},
    zoom: 17
  };
  // предварительная инициализация карты. по точке запрашиваем геоданные
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
  // заполняем форму
  // координаты обращения
  $scope.form.latitude = $routeParams.latitude;
  $scope.form.longitude = $routeParams.longitude;
  // список категорий
  $scope.categories = Categories.query();
  $scope.category =  [{_id: 0, name: "выберите категорию"}];

  $scope.form.images = [];

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
      url: '/api/image/fakeupload',
      data: {images: $scope.form.images, file: $scope.form.file}
    }).then(function (resp) {
      $log.debug('Success ' + resp.config.data.file.name + ' uploaded. Response: ' + JSON.stringify(resp.data));
      $timeout(function () {
        $scope.$apply(function(){
          var images = $scope.form.images;
          if (images.length < 4) {
            images.push(resp.data.fileName);
          } else {
            images.shift(); // удаляем первую картинку
            images.push(resp.data.fileName); // сохраняем в конец массива
          }
          $log.info(images);
          $scope.form.images = images;
        });
      }, 1000);
    }, function (resp) {
      $log.debug('Error status: ' + resp.status);
    }, function (evt) {
      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      $log.debug('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
    });
  };

  // функция сохранения обращения
  $scope.submitDocument = function () {
    $scope.form.category = $scope.category._id;
    var newDocument = new Documents($scope.form);

    newDocument.$save().then(
      function (data) {
        $log.info("обращение сохранено");
        $log.debug(data);
        $location.url('/');
      },
      function (err) {
            // сообщаем об ошибке.
            alert(err.message);
      }
    );
  };
}

// главная страница личного кабинета
function PersonalAreaCtrl($scope, $http, $location, $routeParams, Documents, Categories) {
  'use strict';
  // подготовим пагинатор
  $scope.currentPage = 0;
  $scope.pageSize = 10;
  $scope.filterDocuments = [];
  $scope.url = $location.url();
  // заливаем объекты Documents и Categories в скоуп
  $scope.documents = Documents.query();
  $scope.categories = Categories.query();

  // вешаем событие на click на карте

  // посчитаем количество страниц
  $scope.numberOfPages=function(){
    return Math.ceil($scope.documents.length/$scope.pageSize);
  };
}

function AdminPanelCtrl($scope, Categories, Goverments, Users, $uibModal, $log) {
  'use strict';
  $scope.users = Users.query();
  $scope.categories = Categories.query();
  $scope.goverments = Goverments.query();

  $scope.status = {
    isFirstOpen: true,
    oneAtATime: true,
    isItemOpen: [true]
  };

  $scope.users_group = [
    {id: 0, name: "гость"},{id: 1, name: "пользователь"},{id: 2, name: "модератор"},{id: 3, name: "администратор"}
  ];

  // функция сохранения обращения
  $scope.editGoverment = function (ogv_id) {
    // ngDialog.open({ template: 'popupTmpl.html', className: 'ngdialog-theme-default' });
    $log.info("delete!", ogv_id);
  };
  // $scope.showForm = true;
  // $log.info("click!", ogv_id);
}


function AddPostCtrl($scope, $http, $location) {
  'use strict';
  $scope.form = {};
  $scope.submitPost = function () {
    $http.post('/api/post', $scope.form).
    success(function(data) {
      $location.path('/');
    });
  };
}

function ReadPostCtrl($scope, $http, $routeParams) {
  'use strict';
  $http.get('/api/post/' + $routeParams.id).
  success(function(data) {
    $scope.post = data.post;
  });
}

function EditPostCtrl($scope, $http, $location, $routeParams) {
  'use strict';
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
  'use strict';
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