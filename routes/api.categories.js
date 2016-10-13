// api.categories
// модели данных
var User     = require('./models/User.js');
var Document = require('./models/Document.js');
var Category = require('./models/Category.js');
var Goverment = require('./models/Goverment.js');
//========================================================
// Categories
// список всех категорий
exports.list = function (req, res) {
  'use strict';
  console.log("-----------------------------------------");
  console.log('api get categories', req.params);
  if (req.session.authorized) {
    Category.find(function(err, categories) {
      if (err) {
        res.send(err);
      }
      res.json(categories); // return all categories in JSON format
    });
  } else {
    res.sendStatus(401); // не авторизован
  }  
};
// возвращает одну записть по её ID
exports.get = function (req, res) {
  'use strict';
  if (req.session.authorized) {
    var id = req.params.id;
    console.log('api get category :', id);
    Category.findOne({ _id : id }, function(err, category) {
      if (err) {
        res.send(err);
      }
      res.json(category); // return document in JSON format
    });
  } else {
    res.sendStatus(401); // не авторизован
  }  
};