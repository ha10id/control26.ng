// модуль api.users экспортирует функции API для работы с сущностью "Пользователь"
// grab the document model we just created
var User     = require('./models/User.js');
var Document = require('./models/Document.js');
var Category = require('./models/Category.js');
var Goverment = require('./models/Goverment.js');

//========================================================
// Users
// список пользователей -
exports.list = function (req, res) {
  'use strict';
  if (req.session.authorized) {
    User.find(function(err, users) {
      if (err) {
        res.send(err);
      }
      users = users.map(function(data) {
        return {
          id: data.id,
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          email: data.email,
          group: data.group,
          uid: data.uid,
          regdate: data.regdate
        };
      });
        res.json(users); // return all users in JSON format
      }).sort({lastName: 1});
  } else {
    res.sendStatus(401); // не авторизован
  }
};
// возвращает одну записть по её ID
exports.get = function (req, res) {
  'use strict';
  if (req.session.authorized) {
    var id = req.params.id;
    console.log('api get user :', id);
    User.findOne({ _id : id }, function(err, user) {
      if (err) {
        res.send(err);
      }
      res.json(user); // return document in JSON format
    });
  } else {
    res.sendStatus(401); // не авторизован
  }    
};
