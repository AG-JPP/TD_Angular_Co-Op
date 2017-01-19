var app = angular.module("coop", ["ngResource", 'ngRoute']);
app.constant('api', {'key': '4cfd432d26a045708e852568197c7956', 'url': 'http://coop.api.netlor.fr/api'});

app.config(['$httpProvider', "api", 'TokenServiceProvider', function ($httpProvider, api, TokenServiceProvider) {
    $httpProvider.defaults.headers.common.Authorization = 'Token token=' + api.key;

    $httpProvider.interceptors.push(['TokenService', function (TokenService) {
        return {
            request: function (config) {
                var token = TokenService.getToken();
                if (token != "")
                    config.url += ((config.url.indexOf('?') >= 0) ? '&' : '?') + 'token=' + token;
                return config;
            }
        }
    }])
}]);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'templates/login.html',
        controller: 'StartController'
    });

    $routeProvider.when('/channel/:id', {
        templateUrl: 'templates/channel.html',
        controller: 'postController'
    });

    $routeProvider.when('/channels', {
        templateUrl: 'templates/channels.html',
        controller: 'channelsController'
    });

    $routeProvider.when('/register', {
        templateUrl: 'templates/register.html',
        controller: 'registerController'
    });
}]);

app.run(['$rootScope', '$location', 'Member', 'TokenService', 'MemberService', function ($rootScope, $location, Member, TokenService, MemberService) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (localStorage.getItem('token') != null) {
            TokenService.setToken(localStorage.getItem('token'));
            Member.signedin({id: localStorage.getItem('id')}, function (m) {
              MemberService.addMembers();
            }, function (error) {
                TokenService.setToken("");
                localStorage.clear();
                $location.path("/");
            });
        } else {
            if (localStorage.getItem('token') == null) {
                $location.path("/")
            } else {
                TokenService.setToken(localStorage.getItem('token'));
                Member.signedin({id: localStorage.getItem('id')}, function (m) {
                }, function (error) {
                    TokenService.setToken("");
                    localStorage.clear();
                    $location.path("/");
                });
            }
        }
    });
}]);


app.factory('Member', ['$resource', 'api', function ($resource, api) {
    return $resource(api.url + "/members/:id", {id: '@_id'},
        {
            update: {method: "PUT"},
            signin: {method: "POST", url: api.url + "/members/signin"},
            signedin: {method: 'GET', url: api.url + '/members/:id/signedin'}
        });
}]);

app.factory('Channels', ['$resource', 'api', function ($resource, api) {
    return $resource(api.url + "/channels/:id", {id: "@_id"},
        {
            delete: {method: "DELETE", url: api.url + "/channels/:id"}
        });
}]);

app.factory('Post', ['$resource', 'api', function ($resource, api) {
    return $resource(api.url + "/channels/:id/posts", {id: "@_id"},
        {})
}]);

app.service('TokenService', [function () {
    this.token = "";
    this.setToken = function (t) {
        this.token = t;
    }
    this.getToken = function () {
        return this.token;
    }
}]);

app.service('MemberService', ['Member', function(Member){
    this.members = [];

    this.getMembers = function(){
      return this.members;
    }

    this.findOne = function(id){
      this.members.forEach(function(e){
        if(e._id == id){
          return e;
        }
      });
    }

    this.addMembers = function(){
      this.members = Member.query(function(success){}, function(error){});
    }
}]);


app.controller("StartController", ["$scope", "$location", 'Member', 'TokenService', "MemberService", function ($scope, $location, Member, TokenService, MemberService) {

    $scope.members = Member.query(function (m) {
            console.log(m);
        },
        function (error) {
            console.log(error);
        }
    );

    $scope.redirectRegister = function () {
        $location.path('/register');
        $location.replace();
    }

    // $scope.ajoutMembre = function(){
    //   $scope.newMember = new Member({
    //       fullname: $scope.member.fullname,
    //       email:  $scope.member.email,
    //       password: $scope.member.pass,
    //   });
    //   $scope.newMember.$save(function(success){
    //     console.log(success);
    //    },
    //      function(error){
    //      console.log(error);
    //    }
    //   );
    // }

    $scope.loginMembre = function () {
        $scope.member = Member.signin({
                email: $scope.member.email,
                password: $scope.member.pass,
            },
            function (m) {
                $scope.member = m;
                console.log($scope.member);
                TokenService.setToken($scope.member.token);
                localStorage.setItem("token", TokenService.getToken());
                localStorage.setItem("id", $scope.member._id);
                $scope.member = Member.query(function (member) {
                });
                $location.path('/channels');
                $location.replace();
            },
            function (e) {
                console.log(e);
            }
        )
    }

}]);

app.controller('registerController', ['$scope', 'Member', function ($scope, Member) {

    $scope.ajoutMembre = function () {
        $scope.newMember = new Member({
            fullname: $scope.member.fullname,
            email: $scope.member.email,
            password: $scope.member.pass,
        });
        $scope.newMember.$save(function (success) {
                console.log(success);
            },
            function (error) {
                console.log(error);
            }
        );
    }

}]);

app.controller('channelsController', ['$scope', 'Channels', '$location', function ($scope, Channels, $location) {
    $scope.channels = Channels.query(
        function (success) {

        },
        function (error) {
            console.log(error);
        });

    $scope.createChannel = function () {
        $scope.newChannel = new Channels({
            label: $scope.channel.label,
            topic: $scope.channel.topic
        });
        $scope.newChannel.$save(function (success) {

            },
            function (error) {
                console.log(error);
            });
    };

    $scope.findOne = function (idChan) {
        $location.path("/channel/" + idChan);
        $location.replace();
    }
}]);

app.controller('postController', ['$scope', 'Post', '$location', 'MemberService', function ($scope, Post, $location, MemberService) {
    var id = $location.url().split('/');
    id = id[id.length - 1];
    $scope.posts = Post.query({id: id},
      function (success) {
        success.forEach(function(e){
          var members = MemberService.getMembers();
          members.$promise.then(function(success){
            console.log(success);
            e.fullname = MemberService.findOne(e.member_id).fullname;
            e.email = MemberService.findOne(e.member_id).email;
          });
          // e.fullname = MemberService.findOne(e.member_id).fullname;
          // e.email = MemberService.findOne(e.member_id).email;
          console.log(e);
        });
    }, function (error) {
        console.log(error);
    })
}]);
