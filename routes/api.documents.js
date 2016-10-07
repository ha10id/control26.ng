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
// список документов по владельцу +
exports.listMyDocuments = function (req, res) {
  'use strict';
  if (req.session.authorized) {
    if (req.session.isAdmin) {
      var filter = {};
    } else {
      var owner = req.session.user_id;
      var filter = {_creator: owner};
    }
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
  var id = req.params.id;
  console.log("-----------------------------------------");
  console.log("обновление документа: ", id, "\n");
  console.dir(req.body);
  if (req.session.authorized) {
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
      if (document._creator == req.session.user_id || req.session.isAdmin) {
        // сохраняем отредактированный документ
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
  var target_path = 'public/uploads/' + fileName;
  fs.renameSync(tmp_path, target_path, function(err) {
    if (err) {
      console.error(err.stack);
    }
  });
    // заделаем тумбочки
    gm(target_path)
    .resize(160, 130, "!")
    .noProfile()
    .write('public/uploads/thumbs/' + fileName, function(err) {
      if (err) console.error(err.stack);
    });
    // ищем текущий документ чтобы записать в него адрес фотки
    Document.findOne({ _id: req.body.document_id }, function(err, d) {
      if (!d) return next(new NotFound('Document not found'));
      console.log("изображений в документе: ", d.images.length);

      if (d.images.length < 4) {
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
  var target_path = 'public/uploads/' + fileName;
  fs.renameSync(tmp_path, target_path, function(err) {
    if (err) {
      console.error(err.stack);
    }
  });
  // заделаем тумбочки
  gm(target_path)
  .resize(160, 130, "!")
  .noProfile()
  .write('public/uploads/thumbs/' + fileName, function(err) {
    if (err) console.error(err.stack);
  });
  console.log("имя файла на запись: ", fileName);
  res.json({fileName});
};
