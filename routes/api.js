var gm              = require('gm');
var fs              = require('fs');
// grab the document model we just created
var Document = require('./models/Document.js');
var Category = require('./models/Category.js');

// initialize our faux database
var data = {
  "posts": [
  {
    "title": "Lorem ipsum",
    "text": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    "title": "Sed egestas",
    "text": "Sed egestas, ante et vulputate volutpat, eros pede semper est, vitae luctus metus libero eu augue. Morbi purus libero, faucibus adipiscing, commodo quis, gravida id, est. Sed lectus."
  }
  ]
};
//========================================================
// Documents
// список документов +
exports.documents = function (req, res) {
  Document.find(function(err, documents) {
      if (err)
        res.send(err);
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
          datestamp: data.datestamp,
          geoObject: data.geoObject
        };
      });
      res.json(documents); // return all documents in JSON format
    }).sort({datestamp: -1});
};
// get one +
exports.document = function (req, res) {
  var id = req.params.id;
  console.log("-----------------------------------------");
  console.log('api get document :', id);
  Document.findOne({ _id : id }, function(err, document) {
    if (err)
      res.send(err);
    console.log(document);
    res.json(document); // return one document in JSON format
  }).populate("_comments");
};
// POST
exports.addDocument = function (req, res) {
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
    if (err)
      res.send(err);
    res.json(data);
  });
};
// put document (update) +50%
exports.editDocument = function (req, res) {
  var id = req.params.id;
  console.log("-----------------------------------------");
  console.log("обновление документа: ", id, "\n");
  console.dir(req.body);
  Document.findOne({ _id : id }, function(err, document) {
    if (err)
      res.send(false);
    // изменяем поля
    document.title = req.body.title;
    document.description = req.body.description;
    document.category = req.body.category;
    document.longitude = req.body.longitude;
    document.latitude = req.body.latitude;
    document.address = req.body.address;
    // сохраняем отредактированный документ
    document.save(function(err) {
      if (err)
       res.send(false);
    res.json(true);
    });
  });
};
//========================================================
// Categories
// get all +
exports.categories = function (req, res) {
    console.log('api get categories', req.params);
    Category.find(function(err, categories) {
      if (err)
        res.send(err);
      res.json(categories); // return all categories in JSON format
    });
};
// get one +
exports.category = function (req, res) {
  var id = req.params.id;
  console.log('api get category :', id);
  Category.findOne({ _id : id }, function(err, category) {
    if (err)
      res.send(err);
    res.json(category); // return document in JSON format
  });
};
//========================================================
// загрузка картинок
exports.imageUpload = function (req, res, next) {
  var file = req.files.file;
  console.log(file.name); //original name (ie: sunset.png)
  console.log(file.path); //tmp path (ie: /tmp/12345-xyaz.png)
  console.log(file.type); //tmp path (ie: /tmp/12345-xyaz.png)
  console.log(req.body.document_id);
  var tmp_path = file.path;
  var target_path = 'public/uploads/' + file.name;
        fs.renameSync(tmp_path, target_path, function(err) {
            if (err) console.error(err.stack);
        });
        // заделаем тумбочки
        gm(target_path)
            .resize(160, 130, "!")
            .noProfile()
            .write('public/uploads/thumbs/' + file.name, function(err) {
                if (err) console.error(err.stack);
            });
        // ищем текущий документ чтобы записать в него адрес фотки
        Document.findOne({ _id: req.body.document_id }, function(err, d) {
            if (!d) return next(new NotFound('Document not found'));
            d.images.push(file.name);
            d.save();
            // console.log(d.images);
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