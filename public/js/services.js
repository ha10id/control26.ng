/* Services */

angular.module('myApp.services', ['ngResource'])
// Demonstrate how to register services
// In this case it is a simple value service.
.value('version', '0.1')
// Фабрика объекта "Категории"
.factory('Categories', function($resource){
	return $resource('api/categories/:id', {});
});
