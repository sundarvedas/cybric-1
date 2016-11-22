var app = angular.module('CybricApp', ["ngCookies", "angularjs-datetime-picker"]);
app.controller('AddPolicy', function ($scope, $http, $location, $cookies,$filter) {

    var isduppolicy = false;
    var DuplicatePolicyID = $location.search().Pid;
    if (DuplicatePolicyID != null) isduppolicy = true;

    var token = $cookies.get("AuthKey")
    var nusername = $cookies.get("nickname");
    var picture = $cookies.get("picture");
    $scope.nickname = nusername;
    $scope.picture = picture;

    $scope.menutitle = "FabricOPS";
    var userrole = $cookies.get("userrole");

    if (userrole == "user") {
        $scope.FabricUserrole = {
            "display": "none"
        }
    }

    $scope.Authorization = token;

    $scope.discoverdisable = false;
    $scope.selectedVal = "";
    $scope.elist = [];

    $scope.selectedTargetVal = "";
    $scope.etargetlist = [];

    var dupenvidindex = 0;
    var scid = "";

    $scope.RepositoryResList = [];
    $scope.selectedRepositoryRes = "";

    var config = {
        headers: {
            'Authorization': $scope.Authorization
        },
        routes: {
            validate: {
                options: {
                    stripUnknown: true
                }
            }
        }
    };

    $scope.provider_type = {
        name: 'AWS'
    };

    $scope.FrequencyLst = [
  { frequency: "P", name: "No Schedule" },
  { frequency: "P1D", name: "Every Day" },
  { frequency: "P7D", name: "Every Week" },
  { frequency: "P1M", name: "Every Month" }
    ];

    $http.get($cookies.get("PlatForm") + '/v1/environmentTypes', config)
         .success(function (data) {
             $scope.EnvTypes = [];

             //$scope.EnvTyp = data[0];
             //$scope.EnvTyp = $filter('filter')($scope.EnvTyp, { isEnabled: true });

             //angular.forEach($scope.EnvTyp, function (obj) {

             //    if (obj.integrationType != "notification") {
             //        $scope.EnvTypes.push(obj);
             //    }

             //});

             angular.forEach(data[0], function (obj) {

                 if (obj.data.integrationType != "notification" && obj.meta.isEnabled == true) {
                     $scope.EnvTypes.push(obj);
                 }

             });


             if (isduppolicy == false)
                 $scope.environModel = "aws";
         })
         .error(function (data) {
             $("#alert-error").show().find(".msg").text("Error getting Integration Types [" + data.errors + "]");
         });

    if (isduppolicy == false)
        FilterEnvlst(false);


    var ScenariosType = "instance";

    if (isduppolicy)
        Scenarioslst(true);
    else
        Scenarioslst(false);

    $scope.environModelChange = function (obj) {

        $scope.provider_type = {
            name: obj.toUpperCase()
        };
        $scope.Environments = [];
        //$scope.Environments = $filter('filter')($scope.Envint, { type: obj });

        angular.forEach($scope.Envint, function (o) {

            if (o.data.type == obj) {
                $scope.Environments.push(o);
            }

        });

        ShowHideBusiness(obj);

        Scenarioslst(false);

    }

    function ShowHideBusiness(envtype) {
        document.getElementById("lblprojname").style.display = "none";
        document.getElementById("txtprojname").style.display = "none";

        switch (envtype.toUpperCase()) {
            case "AWS":
                ScenariosType = "instance";

                document.getElementById("policy_env_sources").style.display = "block";
                document.getElementById("policy_env_targets").style.display = "block";
                document.getElementById("imgRefresh").style.display = "block";
                document.getElementById("btnDiscover").style.display = "block";

                document.getElementById("txtip").style.display = "none";
                document.getElementById("policy_repo_sources").style.display = "none";

                document.getElementById("lblResources").style.display = "block";
                document.getElementById("lblRepositories").style.display = "none";

                document.getElementById("lblEnv").style.display = "block";
                document.getElementById("lblAcct").style.display = "none";
                break;
            case "DIRECT":
                ScenariosType = "instance";

                document.getElementById("policy_env_sources").style.display = "none";
                document.getElementById("policy_env_targets").style.display = "none";
                document.getElementById("imgRefresh").style.display = "none";
                document.getElementById("btnDiscover").style.display = "none";

                document.getElementById("txtip").style.display = "block";
                document.getElementById("policy_repo_sources").style.display = "none";

                document.getElementById("lblResources").style.display = "block";
                document.getElementById("lblRepositories").style.display = "none";

                document.getElementById("lblEnv").style.display = "block";
                document.getElementById("lblAcct").style.display = "none";
                break;
            case "GITHUB":

                ScenariosType = "repository";

                document.getElementById("txtip").style.display = "none";
                document.getElementById("policy_env_sources").style.display = "none";
                document.getElementById("policy_env_targets").style.display = "none";
                document.getElementById("imgRefresh").style.display = "none";

                document.getElementById("policy_repo_sources").style.display = "block";
                document.getElementById("btnDiscover").style.display = "block";

                document.getElementById("lblResources").style.display = "none";
                document.getElementById("lblRepositories").style.display = "block";

                document.getElementById("lblEnv").style.display = "none";
                document.getElementById("lblAcct").style.display = "block";
                break;

            case "JENKINS":
                ScenariosType = "build";
                document.getElementById("txtip").style.display = "none";
                document.getElementById("policy_env_sources").style.display = "none";
                document.getElementById("policy_env_targets").style.display = "none";
                document.getElementById("imgRefresh").style.display = "none";

                document.getElementById("policy_repo_sources").style.display = "none";
                document.getElementById("btnDiscover").style.display = "none";

                document.getElementById("lblResources").style.display = "none";
                document.getElementById("lblRepositories").style.display = "none";

                document.getElementById("lblEnv").style.display = "block";
                document.getElementById("lblAcct").style.display = "none";

                document.getElementById("lblprojname").style.display = "block";
                document.getElementById("txtprojname").style.display = "block";

                break;

            case "PAGERDUTY":
            case "SLACK":
                ScenariosType = "notification";
                document.getElementById("txtip").style.display = "none";
                document.getElementById("policy_env_sources").style.display = "none";
                document.getElementById("policy_env_targets").style.display = "none";
                document.getElementById("imgRefresh").style.display = "none";

                document.getElementById("policy_repo_sources").style.display = "none";
                document.getElementById("btnDiscover").style.display = "none";

                document.getElementById("lblResources").style.display = "none";
                document.getElementById("lblRepositories").style.display = "none";

                document.getElementById("lblEnv").style.display = "block";
                document.getElementById("lblAcct").style.display = "none";

                document.getElementById("lblprojname").style.display = "none";
                document.getElementById("txtprojname").style.display = "none";

                break;

            default:
                document.getElementById("policy_env_sources").style.display = "none";
                document.getElementById("policy_env_targets").style.display = "none";
                document.getElementById("imgRefresh").style.display = "none";
                document.getElementById("btnDiscover").style.display = "none";

                document.getElementById("txtip").style.display = "none";
                document.getElementById("policy_repo_sources").style.display = "none";

                document.getElementById("lblResources").style.display = "none";
                document.getElementById("lblRepositories").style.display = "none";

                document.getElementById("lblEnv").style.display = "block";
                document.getElementById("lblAcct").style.display = "none";
                break;
        }
    }


    function FilterEnvlst(calldup) {
        $scope.Envint = [];
        $http.get($cookies.get("PlatForm") + '/v1/environments?limit=100', config)
              .success(function (data) {
                  $scope.Envint = data[0];
                  $scope.Environments = $scope.Envint;
                  if (isduppolicy == false)
                      $scope.environModelChange($scope.environModel);
              })
              .error(function (data) {
                  $("#alert-error").show().find(".msg").text("Error getting Integrations [" + data.errors + "]");
              });

    }

    function FilterEnvlstbyType(typ) {
        $scope.Envint = [];
        $http.get($cookies.get("PlatForm") + '/v1/environments?limit=100', config)
              .success(function (data) {
                  $scope.Envint = data[0];

                  //Bind EnvironmentId
                  $scope.Environments = [];
                  $scope.Environments = $filter('filter')($scope.Envint, { type: typ });

                  var dupenvid = ""
                  if ($scope.Duplst != undefined && $scope.Duplst != null) {
                      dupenvid = $scope.Duplst.environmentId;
                      $scope.selectedItemvalue = dupenvid;
                  }

              })
              .error(function (data) {
                  $("#alert-error").show().find(".msg").text("Error getting Integrations [" + data.errors + "]");
              });

    }


    function DuplicatePolicy() {
        var DuplicatePolicyID = $location.search().Pid;
        if (DuplicatePolicyID != null) {
            $http.get($cookies.get("PlatForm") + '/v1/policies/' + $location.search().Pid, config)
                  .success(function (data) {
                      $scope.Duplst = data[0];
                      var dupenvironmentId = $scope.Duplst.environmentId;

                      $scope.name = data.name;
                      $scope.description = data.description;


                      if (data.schedule != null) {
                          $scope.cmbScheduleduration = data.schedule.duration;
                          var stime = data.schedule.startTime;
                          $scope.ScheduleDateTime = stime.replace("T", " ");
                      }

                      if (data.targets != null && data.targets[0] != null && data.targets[0].ip != null)
                          $scope.policy_manual_ips = data.targets[0].ip;

                      if (data.targets != null && data.targets[0] != null && data.targets[0].project_name != null)
                          $scope.projname = data.targets[0].project_name;

                      if (data.scenarios != null && data.scenarios.length > 0) {
                          var scindex = 0;


                          angular.forEach(data.scenarios[0], function (value, key) {
                              scid = key;
                          });


                          //if (scid != "" && $scope.scenarios != undefined && $scope.scenarios != null && $scope.scenarios.length > 0) {
                          //    angular.forEach($scope.scenarios, function (value, key) {
                          //        if (scid == value.name) {
                          //            scindex = key;
                          //        }
                          //    });
                          //    $scope.selectedScenarios = $scope.scenarios[scindex];
                          //}


                      }

                      //Find env type for duplicate env type
                      if (dupenvironmentId != "") {

                          $http.get($cookies.get("PlatForm") + '/v1/environments/' + dupenvironmentId, config)
                          .success(function (data) {

                              $scope.environModel = data[0].type;

                              $scope.provider_type = {
                                  name: data.type.toUpperCase()
                              };

                              ShowHideBusiness(data.type);

                              FilterEnvlstbyType(data.type);


                              //Bind Env Targets
                              if ($scope.Duplst.targets != null && $scope.Duplst.targets.length > 0) {

                                  angular.forEach($scope.Duplst.targets, function (value, key) {

                                      var insid = '', vpcidval = '', primaryip = '';
                                      insid = value.instanceId;

                                      if (value.networkInterfaces != undefined && value.networkInterfaces != null) {
                                          vpcidval = value.networkInterfaces[0].vpcId;
                                          primaryip = value.networkInterfaces[0].primaryPrivateIpAddress;

                                          var resbind = [];
                                          resbind.push({
                                              instanceId: insid,
                                              name: value.name,
                                              networkInterfaces: [
                                                  {
                                                      primaryPrivateIpAddress: primaryip,
                                                      vpcId: vpcidval
                                                  }
                                              ],
                                              InsVpcname: insid + vpcidval + value.name
                                          });
                                          $scope.etargetlist.push({ displayText: value.name, Value: resbind, instanceId: vpcidval });
                                      }

                                  });
                              }

                              $scope.environModelChange($scope.environModel);

                          })
                          .error(function (data) {
                              $("#alert-error").show().find(".msg").text("Error getting Integrations [" + data.errors + "]");
                          });
                      }


                  })
                  .error(function (data) {
                      $("#alert-error").show().find(".msg").text("Error getting Policies [" + data.errors + "]");
                  });
        }
    }


    function Scenarioslst(calldup) {
        $http.get($cookies.get("PlatForm") + '/v1/scenarios', config)
          .success(function (data) {
              //$scope.scenarios = data[0];
              //$scope.scenarios = $filter('filter')($scope.scenarios, { integrationType: ScenariosType });
              //$scope.scenarios = $filter('filter')($scope.scenarios, { isEnabled: true });
              $scope.scenarios = [];

              angular.forEach(data[0], function (obj) {

                  if (obj.data.integrationType == ScenariosType) {
                      $scope.scenarios.push(obj);
                  }

              });

              if (calldup)
                  DuplicatePolicy();
              else
                  $scope.selectedScenarios = $scope.scenarios[0];

              if (DuplicatePolicyID != null && calldup == false) {
                  if (scid != "" && $scope.scenarios != undefined && $scope.scenarios != null && $scope.scenarios.length > 0) {
                      angular.forEach($scope.scenarios, function (value, key) {
                          if (scid == value.name) {
                              scindex = key;
                          }
                      });
                      $scope.selectedScenarios = $scope.scenarios[scindex];
                  }
              }
          })
          .error(function (data) {
              $("#alert-error").show().find(".msg").text("Error getting Scenarios [" + data.errors + "]");
          });
    }


    // Discover
    $scope.Discover = function () {

        $http({
            headers:
                {
                    Authorization: $scope.Authorization
                },
            method: 'POST',
            url: $cookies.get("PlatForm") + '/v1/environments/' + $scope.selectedItemvalue + '/discover',
        }).success(function (data, status) {
            var jobId = data.jobId;
            if (ScenariosType == "instance") {
                GetEnvironmentResources(jobId);
            }
            else {
                GetRepositoryResources(jobId);
            }

        }).error(function (data, status) {
            $("#alert-error").show().find(".msg").text("Error running discovery [" + data.message + "]");
            $scope.elist = [];
            $scope.etargetlist = [];
        });

    };

    function GetRepositoryResources(jobId) {

        $scope.RepositoryResList = [];
        $scope.discoverdisable = true;
        var urlmethod = $cookies.get("PlatForm") + "/v1/events?jobId=" + jobId;
        $http.get(urlmethod, config)
        .success(function (data) {
            if (data != undefined && data != null && data.length > 1) {
                var res = data[0];

                var respIns = res.message.response;
                if (respIns != null && respIns.length > 0) {
                    $scope.RepositoryResList = respIns;
                }
                else {
                    $("#alert-error").show().find(".msg").text("No Repositories Found");
                }

                $scope.discoverdisable = false;
            }
            else {
                if (data != undefined && data != null && data.length > 0)
                    GetRepositoryResources(jobId);
                else {
                    GetRepositoryResources(jobId);
                }
            }
        })
        .error(function (data) {
            $("#alert-error").show().find(".msg").text("Error getting Repository information [" + data.errors + "]");
            $scope.discoverdisable = false;
        });

    }

    function GetEnvironmentResources(jobId) {

        $scope.elist = [];
        $scope.etargetlist = [];
        var envlist = [];
        $scope.discoverdisable = true;
        var urlmethod = $cookies.get("PlatForm") + "/v1/events?jobId=" + jobId;
        $http.get(urlmethod, config)
        .success(function (data) {

            if (data != undefined && data != null && data.length > 1) {
                var res = data[0];

                var respIns = res.message;
                if (respIns != null && respIns.length > 0) {
                    for (var i = 0; i < respIns.length; i++) {
                        var insid = '', vpcidval = '', primaryip = '';
                        var TagsArr = [], nrkinter = [];

                        insid = respIns[i].InstanceId;
                        vpcidval = respIns[i].networkInterfaces[0].VpcId;
                        TagsArr = respIns[i].tags;
                        nrkinter = respIns[i].networkInterfaces[0];

                        angular.forEach(TagsArr, function (value, key) {
                            if (value.Key == "Name") {
                                var resbind = [];
                                resbind.push({
                                    instanceId: insid,
                                    name: value.Value,
                                    networkInterfaces: [
                                      {
                                          primaryPrivateIpAddress: nrkinter.PrivateIpAddresses[0].PrivateIpAddress,
                                          vpcId: vpcidval
                                      }
                                    ],
                                    InsVpcname: insid + vpcidval + value.Value
                                });
                                envlist.push({ displayText: value.Value, Value: resbind, instanceId: vpcidval });
                            }

                        });

                    }
                }
                else {
                    $("#alert-error").show().find(".msg").text("No Resources Found!");
                }

                $scope.elist = envlist;
                $scope.discoverdisable = false;
            }
            else {
                if (data != undefined && data != null && data.length > 0)
                    GetEnvironmentResources(jobId);
                else {
                    $("#alert-error").show().find(".msg").text("No Resources Found!");
                    $scope.discoverdisable = false;
                    //GetEnvironmentResources(jobId);
                }
            }
        })
        .error(function (data) {
            $("#alert-error").show().find(".msg").text("No Resources Found!");
            $scope.discoverdisable = false;
        });
    }

    $scope.BindTargetEnv = function (selectedVal) {

        var elst = [];
        elst = $scope.elist;
        $scope.elist = [];

        var chkid = '';
        angular.forEach(selectedVal, function (value, key) {

            var insid = '', vpcidval = '', primaryip = '';
            insid = value[0].instanceId;

            vpcidval = value[0].networkInterfaces[0].vpcId;
            primaryip = value[0].networkInterfaces[0].primaryPrivateIpAddress;
            chkid = value[0].InsVpcname;

            var resbind = [];
            resbind.push({
                instanceId: insid,
                name: value[0].name,
                networkInterfaces: [
                    {
                        primaryPrivateIpAddress: primaryip,
                        vpcId: vpcidval
                    }
                ],
                InsVpcname: insid + vpcidval + value[0].name
            });
            $scope.etargetlist.push({ displayText: value[0].name, Value: resbind, instanceId: vpcidval });

        });

        angular.forEach(elst, function (value, key) {

            var insid = '', vpcidval = '', primaryip = '', chk = '';
            insid = value.Value[0].instanceId;

            vpcidval = value.Value[0].networkInterfaces[0].vpcId;
            primaryip = value.Value[0].networkInterfaces[0].primaryPrivateIpAddress;
            chk = value.Value[0].InsVpcname;

            var resbind = [];
            resbind.push({
                instanceId: insid,
                name: value.Value[0].name,
                networkInterfaces: [
                    {
                        primaryPrivateIpAddress: primaryip,
                        vpcId: vpcidval
                    }
                ],
                InsVpcname: insid + vpcidval + value.Value[0].name
            });
            if (chkid != chk)
                $scope.elist.push({ displayText: value.Value[0].name, Value: resbind, instanceId: vpcidval });

        });


    }


    $scope.BindSourceEnv = function (selectedVal) {

        var tlst = [];
        tlst = $scope.etargetlist;
        $scope.etargetlist = [];

        var elst = [];
        elst = $scope.elist;
        $scope.elist = [];

        var chkid = '';

        angular.forEach(selectedVal, function (value, key) {

            var insid = '', vpcidval = '', primaryip = '';
            insid = value[0].instanceId;

            vpcidval = value[0].networkInterfaces[0].vpcId;
            primaryip = value[0].networkInterfaces[0].primaryPrivateIpAddress;
            chkid = value[0].InsVpcname;

            var resbind = [];
            resbind.push({
                instanceId: insid,
                name: value[0].name,
                networkInterfaces: [
                    {
                        primaryPrivateIpAddress: primaryip,
                        vpcId: vpcidval
                    }
                ],
                InsVpcname: insid + vpcidval + value[0].name
            });
            $scope.elist.push({ displayText: value[0].name, Value: resbind, instanceId: vpcidval });

        });

        angular.forEach(tlst, function (value, key) {

            var insid = '', vpcidval = '', primaryip = '', chk = '';
            insid = value.Value[0].instanceId;

            vpcidval = value.Value[0].networkInterfaces[0].vpcId;
            primaryip = value.Value[0].networkInterfaces[0].primaryPrivateIpAddress;
            chk = value.Value[0].InsVpcname;

            var resbind = [];
            resbind.push({
                instanceId: insid,
                name: value.Value[0].name,
                networkInterfaces: [
                    {
                        primaryPrivateIpAddress: primaryip,
                        vpcId: vpcidval
                    }
                ],
                InsVpcname: insid + vpcidval + value.Value[0].name
            });
            if (chkid != chk)
                $scope.etargetlist.push({ displayText: value.Value[0].name, Value: resbind, instanceId: vpcidval });

        });


        angular.forEach(elst, function (value, key) {

            var insid = '', vpcidval = '', primaryip = '', chk = '';
            insid = value.Value[0].instanceId;

            vpcidval = value.Value[0].networkInterfaces[0].vpcId;
            primaryip = value.Value[0].networkInterfaces[0].primaryPrivateIpAddress;
            chk = value.Value[0].InsVpcname;

            var resbind = [];
            resbind.push({
                instanceId: insid,
                name: value.Value[0].name,
                networkInterfaces: [
                    {
                        primaryPrivateIpAddress: primaryip,
                        vpcId: vpcidval
                    }
                ],
                InsVpcname: insid + vpcidval + value.Value[0].name
            });

            $scope.elist.push({ displayText: value.Value[0].name, Value: resbind, instanceId: vpcidval });

        });


    }

    // Add Policy
    $scope.Createpolicy = function () {


        if ($scope.name == undefined || $scope.name == null || $scope.name == "") {
            $("#alert-error").show().find(".msg").text("Please enter a name");
            return;
        };


        if ($scope.selectedItemvalue == undefined || $scope.selectedItemvalue == null || $scope.selectedItemvalue == "") {
            a$("#alert-error").show().find(".msg").text("Please select and integration");
            return;
        };

        if ($scope.environModel.toUpperCase() == "AWS") {
            if ($scope.etargetlist == undefined || $scope.etargetlist == null) {
                $("#alert-error").show().find(".msg").text("Please start discover for " + $("option:selected", '#cmbEnvironment').text() + " environment and then choose resource(s) to target(s)");
                return;
            }
        }


        if ($scope.selectedScenarios == undefined || $scope.selectedScenarios == null || $scope.selectedScenarios == "") {
            $("#alert-error").show().find(".msg").text("Please select a scenario");
            return;
        };



        var targetsval = [{}];

        switch ($scope.environModel.toUpperCase()) {

            case "AWS":

                if ($scope.etargetlist != undefined && $scope.etargetlist != null) {
                    var savelst = [];
                    angular.forEach($scope.etargetlist, function (value, key) {
                        savelst.push({
                            "instanceId": value.Value[0].instanceId,
                            "name": value.Value[0].name,
                            "networkInterfaces": [
                                {
                                    "primaryPrivateIpAddress": value.Value[0].networkInterfaces[0].primaryPrivateIpAddress,
                                    "vpcId": value.Value[0].networkInterfaces[0].vpcId
                                }
                            ]
                        });
                    });

                    if (savelst != null && savelst.length > 0)
                        targetsval = savelst;
                }

                break;

            case "DIRECT":
                targetsval = { ip: $scope.policy_manual_ips };
                break;

            case "GITHUB":
                if ($scope.selectedRepositoryRes != undefined && $scope.selectedRepositoryRes != null) {
                    targetsval = { full_name: $scope.selectedRepositoryRes };
                }

            case "JENKINS":
                if ($scope.projname != undefined && $scope.projname != null) {
                    targetsval = { project_name: $scope.projname };
                }
                break;


        }

        // Scenarios value
        var scename = $scope.selectedScenarios.data.name;
        var sceid = {};
        var scelst = {};
        scelst[scename] = sceid;

        var Startdatetime = "";
        var Sduration = "";
        if ($scope.ScheduleDateTime != null)
            Startdatetime = $scope.ScheduleDateTime;
        if ($scope.cmbScheduleduration != null)
            Sduration = $scope.cmbScheduleduration;

        var policyData = {};
        var envid = "";
        if ($scope.selectedItemvalue != null)
            envid = $scope.selectedItemvalue;
        if ($scope.environModel.toUpperCase() == "DIRECT" || $scope.environModel.toUpperCase() == "GITHUB" || $scope.environModel.toUpperCase() == "JENKINS") {
            policyData = {
                "name": $scope.name,
                "environmentId": envid,
                "targets": [targetsval],
                "scenarios": [scelst],
                "description": $scope.description,
                "schedule": { "repeat": "R", "startTime": Startdatetime, "duration": Sduration }
            };
        }
        else {
            policyData = {
                "name": $scope.name,
                "environmentId": envid,
                "targets": targetsval,
                "scenarios": [scelst],
                "description": $scope.description,
                "schedule": { "repeat": "R", "startTime": Startdatetime, "duration": Sduration }
            };
        }

        $scope.policydisable = true;
        $http({
            headers: {
                Authorization: $scope.Authorization
            },
            method: 'POST',
            url: $cookies.get("PlatForm") + '/v1/policies',
            data: policyData
        }).success(function (data, status, headers, config) {
            $scope.policydisable = false;
            window.location.href = 'Policies.html';
        }).error(function (data, status, headers, config) {
            $scope.policydisable = false;
            $("#alert-error").show().find(".msg").text("Error creating a policy [" + data.errors + "]");
        });

    };






});
