// модуль api.goverments экспортирует функции API для работы с сущностью "Органы власти"
// grab the document model we just created
var User     = require('./models/User.js');
var Document = require('./models/Document.js');
var Category = require('./models/Category.js');
var Goverment = require('./models/Goverment.js');

//========================================================
// Goverments
// список ОГВ -
exports.list = function (req, res) {
  'use strict';
  Goverment.find(function(err, goverments) {
    if (err) {
      res.send(err);
    }
    goverments = goverments.map(function(data) {
      return {
        id: data.id,
        worker: data._worker,
        name: data.name
      };
    });
      res.json(goverments); // return all users in JSON format
    }).sort({name: 1});
};
// возвращает одну записть по её ID
exports.get = function (req, res) {
  'use strict';
  var id = req.params.id;
  console.log('api get goverment :', id);
  Goverment.findOne({ _id : id }, function(err, goverment) {
    if (err) {
      res.send(err);
    }
    res.json(goverment); // return document in JSON format
  });
};