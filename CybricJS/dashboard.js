var app = angular.module('CybricApp', ["ngCookies"]);
app.controller('Dashb', function ($rootScope, $scope, $http, $cookies, $filter, $location) {

    var token = $cookies.get("AuthKey");
    var nusername = $cookies.get("nickname");
    var picture = $cookies.get("picture");
    var userrole = $cookies.get("userrole");

    $scope.nickname = nusername;
    $scope.picture = picture;
    $scope.Authorization = token;
    $http.defaults.headers.common.Authorization = token;
    $scope.CodeScans = [];
    $scope.AppScans = [];

    $scope.cmbViewDays = "3";   // Deafult is seeing scans for the last 3 days

    $scope.menutitle = "FabricHUB";

    // get a list of active scenarios
    $http.get($cookies.get("PlatForm") + '/v1/scenarios')
      .success(function (scenario_data) {
          $scope.scenarios = scenario_data[0];
          // $scope.scenarios = $filter('filter')($scope.scenarios, { integrationType: ScenariosType });
          // $scope.scenarios = $filter('filter')($scope.scenarios, { isEnabled: true });
      })
      .error(function (data) {
          $("#alert-error").show().find(".msg").text("Error getting Scenarios [" + scenario_data.errors + "]");
      });


    // get the latest jobs of PolicyRun type
    $http.get($cookies.get("PlatForm") + '/v1/jobs?type=policyRun&limit=50')
      .success(function (data) {
          $scope.Joblist = data[0];
          for (x = 0; x < $scope.Joblist.length ; x++)
          {
              $scope.getJobDetails(x);
          }
      })
      .error(function (data) {
          $("#alert-error").show().find(".msg").text("Failed getting Scans");
      });


      $scope.getJobDetails = function(jobIndex)
      {
        // for the job, get the associated Policy and Issues
          var pid = $scope.Joblist[jobIndex].policyId;
          var jobId = $scope.Joblist[jobIndex].id;

          // Policy Information first
          $http.get($cookies.get("PlatForm") + '/v1/policies/' + pid)
            .success(function (policy_data) {
                $scope.Joblist[jobIndex].policy = policy_data[0];

                // extract the scenario name as a string
                var res = JSON.stringify($scope.Joblist[jobIndex].policy.scenarios[0]);
                var ressplit = res.split(":");
                var resscenario = ressplit[0].replace("{", "").replace("}", "").replace(/['"]+/g, '');
                $scope.Joblist[jobIndex].policy.scenarioName = resscenario;

                // figure out the scenario type
                $scope.Joblist[jobIndex].policy.scenarioType = $filter('filter')($scope.scenarios, { name: resscenario })[0].integrationType;
                $scope.Joblist[jobIndex].policy.scenarioDescription = $filter('filter')($scope.scenarios, { name: resscenario })[0].description;


                // for (s = 0; s < $scope.scenarios.length; s++)
                // {
                //     if ($scope.scenarios[s].name == resscenario)
                //         $scope.Joblist[jobIndex].policy.scenarioType = $scope.scenarios[s].integrationType;
                // }

                // flag the Scan as Code vs. Application
                $scope.Joblist[jobIndex].isApplicationScan = ($scope.Joblist[jobIndex].policy.scenarioType == "instance");
                $scope.Joblist[jobIndex].isCodeScan = ($scope.Joblist[jobIndex].policy.scenarioType == "repository" || $scope.Joblist[jobIndex].policy.scenarioType == "build");
            })
            .error(function (policy_data) {
                $("#alert-error").show().find(".msg").text("Error getting Policies [" + policy_data.errors + "]");
            });

            // Get List of Issues
            $http.get($cookies.get("PlatForm") + '/v1/issues?jobId=' + jobId)
               .success(function (issues_data) {
                    $scope.Joblist[jobIndex].issues = issues_data[0];
              })
             .error(function (issues_data) {
                 $("#alert-error").show().find(".msg").text("Failed getting issues for Run [" + jobid + "]");
             });

      }


      // To Open Duplicate Policy popup screen
      $scope.popupopen = function (plid, Pname) {
          window.location.href = "AddPolicy.html#?Pid=" + plid;
      };


      $scope.RunPolicyJob = function (pId, pName) {

          var urlmethod = "";
          urlmethod = $cookies.get("PlatForm") + "/v1/policies/" + pId + "/run";

          $http({
              method: 'POST',
              url: urlmethod
          }).success(function (data, status) {
              $scope.jobId = data.jobId;
              $("#alert-success").show().find(".msg").text("Policy Job Started for [" + pName + "]");

          }).error(function (data, status) {
              $("#alert-error").show().find(".msg").text("Policy Job Failed for [" + pName + "]");
          });
      };



      $(document).ready(function(){
          $('[data-toggle="popover"]').popover();
      });

      // $scope.$on('$viewContentLoading', function(event, viewConfig)
      // {
      //     document.getElementById("fixedHeader1").style.position = "";
      //     console.log("un-fixing header position");
      // });
      //
      // $scope.$on('$viewContentLoaded', function(event)
      // {
      //     document.getElementById("fixedHeader1").style.position = "fixed";
      //     console.log("fixing header position");
      //  });

});



// app.filter('removeChar', function () {
//     return function (items) {
//
//         var res = JSON.stringify(items[0]);
//         var ressplit = res.split(":");
//         var resscenario = ressplit[0].replace("{", "").replace("}", "").replace(/['"]+/g, '');
//         if (resscenario != "undefined") {
//             return resscenario;
//         }
//     }
//   });
