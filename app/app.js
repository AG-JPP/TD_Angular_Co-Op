var app = angular.module("coop", ["ngResource"]);
app.constant('api', {'key': '4cfd432d26a045708e852568197c7956', 'url': 'http://coop.api.netlor.fr/api'});

app.config(['$httpProvider', "api", 'TokenServiceProvider',  function ($httpProvider, api, TokenServiceProvider) {
    $httpProvider.defaults.headers.common.Authorization = 'Token token=' + api.key;

    $httpProvider.interceptors.push(['TokenService', function(TokenService) {
        return {
            request: function(config){
                var token = TokenService.getToken();
                if (token != "" )
                    config.url += ((config.url.indexOf('?') >=0) ? '&' : '?') + 'token=' + token;
                return config;
            }
        }
    }])
}]);

app.factory('Member', ['$resource', 'api', function ($resource, api) {
    return $resource(api.url + "/members/:id", {id: '@_id'},
        {
            update: {method: "PUT"},
            signin: {method: "POST", url: api.url + "/members/signin"}
        });
}]);

app.service('TokenService', [function() {
    this.token = "";
    this.setToken = function(t) {
        this.token = t;
    }
    this.getToken = function() {
        return this.token;
    }
}]);


app.controller("StartController", ['$resource', "$scope", 'Member', 'TokenService', function ($resource, $scope, Member, TokenService) {
    // $scope.newMember = new Member({
    //     fullname: "zbeub",
    //     email: "zbeub@coop.fr",
    //     password: "zbeub"
    // });
    /*  $scope.newMember.$save(function(successs){
     console.log(successs);
     },
     function(error){
     console.log(error);
     }
     );*/

    $scope.member = Member.signin({
            email: 'toto3@coop.fr',
            password: 'toto',
        },
        function (m) {
            $scope.member = m;
            console.log($scope.member);
            TokenService.setToken($scope.member.token);
            $scope.member = Member.query(function(member) {

            })
        },
        function (e) {
            console.log(e);
        });

    // $scope.member = Member.save({
    //     fullname: "TOTO",
    //     email: "toto3@coop.fr",
    //     password: 'toto'
    // }, function (m) {
    //     console.log($scope.member);
    // }, function (e) {
    //     console.log($scope.newMember);
    // });


    $scope.members = Member.query(function (m) {
            console.log(m);
        },
        function (error) {
            console.log(error);
        }
    );

    $scope.ajoutMembre = function(){
      $scope.newMember = new Member({
          fullname: $scope.member.fullname,
          email:  $scope.member.email,
          password: $scope.member.pass,
      });
      $scope.newMember.$save(function(success){
        console.log(success);
       },
         function(error){
         console.log(error);
       }
      );
    }

    $scope.loginMembre = function(){
      $scope.member = Member.singin({
        email : $scope.member.email,
        pass : $scope.member.pass,
      },
      function (m) {
          $scope.member = m;
          console.log($scope.member);
          TokenService.setToken($scope.member.token);
          $scope.member = Member.query(function(member) {

          })
      },
      function (e) {
          console.log(e);
      }
  )}

}]);
