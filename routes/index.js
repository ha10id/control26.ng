/*
 * GET home page.
 */
exports.index = function(req, res){
	var user = {
		_id: "57a98bfc9204b1760f00005f",
		group: 3,
		email: "achiduzu@gmail.com", 
		name: "Сигизмунд Петрович Кац"
	};
	req.session.currentUser = user;
	req.session.authorized = true;
	// req.session.isadmin = true;
	req.session.user_id = "57cf16206e4edc261c010422"; // Нурмагомедова
	// req.session.user_id = "57a98bfc9204b1760f00005f"; // Я
	req.session.name = "Сигизмунд Петрович Кац";
	console.log('-------index---------');
	console.log(req.headers);
	console.log('---------------------');
	console.log(req.session);
  	res.render('index');
};

exports.partials = function (req, res) {
	var name = req.params.name;
	res.render('partials/' + name);
};