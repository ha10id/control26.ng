var user = require('./api.login.js');

exports.loadUser = function(req, res, next) {
	console.log('-----loaduser--------');
	console.log(req.headers);
	console.log('---------------------');
	console.log(req.session);
	next();
	// if (req.session.authorized) {
	// 	next();
	// } else {
		// res.redirect('/login')
		// user.login();
		// req.session.user_id = "guest";
		// req.session.authorized = true;
		// next();
	// }
}
