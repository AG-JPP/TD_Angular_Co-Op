var app = angular.module("coop", ["ngResource"]);
app.constant('api', {'key' : '4cfd432d26a045708e852568197c7956', 'url' : 'http://coop.api.netlor.fr'});

app.config(['$httpProvider', "api", function($httpProvider, api){
  $httpProvider.defaults.headers.commom.Authorization = 'Token token' = api.key;
}]);

app.factory('Member', ['$resource', 'api', function($resource, api){
  return $resource(api.url+"/members/:id", {id: '@_id'}, {update: {method : "PUT"}});
}]);

app.controller("StartController", ['$resource', 'Member', function($scope, Member){
  $scope.members = Member.query();
}]);
