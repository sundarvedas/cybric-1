var app = angular.module('CybricApp', ["ngCookies"]);
app.controller('Environlst', function ($scope, $http, $cookies) {

    var token = $cookies.get("AuthKey")

    var nusername = $cookies.get("nickname");
    var picture = $cookies.get("picture");
    var custid = $cookies.get("customerid");
    var userrole = $cookies.get("userrole");

    $scope.nickname = nusername;
    $scope.picture = picture;
    $scope.Providerdisable = false;

    $scope.menutitle = "FabricSRV";

    $http.defaults.headers.common.Authorization = token;
    $http.get($cookies.get("PlatForm") + '/v1/environments?limit=1000')
      .success(function (data) {
          $scope.Environlist = data[0];

          for (i = 0; i < $scope.Environlist.length; i++)
            {
                $scope.Environlist[i].events = [];
                $scope.environmentEvents($scope.Environlist[i].id);
            }
      })
      .error(function (data) {
          $("#alert-error").show().find(".msg").text("Error getting Integrations [" + data.errors + "]");
      });

      $scope.environmentEvents = function (eid) {
        $http.defaults.headers.common.Authorization = token;
        $scope.Authorization = token;
        for (k = 0; k < $scope.Environlist.length; k++)
          {
              if ($scope.Environlist[k].id == eid)
              {
                var foundElement = k;

                // Get the data
                $http.get($cookies.get("PlatForm") + '/v1/events?environment.id=' + eid)
                  .success(function (data) {
                      $scope.Environlist[foundElement].events = data[0];
                      if (data.length > 0)
                        console.log("Got data for: ", $scope.Environlist[foundElement].name);
                  })
                  .error(function (data) {
                      $("#alert-error").show().find(".msg").text("Error getting Events [" + data + "]");
                  });

                }

            }
      };
});
