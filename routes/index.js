// GET main page.
exports.index = function(req, res){
  	res.render('index');
};
// GET partials pages
exports.partials = function (req, res) {
	var name = req.params.name;
	res.render('partials/' + name);
};