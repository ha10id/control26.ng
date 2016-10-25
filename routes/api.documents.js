var gm              = require('gm');
var fs              = require('fs');
//========================================================
var User     = require('./models/User.js');
var Document = require('./models/Document.js');
var Category = require('./models/Category.js');
var Goverment = require('./models/Goverment.js');
// генерация уникального ID
var ID = function () {
  'use strict';
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};
//========================================================
// Documents
// список документов +
exports.list = function (req, res) {
  'use strict';
  Document.find(function(err, documents) {
    if (err) {
      res.send(err);
    }
    documents = documents.map(function(data) {
      return {
        id: data.id,
        name: data.name,
        title: data.title,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        status: data.status,
        astatus: data.istatus,
        datestamp: data.datestamp,
        geoObject: data.geoObject
      };
    });
      res.json(documents); // return all documents in JSON format
    }).sort({datestamp: -1});
};

function CategoriesByModerator(idUser, callback) {
  Goverment.findOne({_worker: idUser}, function(err, ogv) {
    Category.find({_ogv: ogv._id}, function(err, cat) {
      cat = cat.map(function(data) {
        return {
          id: data._id
        };
      });
      callback(cat);
    })
  })
};

// список документов по модератору +
// exports.listDocumentsByModerator = function (req, res) {
exports.listDocumentsByModerator = function (req, res) {
  'use strict';
  console.log("--list by moderator---------------------------");
  console.log(req.session.currentUser._id);
  CategoriesByModerator(req.session.currentUser._id, function(categories) {
    console.log(categories);
    console.log(categories.length);
    var arrCategories = [];
    for (var i = 0; i < categories.length; i++) {
      arrCategories[i] = categories[i].id;
    };
    console.log(arrCategories);
    var filter = {category: {$in: arrCategories}};
    console.log(filter);
    Document.find(filter, function(err, documents) {
      if (err) {
        res.send(err);
      }
      documents = documents.map(function(data) {
        return {
          id: data.id,
          name: data.name,
          title: data.title,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          description: data.description,
          status: data.status,
          astatus: data.istatus,
          datestamp: data.datestamp,
          geoObject: data.geoObject
        };
      });
        res.json(documents); // return all documents in JSON format
      }).sort({datestamp: -1});
  })
};

// список документов по владельцу +
exports.listMyDocuments = function (req, res) {
  'use strict';
  console.log("--list my documents---------------------------");
  if (req.session.authorized) {
    if (req.session.isadmin) {
      var filter = {};
    } else {
      var owner = req.session.currentUser._id;
      var filter = {_creator: owner};
    };

    Document.find(filter, function(err, documents) {
      if (err) {
        res.send(err);
      }
      documents = documents.map(function(data) {
        return {
          id: data.id,
          name: data.name,
          title: data.title,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          description: data.description,
          status: data.status,
          astatus: data.istatus,
          datestamp: data.datestamp,
          geoObject: data.geoObject
        };
      });
        // console.dir(documents);
        res.json(documents); // return all documents in JSON format
      }).sort({datestamp: -1});
  } else {
    res.sendStatus(401); // не авторизован
  }
};
// получить документ по ID +
exports.get = function (req, res) {
  'use strict';
  var id = req.params.id;
  console.log("-----------------------------------------");
  console.log('api get document :', id);
  Document.findOne({ _id : id }, function(err, document) {
    if (err) {
      res.send(err);
    }
    console.log(document);
    res.json(document); // return one document in JSON format
  }).populate("_comments");
};
// добавление документа
exports.add = function (req, res) {
  'use strict';
  // data.posts.push(req.body);
    console.log("-----------------------------------------");
    console.log("создание документа: \n");

  if (req.session.authorized) {
    // заполняем поля статуса и даты создания документа
    req.body.status = 0;
    req.body._creator = req.session.currentUser._id;
    req.body.name = req.session.currentUser.name;
    req.body.datestamp = new Date();
    // новый объект
    var newDocument = new Document(req.body);
    // пробуем записать
    newDocument.save(function(err) {
      console.log(newDocument);
      var data = newDocument.toObject();
      data.id = data._id;
      if (err) {
        res.send(err);
      }
      res.json(data);
    });
  } else {
    res.sendStatus(401);
  }
};
// обновление документа
exports.edit = function (req, res) {
  'use strict';
  if (req.session.authorized) {
    var id = req.params.id;
    console.log("-----------------------------------------");
    console.log("обновление документа: ", id, "\n");
    console.log('session.currentUser: ', req.session.currentUser);
    console.log('session.isadmin: ', req.session.isadmin);
    console.dir('request.body: ', req.body);

    Document.findOne({ _id : id }, function(err, document) {
      if (err) {
        res.send(false);
      }
      // изменяем поля
      document.title = req.body.title;
      document.description = req.body.description;
      document.category = req.body.category;
      document.longitude = req.body.longitude;
      document.latitude = req.body.latitude;
      document.address = req.body.address;
      document.status = req.body.status;
      // document.name = req.session.user;
      if ((document._creator == req.session.currentUser._id) || (req.session.isadmin == true) || (req.session.ismoderator == true)) {
        // сохраняем отредактированный документ
        console.log(document);
        document.save(function(err) {
          if (err) {
            res.send(false);
          }
          res.json(true);
        });
      } else {
        res.sendStatus(403); // запрещено
      }
    });
  } else {
    res.sendStatus(401); // не авторизован
  }
};

//========================================================
// загрузка картинок
exports.imageUpload = function (req, res, next) {
  'use strict';
  console.log("-----------------------------------------");
  console.log("загузка изображения в документ: ", req.body.document_id, "\n");
  var file = req.files.file;
  console.log("имя файла: ", file.name); //original name (ie: sunset.png)
  // console.log(file.path); //tmp path (ie: /tmp/12345-xyaz.png)
  // console.log(file.type); //tmp path (ie: /tmp/12345-xyaz.png)
  // console.log(req.body.document_id);
  var tmp_path = file.path;
  var fileName = ID();
  var target_path = 'public/uploads/tmp/' + fileName;
  fs.renameSync(tmp_path, target_path, function(err) {
    if (err) {
      console.error(err.stack);
    }
  });
  // уменьшим картинку
  gm(target_path)
  .resize(800, 600, "!")
  .noProfile()
  .write('public/uploads/' + fileName, function(err) {
    if (err) console.error(err.stack);
  });
  // заделаем тумбочки
  gm(target_path)
  .resize(160, 130, "!")
  .noProfile()
  .write('public/uploads/thumbs/' + fileName, function(err) {
    if (err) {
      console.error(err.stack);
    } else {
      fs.unlinkSync(target_path, (err) => {
        if (err) throw err;
        console.log('файл удалён ', target_path);
      });
    }
  });

    // ищем текущий документ чтобы записать в него адрес фотки
    Document.findOne({ _id: req.body.document_id }, function(err, d) {
      if (!d) return next(new NotFound('Document not found'));
      console.log("изображений в документе: ", d.images.length);

      if (d.images.length < 6) {
        d.images.push(fileName);
        d.save();
        console.log("файл добавлен в конец документа");
      } else {
          // d.images.pop(-1);
          var oldFile = d.images[0];
          d.images.pull(oldFile); // удаляем первую картинку
          d.images.push(fileName); // сохраняем в конец массива
          fs.unlink('public/uploads/thumbs/' + oldFile, function(err) {
           if (err) {
             return console.error(err);
           }
         });
          fs.unlink('public/uploads/' + oldFile, function(err) {
           if (err) {
             return console.error(err);
           }
         });

          console.log("удален файл: ", oldFile );
          d.save();
        }
        console.log(d);
        res.json(d);
      });
  };

// загрузка картинок в массив и на сервер
exports.imageFakeUpload = function (req, res, next) {
  'use strict';
  console.log("-----------------------------------------");
  console.log("загузка изображения", "\n");
  var file = req.files.file;
  console.log("имя файла: ", file.name); //original name (ie: sunset.png)
  // console.log(file.path); //tmp path (ie: /tmp/12345-xyaz.png)
  // console.log(file.type); //tmp path (ie: /tmp/12345-xyaz.png)
  // console.log(req.body.document_id);
  var tmp_path = file.path;
  // формируем уникальное имя для файла
  var fileName = ID();
  var target_path = 'public/uploads/tmp/' + fileName;
  fs.renameSync(tmp_path, target_path, function(err) {
    if (err) {
      console.error(err.stack);
    }
  });
  // уменьшим картинку
  gm(target_path)
  .resize(800, 600, "!")
  .noProfile()
  .write('public/uploads/' + fileName, function(err) {
    if (err) console.error(err.stack);
  });
  // заделаем тумбочки
  gm(target_path)
  .resize(160, 130, "!")
  .noProfile()
  .write('public/uploads/thumbs/' + fileName, function(err) {
    if (err) {
      console.error(err.stack);
    } else {
      fs.unlink(target_path, (err) => {
        if (err) throw err;
        console.log('файл удалён ', target_path);
      });
    }
  });

  console.log("имя файла на запись: ", fileName);
  res.json({fileName});
};
