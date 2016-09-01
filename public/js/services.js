/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource'])
	.value('version', '0.1')
	/// Фабрика объекта "Категории"
	.factory('Categories', function($resource){
    	return $resource('api/categories/:id', {});
  	});
