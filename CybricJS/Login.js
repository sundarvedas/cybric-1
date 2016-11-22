var app = angular.module('CybricApp', ["ngCookies"]);
app.controller('LoginCtrlr', function ($scope, $http, $cookies) {

     var cookies = $cookies.getAll();
     angular.forEach(cookies, function (v, k) {
        $cookies.remove(k);
    });

    // Set the default values to controls
        $scope.btnsubmit = 'Log In';

        $scope.username = '';
        $scope.password = '';
        $scope.cmbPlatForm = "https://api.dev.cybric.us";

        $scope.loginsubmit = function () {
            $scope.btnsubmit = 'Logging In...';

        var urlplatform=$scope.cmbPlatForm;
        var uname = $scope.username;
        var pwd = $scope.password;

        $cookies.put("PlatForm", urlplatform);
        var adde = {};
        adde = {
            username: uname,
            password: pwd
        };

        $http({
            method: 'POST',
            url: $cookies.get("PlatForm") + '/v1/accounts/authorize',
            async: true,
            data: adde
        }).success(function (data, status, headers, config) {

            var token = data.id_token;
            //localStorage.setItem("AuthKey", token);
            $cookies.put("AuthKey", token);
            getClientInfo(token);


        }).error(function (data, status, headers, config) {
            document.getElementById("alert-error").style.display = "block";
            $scope.ErrorMessage = "ACCOUNT LOGIN ERROR" + " | " + data.error.toUpperCase() + " > " + data.message;
            $scope.btnsubmit = 'Log In';

        });

    };

    // Get Client Info
    function getClientInfo(token)
    {

        $http.defaults.headers.common.Authorization = token;
        $http({
            method: 'GET',
            url: $cookies.get("PlatForm") + '/v1/me',

        }).success(function (data, status, headers, config) {

            $scope.Clientlst = data;

            var CustID;
            var UserRole;
            // var customer_data;

            if ($scope.Clientlst.app_metadata.auth !== undefined && $scope.Clientlst.app_metadata.auth.universal[0].customerId !== undefined)
                CustID = $scope.Clientlst.app_metadata.auth.universal[0].customerId;
            if ($scope.Clientlst.app_metadata.auth !== undefined && $scope.Clientlst.app_metadata.auth.universal[0].role !== undefined)
                 UserRole = $scope.Clientlst.app_metadata.auth.universal[0].role;


            $cookies.put("customerid", CustID);
            $cookies.put("userrole", UserRole);

            $cookies.put("nickname", data.nickname);
            $cookies.put("picture", data.picture);
            $cookies.put("email", data.email);

            // always send user to FabricHUB
            //window.location.href = "dashboard.html";

            // always send user to FabricHUB
            if (UserRole != "user")
                window.location.href = "dashboard.html";
            else
                window.location.href = "Policies.html";


        }).error(function (data, status, headers, config) {

          document.getElementById("alert-error").style.display = "block";
          $scope.ErrorMessage = "ACCOUNT LOGIN ERROR" + " | " + data.error.toUpperCase() + " > " + data.message;
          $scope.btnsubmit = 'Log In';
        });
    }



});
