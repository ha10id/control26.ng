function LoginCtrl($rootScope, $http, AuthService, $location, $log) {
  'use strict';
  $log.info('login controller');
  // var url = "https://gibdd.control26.ru/login";
  // $http({
  //   method: 'GET',
  //   dataType: 'jsonp',
  //   url: url
  // }).
  // success(function(status) {
  //   AuthService.getSession();
  //   $rootScope.currentUser = AuthService.status.user;
  //   $rootScope.isAdmin = AuthService.status.admin;
  //   $rootScope.isAuthorized = true;
  //   $log.info('пользователь: ', $rootScope.currentUser);
  //   history.back();
  // }).
  // error(function(status) {
  //   console.log(status);
  // });

  $http.get('/login').success(function(data) {
    AuthService.getSession();
    $rootScope.currentUser = AuthService.status.user;
    $rootScope.isAdmin = AuthService.status.admin;
    $rootScope.isAuthorized = true;
    $log.info('пользователь: ', $rootScope.currentUser);
    $location.url(headers.Location);
    // history.back();
  }).
  error(function(status) {
    console.log(status);
  });
}

function LogoutCtrl($rootScope, $http, $location, AuthService, $log) {
  'use strict';
  $log.info('logout controller');
  $http.get('/logout').success( function() {
    $rootScope.isAuthorized = false;
    $rootScope.isAdmin = false;
    $rootScope.currentUser = {};
    $location.url('/');
  });

  // history.back();
}

// главная страница
function IndexCtrl($scope, $location, $routeParams, AuthService, Documents, modDocuments, myDocuments, Categories, $log) {
  'use strict';
  AuthService.getSession();
    // подготовим пагинатор
  $scope.currentPage = 0;
  $scope.pageSize = 10;
  $scope.filterDocuments = [];
  // заливаем объекты Documents и Cate скоуп

  var status = AuthService.getStatus();
  // $log.info('статус: ', status);
  // $log.info('пользователь: ', status.user.group);
  if(status.authorized) {
    // показывать новые обращения
    $scope.iStatus = {status: 0};
    $scope.user = status.user;
    if (status.user.group == 2) {
      // список обращений в ЛК модератора
      $scope.documents = modDocuments.query();
    } else {
      // список обращений в ЛК пользователя или администратора
      $scope.documents = myDocuments.query();
    };
  } else {
    $scope.documents = Documents.query();
    // показывать обращения в работе
    $scope.iStatus = {status: 1};
  };

  $scope.iStatus = {status: 1};
  // $scope.url = $location.url();
  // var user = AuthService.testLogin();
  // $log.info($scope.currentUser);
  // вешаем событие на click на карте
  $scope.mapClick = function(e){
    var coords = e.get('coords');
    $location.url('/addDocument/' + coords);
  };
  // обработка ошибок
  $scope.showErrors = false;
  $scope.errors = [];
  // посчитаем количество страниц
  $scope.numberOfPages=function(){
    return Math.ceil($scope.filterDocuments.length/$scope.pageSize);
  };
}
// просмотр обращения
function ReadDocumentCtrl($scope, $location, $routeParams, $timeout, AuthService, modalService, Documents, Categories, Comments, $log) {
  'use strict';
  AuthService.getSession();
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
  $scope.showWorkPanel = false;

  if ($scope.isAdmin || $scope.isModerator) {
    $scope.showWorkPanel = true;
  };
  $log.info($scope.isAdmin, $scope.isModerator, $scope.showWorkPanel);
  // var images = new Array(data.images.length);
  // $log.info('массив: ', data.images[1]);
  // $log.info('всего картинок: ', images.length);
  $scope.twoCols = false;
  $scope.oneCols = true;
  //-----------------------------------------------------
  // показываем диалог комментария
  $scope.showDialog = function () {
    // $log.info('show Dialog');
    var modalDefaults = {
      backdrop: true,
      keyboard: true,
      modalFade: true,
      templateUrl: 'addComment.html'
    }
    var modalOptions = {
      closeButtonText: 'Отмена',
      actionButtonText: 'Отправить',
      headerText: 'Комментарий'
    };
    modalService.showModal(modalDefaults, modalOptions).then(function (result) {
      // console.info(result);
      //-----------------------------------------------------
      var newComment = new Comments();
      newComment.comment = result;
      newComment._document = data._id;
      newComment.$save().then(
        function (data) {
          $log.info("комментарий сохранен");
          // $log.debug(data);
          $timeout(function() {
            var data = Documents.get({id: $routeParams.id}, function(){
              // $log.debug(data);
              $scope.document = data;
            });
          }, 0);
        },
        function (err) {
          // сообщаем об ошибке.
          $log.warn("++++++++++++++++++++++++++++");
          switch(err.status) {
            case 401:
              $log.info(err);
              alert('Вы не авторизованы! Зарегистрируйтесь на портале (меню "ВХОД").');
              break;
            default:
              alert(err.statusText);
          };
          $history.back();
        }
      );
    });
  };

  //-----------------------------------------------------
  // покажем диалог картинки
  $scope.showImage = function(photoId) {
    // $log.info('show Photo', photoId);
    var modalDefaults = {
      backdrop: true,
      keyboard: true,
      modalFade: true,
      templateUrl: 'showPhoto.html'
    }
    var modalOptions = {
      closeButtonText: 'Закрыть',
      headerText: 'Фотография',
      image: 'uploads/' + $scope.document.images[photoId]
    };
    // $log.info('name photo', modalOptions.image);
    modalService.showModal(modalDefaults, modalOptions).then(function (result) {
      console.info(result);
      //self.$auth.DeleteAccount();
    });
  };

  // закрыть документ
  $scope.closeDocument = function() {
    $scope.document.status = 2;
    $scope.updateDocument();
  };

  // отменить закрытие
  $scope.uncloseDocument = function() {
    $scope.document.status = 1;
    $scope.updateDocument();
  };

  // принять в работу
  $scope.commitDocument = function() {
    $scope.document.status = 1;
    $scope.updateDocument();
  };


  $scope.updateDocument = function() {
    Documents.update({id: $routeParams.id}, $scope.document,
      function (data) {
        $log.info("обращение сохранено");
        // $log.debug(data);
        // $location.url('/');
      },
      function (err) {
        // сообщаем об ошибке.
        $log.warn("++++++++++++++++++++++++++++");
        switch(err.status) {
          case 401:
            $log.info(err);
            alert('Вы не авторизованы! Зарегистрируйтесь на портале (меню "ВХОД").');
            break;
          case 403:
            $log.info(err);
            alert('Не достаточно прав.');
            break;
          default:
            alert(err.statusText);
        };
      }
    );
    history.back();
  };
  // }
  // событие кнопки "закрыть"
  $scope.closeWindow = function() {
    history.back();
  };
}
// редактирование обращения
function EditDocumentCtrl($scope, $location, $routeParams, AuthService, Documents, Categories, Upload, $timeout, $log) {
  'use strict';
  AuthService.getSession();
  $scope.invisible = true;
  $scope.form = {};
  // вешаем событие на dragend маркера
  $log.info('-------------controller edit document-----------------');
  $scope.twoCols = false;
  $scope.oneCols = true;
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
    // $scope.category =  Categories.get({id: data.category});
    $scope.category = {id: data.category, name: ''};
    $log.info($scope.category);
    // подготавливаем значения для карты
    $scope.map = {
      center: [data.longitude, data.latitude],
      point: { geometry: {type: "Point",coordinates: [data.longitude, data.latitude]}},
      zoom: 17
    };
  });
  // $scope.addComment = function()
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
  $scope.submit = function () {
    // категория: заменяем объект на id
    $scope.form.category = $scope.category.id;
    Documents.update({id: $routeParams.id}, $scope.form,
      function (data) {
        $log.info("обращение сохранено");
        $log.debug(data);
        // $location.url('/');
      },
      function (err) {
        // сообщаем об ошибке.
        $log.warn("++++++++++++++++++++++++++++");
        switch(err.status) {
          case 401:
            $log.info(err);
            alert('Вы не авторизованы! Зарегистрируйтесь на портале (меню "ВХОД").');
            break;
          case 403:
            $log.info(err);
            alert('Не достаточно прав.');
            break;
          default:
            alert(err.statusText);
        };
      }
    );
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
  $scope.category =  {};

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
  $scope.submit = function () {
    $log.info('категория: ', $scope.category);
    $scope.form.category = $scope.category.id;
    var newDocument = new Documents($scope.form);

    newDocument.$save().then(
      function (data) {
        $log.info("обращение сохранено");
        $log.debug(data);
        $location.url('/');
      },
      function (err) {
        // сообщаем об ошибке.
        $log.warn("++++++++++++++++++++++++++++");
        switch(err.status) {
          case 401:
            $log.info(err);
            alert('Вы не авторизованы! Зарегистрируйтесь на портале (меню "ВХОД").');
            break;
          default:
            alert(err.statusText);
        };
        $location.url('/');
      }
    );
  };
}

// главная страница личного кабинета
function PersonalAreaCtrl($scope, $http, $location, $routeParams, AuthService, myDocuments, modDocuments, Categories, Users, $log) {
  'use strict';
  AuthService.getSession();
  // подготовим пагинатор
  $scope.currentPage = 0;
  $scope.pageSize = 10;
  $scope.filterDocuments = [];
  $scope.url = $location.url();
  // заливаем объекты myDocuments и Categories в скоуп
  // api сам решает какие документы нам отдать
  // $log.info($rootScope.currentUser);
  var status = AuthService.getStatus();
  // $log.info('статус: ', status);
  // $log.info('пользователь: ', status.user.group);
  if(status.authorized) {
    $scope.user = status.user;
  };

  if (status.user.group == 2) {
    // список обращений в ЛК модератора
    $scope.documents = modDocuments.query();
  } else {
    // список обращений в ЛК пользователя или администратора
    $scope.documents = myDocuments.query();
  };

  // $log.info('записей: ', $scope.documents.count());

  $scope.categories = Categories.query();

  // показывать обращения в работе
  $scope.iStatus = {status: 0};
  // $scope.user = currentUser();
  // посчитаем количество страниц
  $scope.numberOfPages=function(){
    return Math.ceil($scope.documents.length/$scope.pageSize);
  };
}

// страница администрирования
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

  $scope.user =[];

  $log.info('-----admin panel controller---------------');
  $log.info($scope.goverments);

  $scope.saveUser = function(user) {
    // $log.info(user.id);
    // $scope.$apply(function(){
    var groupObject = user.group;
    user.group = groupObject.id;
    $log.info(user);
    // user.group = groupObject;
    $log.info('выбранная группа: ', user.group);
    user.group = groupObject;
    // })
  }
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