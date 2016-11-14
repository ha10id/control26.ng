// api.statistics.js
var User     = require('./models/User.js');
var Document = require('./models/Document.js');
var Category = require('./models/Category.js');
var Goverment = require('./models/Goverment.js');
var Statistic = require('./models/Statistic.js');

//========================================================
// Documents
// список документов +
function categoryList(callback) {
	'use strict';
	Category.find((err, categories) => {
		if (err) {
			res.send(err);
		}
		categories = categories.map((data) => {
			return {
				id: data.id,
				name: data.name,
			};
		});
		callback(categories);
	}).sort({name: 1});
};

function authorList(callback) {
	'use strict';
	Category.find((err, categories) => {
		if (err) {
			res.send(err);
		}
		categories = categories.map((data) => {
			return {
				id: data.id,
				name: data.name,
			};
		});
		callback(categories);
	}).sort({name: 1});
};

exports.listByAuthors = function (req, res) {
	'use strict';
	console.log('-------------------------------------');
	console.log('start: ', req.params.sdt);
	console.log('end:   ', req.params.edt);


};

exports.listByCategory = function (req, res) {
	'use strict';
	// var result = [];
	// var countByCategories = [];
	// var row = [];
	console.log('-------------------------------------');
	console.log('start: ', req.params.sdt);
	console.log('end:   ', req.params.edt);
	Statistic.remove().exec();
	var status = [{id:0, name: "новых"},{id:1, name: "в работе"},{id:2, name: "завершено"},{id:3, name: "всего"}];
	console.log('list');
	categoryList((categories) => {
		categories.forEach((item,i,arr) => {
			var statistic = new Statistic({'category': item.id,'name': item.name, 'open': 0, 'work': 0, 'close': 0, 'all': 0});
			statistic.save();
			status.forEach((stat) => {
				if (stat.id == 3) {
					var filter = {category: item.id, datestamp: { $gte:req.params.sdt, $lte: req.params.edt}};
				} else {
					var filter = {category: item.id, status: stat.id, datestamp: { $gte:req.params.sdt, $lte: req.params.edt}};
				};
				Document.find(filter, (err, data) => {
					//console.log(data, err);
					Statistic.findOne({'category': item.id}, (err, StatDbItem) => {
						var name = '"' + stat.name +'"';
						if (data) {
							console.log(item.name, stat.name, data.length);
							var counter =  data.length;
						} else {
							console.log(item.name, stat.name, '0');
							var counter =  0;
						}
						switch (stat.id) {
							case 0:
							StatDbItem.open = counter;
							break
							case 1:
							StatDbItem.work = counter;
							break
							case 2:
							StatDbItem.close = counter;
							break
							case 3:
							StatDbItem.all = counter;
							break
						}
						// console.log(StatDbItem);
						StatDbItem.save();
					});
				});
			});
		});
	});
	res.json(true);
};

exports.listGet = function (req, res) {
	'use strict';
	Statistic.find((err, result) => {
		result = result.map((data) => {
			return {
				'категория': data.name,
				'новых': data.open,
				'в работе': data.work,
				'завершено': data.close,
				'всего': data.all
			};
		});
		res.json(result);
	});
};
