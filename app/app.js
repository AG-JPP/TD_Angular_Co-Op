var app = angular.module("coop", ["ngResource"]);
app.constant('api', {'key' : '4cfd432d26a045708e852568197c7956', 'url' : 'http://coop.api.netlor.fr/api'});

app.config(['$httpProvider', "api", function($httpProvider, api){
  $httpProvider.defaults.headers.common.Authorization = 'Token token=' + api.key;
}]);

app.factory('Member', ['$resource', 'api', function($resource, api){
  return $resource(api.url+"/members/:id", {id: '@_id'}, {update: {method : "PUT"}});
}]);

app.controller("StartController", ['$resource', 'Member', function($scope, Member){
  $scope.newMember = new Member({
    fullname: "zbeub",
    email : "zbeub@coop.fr",
    password : "zbeub"
  });

  $scope.newMember.$save(function(successs){
    console.log(successs);
  },
  function(error){
    console.log(error);
  }
);

  $scope.members = Member.query(function(m){
    console.log(m);
  },
  function(error){
    console.log(error);
  }
);
}]);
