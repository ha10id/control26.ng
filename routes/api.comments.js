var Comment = require('./models/Comment.js');
var Document = require('./models/Document.js');

exports.add = function (req, res) {
  'use strict';
  // data.posts.push(req.body);
    console.log("-----------------------------------------");
    console.log("создание комментария: \n");

	if (req.session.authorized) {
		// заполняем поля статуса и даты создания документа
		// req.body.status = 0;
		req.body._creator = req.session.currentUser._id;
		req.body.datestamp = new Date();
		// новый объект
		var newComment = new Comment(req.body);
		// пробуем записать
		// console.log(newComment);
		newComment.save(function(err) {
			console.log(newComment);
			var data = newComment.toObject();
			data.id = data._id;
			Document.findOne({ _id: req.body._document }, function(err, d) {
			if (!d) return next(new NotFound('Document not found'));
			    d._comments.push(data.id);
			    d.save();
			});
			if (err) {
				res.send(err);
			}

		   	res.json(data);
		});
	} else {
		res.sendStatus(401);
	}
};