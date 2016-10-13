/*
 * GET home page.
 */
exports.index = function(req, res){
	// req.session.authorized = true;
	// req.session.isAdmin = true;
	// req.session.user_id = "57cf16206e4edc261c010422";
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