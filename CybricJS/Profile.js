var app = angular.module('CybricApp', ["ngCookies"]);
app.controller('ProfileCtrlr', function ($scope, $http, $cookies) {


    var token = $cookies.get("AuthKey")
    var userrole = $cookies.get("userrole");
    var nusername = $cookies.get("nickname");
    var picture = $cookies.get("picture");
    var email = $cookies.get("email");

    $scope.nickname = nusername;
    $scope.picture = picture;
    $scope.email = email;

    // To display the div based on user role
    // if (userrole == "user") {
    //     document.getElementById("cmbFabricSRV").style.display = "none";
    // }

    if (userrole == "user") {
        $scope.FabricUserrole = {
            "display": "none"
        }
    }

    $scope.ChangePassword = function () {
        window.location.href = "ChangePassword.html"
    };



});
