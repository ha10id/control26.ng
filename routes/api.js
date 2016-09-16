var gm              = require('gm');
var fs              = require('fs');

// grab the document model we just created
var Document = require('./models/Document.js');
var Category = require('./models/Category.js');

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
exports.documents = function (req, res) {
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
// get one +
exports.document = function (req, res) {
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
// POST
exports.addDocument = function (req, res) {
  'use strict';
  // data.posts.push(req.body);
  console.log("-----------------------------------------");
  console.log("создание документа: \n");
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
};
// put document (update) +50%
exports.editDocument = function (req, res) {
  'use strict';
  var id = req.params.id;
  console.log("-----------------------------------------");
  console.log("обновление документа: ", id, "\n");
  console.dir(req.body);
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
    // сохраняем отредактированный документ
    document.save(function(err) {
      if (err) {
       res.send(false);
     }
     res.json(true);
   });
  });
};
//========================================================
// Categories
// get all +
exports.categories = function (req, res) {
  'use strict';
  console.log("-----------------------------------------");
  console.log('api get categories', req.params);
  Category.find(function(err, categories) {
    if (err) {
      res.send(err);
    }
    res.json(categories); // return all categories in JSON format
  });
};
// get one +
exports.category = function (req, res) {
  var id = req.params.id;
  console.log('api get category :', id);
  Category.findOne({ _id : id }, function(err, category) {
    if (err) {
      res.send(err);
    }
    res.json(category); // return document in JSON format
  });
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
//========================================================
// GET
exports.posts = function (req, res) {
  var posts = [];
  data.posts.forEach(function (post, i) {
    posts.push({
      id: i,
      title: post.title,
      text: post.text.substr(0, 50) + '...'
    });
  });
  res.json({
    posts: posts
  });
};
// GET ONE
exports.post = function (req, res) {
  var id = req.params.id;
  if (id >= 0 && id < data.posts.length) {
    res.json({
      post: data.posts[id]
    });
  } else {
    res.json(false);
  }
};
// POST
exports.addPost = function (req, res) {
  data.posts.push(req.body);
  res.json(req.body);
};
// PUT
exports.editPost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts[id] = req.body;
    res.json(true);
  } else {
    res.json(false);
  }
};

// DELETE
exports.deletePost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts.splice(id, 1);
    res.json(true);
  } else {
    res.json(false);
  }
};