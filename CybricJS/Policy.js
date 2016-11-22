var app = angular.module('CybricApp', ["ngCookies"]);
app.controller('Policylst', function ($scope, $http, $cookies, $filter)
{

    var token = $cookies.get("AuthKey")
    var nusername = $cookies.get("nickname");
    var picture = $cookies.get("picture");
    var custid = $cookies.get("customerid");
    var userrole = $cookies.get("userrole");

    $scope.nickname = nusername;
    $scope.picture = picture;

    $scope.menutitle = "FabricOPS";

    var restype;
    $http.defaults.headers.common.Authorization = token;
    $scope.Authorization = token;

    var config = {
        headers: {
            'Authorization': $scope.Authorization
        }
    };


    if (userrole == "user") {
        $scope.FabricUserrole = {
            "display": "none"
        }
    }

    // To display the div based on user role
    // if (userrole == "admin") {
    //     document.getElementById("cmbFabricSRV").style.display = "block";
    // }

    // Get Policy Data
    $http.get($cookies.get("PlatForm") + '/v1/policies?limit=1000')
      .success(function (data)
      {
          $scope.Policylist = data[0];

          for (i = 0; i < $scope.Policylist.length; i++) {
            $scope.Policylist[i].runs = [];
            $scope.Policylist[i].gotRuns = false;
            // $scope.Policylist[i].pretty_target = "";

            // for(var t = 0; t < $scope.Policylist[i].targets.length; t++)
            // for(var keys in $scope.Policylist[i].targets[t])
            // {
            //      console.log(keys + ": " + obj.data[t][keys]);
            //      $scope.Policylist[i].pretty_target = $scope.Policylist[i].pretty_target + "<br/>"+ keys +"-->"+obj.data[t][keys];
            // }

          }
      })
      .error(function (data)
      {
          $("#alert-error").show().find(".msg").text("Failed Getting Policy data [" + data.errors + "]");
      });


    //Open Update Policy Screen
    $scope.UpdatePolicy = function(Pid,Pname)
    {
        //   alert(Pid);
        // alert(Pname);
        window.location.href = "AddPolicy.html#?Pid=" + Pid;

    }

    // Getting Run details and show and hide div  - Recent Runs
    $scope.policydetail = function (pid, forceRun) {
      $http.defaults.headers.common.Authorization = token;
      $scope.Authorization = token;

      // var hidePolicy = document.getElementsByClassName('hidePolicyDetail');

        for (i = 0; i < $scope.Policylist.length; i++)
        {
            if ($scope.Policylist[i].id == pid)
            {
              var foundElement = i;

              if (!$scope.Policylist[foundElement].gotRuns || forceRun)
              {

                    // Reset the runs attribute
                    $scope.Policylist[foundElement].runs = [];
                    $scope.Policylist[foundElement].policyRunsMessage = "Getting data...";

                    // console.log("Stat PolicyID = " + pid);

                    // Get the data
                    $http.get($cookies.get("PlatForm") + '/v1/jobs?policyId=' + pid)
                      .success(function (data) {
                          // console.log("i = " + foundElement);
                          $scope.Policylist[foundElement].runs = data[0];
                          if (data.length == 0)
                          {
                              $scope.Policylist[foundElement].policyRunsMessage = "No Policy Runs Found...";
                          }
                          else {
                              $scope.Policylist[foundElement].policyRunsMessage = "";
                              $scope.Policylist[foundElement].gotRuns = true;
                          }
                      })
                      .error(function (data) {
                          $("#alert-error").show().find(".msg").text("Failed getting Jobs for Policy [" + pid + "]");
                      });
                  }
              }
          }


    };

    //Run Now (Run a Policy Job)
    $scope.RunPolicyJob = function (pId, pName) {

        var urlmethod = "";
        urlmethod = $cookies.get("PlatForm") + "/v1/policies/" + pId + "/run";
        $http.defaults.headers.common.Authorization = token;

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


    // Begin Create Duplicate Policy

    // To Open Duplicate popup screen
    $scope.popupopen = function (plid, Pname) {

        $scope.PName = Pname;
        $scope.plid = plid;
        window.location.href = "AddPolicy.html#?Pid=" + plid;

    };

    //To open Issues and Events Popup Screen
    $scope.popupjobissue = function (Polid, jobid, lastupddt) {

        $scope.lastupddt = lastupddt;
        $scope.jobid = jobid;
        $http.defaults.headers.common.Authorization = token;

        for (i = 0; i < $scope.Policylist.length; i++)
        {
            if ($scope.Policylist[i].id == Polid)
            {
                 for (j = 0; j < $scope.Policylist[i].runs.length; j++)
                 {

                    if ($scope.Policylist[i].runs[j].id == jobid)
                    {
                      var foundP = i;
                      var foundR = j;

                      // only do this if we are not sure if the job completed already (successfully or not, it doesn't matter)
                      if (!$scope.Policylist[foundP].runs[foundR].hasCompleted)
                      {
                            $scope.Policylist[foundP].runs[foundR].issues = [];
                            $scope.Policylist[foundP].runs[foundR].output = [];
                            $scope.Policylist[foundP].runs[foundR].events = [];
                            $scope.Policylist[foundP].runs[foundR].runStatus = "Getting data...";
                            $scope.Policylist[foundP].runs[foundR].hasCompleted = false;

                            // To get the Events
                            $http.get($cookies.get("PlatForm") + '/v1/events?jobId=' + $scope.jobid)
                               .success(function (data) {
                                   $scope.Policylist[foundP].runs[foundR].events = data[0];
                                   if (data.length == 0)
                                   {
                                      $scope.Policylist[foundP].runs[foundR].runStatus = "Job did not start...";
                                   }
                                   else if (data[0].type == "RUN_JOB_STARTED")
                                   {
                                      $scope.Policylist[foundP].runs[foundR].runStatus = "Job Started...";
                                   }
                                   else if (data[0].type == "RUN_JOB_FAILED")
                                   {
                                      $scope.Policylist[foundP].runs[foundR].runStatus = "Job Failed...";
                                      $scope.Policylist[foundP].runs[foundR].hasCompleted = true;
                                   }
                                   else                      // must have completed successfully
                                   {
                                      $scope.Policylist[foundP].runs[foundR].runStatus = "";
                                      $scope.Policylist[foundP].runs[foundR].hasCompleted = true;
                                   }
                               })
                               .error(function (data) {
                                   $("#alert-error").show().find(".msg").text("Failed getting evnts for Run [" + jobid + "]");
                               });


                            // To get the issues
                            $http.get($cookies.get("PlatForm") + '/v1/issues?jobId=' + $scope.jobid)
                               .success(function (data) {
                                  //  $scope.Policylist[foundP].runs[foundR].issues = data;
                                  //  $scope.Policylist[foundP].runs[foundR].issues = $filter('filter')($scope.Policylist[foundP].runs[foundR].issues, { issue.name: "All Output" });
                                   for (x = 1; x < data[0].length; x++)
                                   {
                                      var issueIndex = x;
                                      if (data[issueIndex].issue.name == "All Output")
                                      {
                                        $scope.Policylist[foundP].runs[foundR].output.push(data[0][issueIndex]);
                                      }
                                      else
                                      {
                                          $scope.Policylist[foundP].runs[foundR].issues.push(data[0][issueIndex]);
                                      }
                                   }
                               })
                               .error(function (data) {
                                   $("#alert-error").show().find(".msg").text("Failed getting issues for Run [" + jobid + "]");
                               });
                         }
                    }

                 }

               }

             }
    };

    // Create Duplicate Policy
    $scope.CreateDupPolicy = function () {
        //alert($scope.plid);

        $http.defaults.headers.common.Authorization = token;

        $scope.SourcePolicyID = $scope.plid;
        $scope.DupPolicyname = document.getElementById("DupPolicyname").value;
        $scope.DupPolicydescription = document.getElementById("DupPolicydescription").value;

        $http.get($cookies.get("PlatForm") + '/v1/policies/' + $scope.SourcePolicyID)
              .success(function (data) {
                  $scope.PlcyDetail = data[0];
                  $scope.PlcyDetail.name = $scope.DupPolicyname;
                  $scope.PlcyDetail.description = $scope.DupPolicydescription;

                  // create a policy
                  $http({
                      headers: {
                          Authorization: $scope.Authorization
                      },
                      method: 'POST',
                      url: $cookies.get("PlatForm") + '/v1/policies',
                      data: $scope.PlcyDetail
                  }).success(function (data, status, headers, config) {
                      window.location.href = 'Policies.html';
                  }).error(function (data, status, headers, config) {

                      $("#alert-error").show().find(".msg").text("Failed Creating Policy [" + data.errors + "]");
                  });
              })
              .error(function (data) {
                  $("#alert-error").show().find(".msg").text("Failed Getting Policy data [" + data.errors + "]");
              });
    };
});


app.filter('removeChar', function () {
    return function (items) {

        var res = JSON.stringify(items[0]);
        var ressplit = res.split(":");
        var resscenario = ressplit[0].replace("{", "").replace("}", "").replace(/['"]+/g, '');
        if (resscenario != "undefined") {
            return resscenario;
        }
    }
  });
