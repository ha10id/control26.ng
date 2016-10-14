var user = require('./api.login.js');

exports.loadUser = function(req, res, next) {
	// console.log('--loaduser.header---------');
	// console.log(req.headers);
	// console.log('--loaduser.session--------');
	// console.log(req.session);
	next();
}
