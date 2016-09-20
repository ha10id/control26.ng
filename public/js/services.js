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
.factory('Users', function($resource){
	return $resource('api/users/:id', null, {
		'update': { method:'PUT'}
	});
});