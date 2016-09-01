/* Filters */

angular.module('myApp.filters', [])
.filter('interpolate', function (version) {
	return function (text) {
		return String(text).replace(/\%VERSION\%/mg, version);
	};
})
.filter('startFrom', function() {
	return function(input, start) {
		if (!input || !input.length) { return; }
    	start = +start; //parse to int
    	return input.slice(start);
    };
});
