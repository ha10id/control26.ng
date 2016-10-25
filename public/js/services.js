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
.factory('Comments', function($resource){
	return $resource('api/comments/:id', null, {
		'update': { method:'PUT'}
	});
})
.factory('myDocuments', function($resource){
	return $resource('api/mydocuments/:id', null, {
		'update': { method:'PUT'}
	});
})
.factory('modDocuments', function($resource){
	return $resource('api/docbymoderator/:id', null, {
		'update': { method:'PUT'}
	});
})
.factory('Users', function($resource){
	return $resource('api/users/:id', null, {
		'update': { method:'PUT'}
	});
})
.service('modalService', ['$uibModal', modalService]);

angular.module('auth', ['ngCookies'])
.service('AuthService', function($cookies, $http, $rootScope) {
	'use strict';

	var self = this;
	this.status = {
		authorized: false,
		admin: false,
		moderator: false,
		token: '',
		user: {}
	};

	this.isAuthorized = function() {
        // console.log(self.status);
 		return self.status.authorized;

    // self.token=data.token;
	//            console.log(session);
	// 		// console.log(data);
	// 		$cookies.putObject('user', self.status.user);
	// 		console.log('---------browser cookies---------');
	// // 		// var brwCookie = $cookies.getAll();
	// 		console.log($cookies.getObject('user'));
	// // 		// console.log(brwCookie);

	// 		console.log('---------loginIs---------');
	// 		console.log(self.status.user);
	// 		return self.status.user;
	};

	this.getStatus = function() {
		return self.status;
	};
	// получаем сессию с сервера и заполняем this.status и $rootScope
	this.getSession = function() {
		$http.get('api/session')
		.success(function(data) {
            console.log('---------get server session---------');
         	self.status.authorized 	= data.authorized;
         	self.status.admin 		= data.isadmin;
         	self.status.moderator 	= data.ismoderator;
         	self.status.user 		= data.currentUser;
	        $rootScope.isAdmin 		= self.status.admin;
	        $rootScope.isModerator  = self.status.moderator;
	        $rootScope.currentUser 	= self.status.user;
	        $rootScope.isAuthorized = self.status.authorized;

	        // console.log('getSession.isAdmin: ', self.status.admin);
	        // console.log('getSession.isModerator: ', self.status.moderator);
	        // console.log('getSession.user: ', self.status.user);
			return data;
		})
	};

	this.setSession = function() {
	    self.status.authorized = false;
	    self.status.user = {};
        console.log('---------put to server session---------');
		$http.put('api/session')
		.success(function(user) {
		    self.status.authorized = true;
		    self.status.user = user;
				console.log('put success');
				return true;
			})
		.error(function(err){
				console.err('put errror');
				return err;
			})
	};
});

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
modalService.$inject = ['$uibModal'];

function modalService($uibModal) {

	var modalDefaults = {
		backdrop: true,
		keyboard: true,
		modalFade: true,
		templateUrl: 'modal/modal.html'
	};

	var modalOptions = {
		closeButtonText: 'Отмена',
		actionButtonText: 'OK',
		headerText: 'Подтверждение',
		bodyText: 'Вы уверены?'
	};

	this.showModal = function (customModalDefaults, customModalOptions) {
		if (!customModalDefaults){
			customModalDefaults = {};
		}
		customModalDefaults.backdrop = 'static';
		return this.show(customModalDefaults, customModalOptions);
	};

	this.show = function (customModalDefaults, customModalOptions) {
		var tempModalDefaults = {};
		var tempModalOptions = {};

		angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

		angular.extend(tempModalOptions, modalOptions, customModalOptions);

		if (!tempModalDefaults.controller) {
		  	tempModalDefaults.controller = ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
		    	$scope.modalOptions = tempModalOptions;
		    	$scope.modalOptions.ok = function (result) {
		    		$uibModalInstance.close(result);
		    	};
		    	$scope.modalOptions.close = function (result) {
		    		$uibModalInstance.dismiss('cancel');
		    	};
		  	}]

			tempModalDefaults.controller.$inject = ['$scope', '$uibModalInstance'];
		}
		return $uibModal.open(tempModalDefaults).result;
	};
};