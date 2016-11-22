var app = angular.module('CybricApp', ["ngCookies"]);
app.controller('ChangePwdCtrlr', function ($scope, $http, $cookies) {

  var token = $cookies.get("AuthKey")
  var nusername = $cookies.get("nickname");
  var picture = $cookies.get("picture");
  $scope.nickname = nusername;
  $scope.picture = picture;

  $scope.Authorization = token;

  console.log($scope.nickname);

});
