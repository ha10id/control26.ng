/* Services */

angular.module('myApp.services', ['ngResource'])
// Demonstrate how to register services
// In this case it is a simple value service.
.value('version', '0.1')
// Фабрика объекта "Категории"
.factory('Categories', function($resource){
	return $resource('api/categories/:id', null, {
		'update': { method:'PUT'}
	});
})
.factory('Goverments', function($resource){
	return $resource('api/goverments/:id', null, {
		'update': { method:'PUT'}
	});
})
.factory('Documents', function($resource){
	return $resource('api/documents/:id', null, {
		'update': { method:'PUT'}
	});
})
.factory('myDocuments', function($resource){
	return $resource('api/mydocuments/:id', null, {
		'update': { method:'PUT'}
	});
})
.factory('Users', function($resource){
	return $resource('api/users/:id', null, {
		'update': { method:'PUT'}
	});
});
angular.module('auth', [ngCookies])
.service('AuthService', function($cookies) {
	'use strict';

	var self = this;
	this.status = {
		authorized: false,
	};
	this.loginIs = function(user) {
		var user = {
			ID: "57cf16206e4edc261c010422",
			name: 'Anthonio Banderas',
			group: 3
		}
		return user;
	};

	// this.loginByCredentials = function(username, password) {
	// 	return Restangular.all('sessions').post({ email: username, password: password })
	// 	.then(function(response) {
	// 		return self.loginByToken(response.contents);
	// 	});
	// };

	// this.loginByToken = function(token) {
	// 	$http.defaults.headers.common['X-Token'] = token;

	// 	return Restangular.all('sessions').get(token)
	// 	.then(function(response) {
	// 		$cookies.accessToken = token;
	// 		self.status.authorized = true;
	// 		return response;
	// 	});
	// };

	// this.logout = function() {
	// 	self.status.authorized = false;
	// 	$cookies.accessToken = '';

	// 	Restangular.all('sessions').remove();
	// };
});