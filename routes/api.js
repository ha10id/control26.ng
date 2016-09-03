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
// get all +
exports.documents = function (req, res) {
  // var documents = [];
  Document.find(function(err, documents) {
      // if there is an error retrieving, send the error. nothing after res.send(err) will execute
      if (err)
        res.send(err);
      documents = documents.map(function(d) {
        return {
          id: d.id,
          title: d.title,
          address: d.address,
          latitude: d.latitude,
          longitude: d.longitude,
          description: d.description,
          status: d.status,
          geoObject: {geometry: {type: "Point",coordinates: [d.longitude, d.latitude]}, properties: {hintContent:  d.title, balloonContent: '<a href="/readDocument/' + d.id +'">' + d.title + '</a>' + '<p>' + d.description + '</p>' }}
      }});
      res.json(documents); // return all documents in JSON format
    }).sort({datestamp: -1});
};
// get one +
exports.document = function (req, res) {
  var id = req.params.id;
  Document.findOne({ _id : id }, function(err, document) {
    if (err)
      res.send(err);
    res.json(document); // return document in JSON format
  }).populate("_comments");
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