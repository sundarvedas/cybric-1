var app = angular.module('CybricApp', ["ngCookies"]);
app.controller('AddEnvironment', function ($scope, $http, $cookies, $filter) {


    //var token = localStorage.getItem("AuthKey");
    var token = $cookies.get("AuthKey")

    var nusername = $cookies.get("nickname");
    var picture = $cookies.get("picture");

    $scope.nickname = nusername;
    $scope.picture = picture;

    $scope.menutitle = "FabricSRV";

    $scope.Authorization = token;
    var config1 = {
        headers: {
            'Authorization': $scope.Authorization
        }
    };

    $scope.environModel = {};
    $scope.secretid = "";
    $scope.showCustomInfo = false;

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

    $http.get($cookies.get("PlatForm") + '/v1/environmentTypes', config)
         .success(function (data) {
             //$scope.EnvTypes = data[0];
             //$scope.EnvTypes = $filter('filter')($scope.EnvTypes, { isEnabled: true });   // get the data, but filter out the disabled integrations
             //$scope.environModel.type = $scope.EnvTypes[0][0];

             $scope.EnvTypes = [];
             angular.forEach(data[0], function (obj) {

                 if (obj.meta.isEnabled == true) {
                     $scope.EnvTypes.push(obj);
                 }

             });

             $scope.environModel.type = $scope.EnvTypes[0];
         })
         .error(function (data) {
             $("#alert-error").show().find(".msg").text("Error getting Integration Types [" + data.errors + "]");
         });

    $scope.environModel = {
        customerId: "",
        name: "",
        type: "aws",
        secretId: "",
        description: "",
        region: "ap-northeast-1",
        ip: ""
    };

    $scope.saveEnvironment = function (environModel) {
        $scope.Environdisable = true;

        console.log("environModel.type.data.name = ", environModel.type.data.name);

        if (environModel.name == undefined || environModel.name == null || environModel.name == "") {
            $("#alert-error").show().find(".msg").text("Please Enter a Name!");
            // alert('Please enter name');
            return;
        }

        if (environModel.type.data.name == undefined || environModel.type.data.name == null || environModel.type.data.name == "") {
            $("#alert-error").show().find(".msg").text("Please select a valid type!");
            // alert('Please select type');
            return;
        }

        if (environModel.type.data.name != "" && environModel.type.data.name == "aws") {
            if (environModel.region == undefined || environModel.region == null || environModel.region == "") {
                $("#alert-error").show().find(".msg").text("Please select a valid region!");
                // alert('Please select region');
                return;
            }
        }

        if (environModel.type.data.name != "" && environModel.type.data.name == "aws") {
            if (environModel.arn == undefined || environModel.arn == null || environModel.arn == "") {
                $("#alert-error").show().find(".msg").text("Please Enter an ARN!");
                // alert('Please enter ARN');
                return;
            }
        }

        if (environModel.type.data.name != "" && environModel.type.data.name == "direct") {
            if (environModel.ip == undefined || environModel.ip == null || environModel.ip == "") {
                $("#alert-error").show().find(".msg").text("Please enter a valid IP Address or Range!");
                // alert('Please enter IP Address');
                return;
            }
        }

        // Done with validation, disable the Create Provider button
        $scope.Providerdisable = true;

        if (environModel.type.data.name != "" && environModel.type.data.name == "aws") {
            if (createSecret(environModel) == false) {
                return;
            }
        }
        else if (environModel.type.data.name != "" && (environModel.type.data.name == "direct"
                                                    || environModel.type.data.name == "jenkins"
                                                    || environModel.type.data.name == "slack"
                                                    || environModel.type.data.name == "pagerduty"
                                                    || environModel.type.data.name == "bitbucket"
                                                    || environModel.type.data.name == "zerto"
                                                    || environModel.type.data.name == "github")) {
            if (createCustomSecret(environModel) == false) {
                return;
            }
        }
        else {
            addEnvironment(environModel);
        }

    };

    function addEnvironment(environModel) {
        var adde = {};
        adde = {
            name: environModel.name,
            type: environModel.type.data.name,
            secretId: $scope.secretid,
            description: environModel.description
        };

        $http.defaults.headers.common.Authorization = token;
        $http({
            method: 'POST',
            url: $cookies.get("PlatForm") + '/v1/environments',
            data: adde
        }).success(function (data, status, headers, config) {
            $scope.Environdisable = false;
            window.location.href = "Environments.html";
        }).error(function (data, status, headers, config) {
            $("#alert-error").show().find(".msg").text("Failed to create Integraton [" + data.errors + "]");
            $scope.Providerdisable = false;
        });
    }


    function createCustomSecret(environModel) {

        // Create a "secret" for the Custom type
        var adde = {};
        var secretarr = {};

        switch (environModel.type.data.name) {
            case "direct":
                secretarr = { ip: environModel.ip };
                break;
            case "jenkins":
                secretarr = { url: environModel.url, token: environModel.token };
                break;
            case "slack":
                secretarr = { slack_token: environModel.slack_token };
                break;
            case "pagerduty":
                secretarr = { service_key: environModel.service_key };
                break;
            case "bitbucket":
                secretarr = { oauth_token: environModel.oauth_token };
                break;
            case "zerto":
                secretarr = { arn: environModel.arn, region: environModel.region, username: environModel.username, password: environModel.password };
                break;
            case "github":
                secretarr = { oauth_token: environModel.oauth_token };
                break;
            default:
                secretarr = { ip: environModel.ip };
                break;
        }

        adde = {
            type: environModel.type.data.name,
            secret: secretarr,
            description: environModel.description
        };

        $http.defaults.headers.common.Authorization = token;
        $http({
            method: 'POST',
            url: $cookies.get("PlatForm") + '/v1/secrets',
            data: adde
        }).success(function (data, status) {

            var secretid = data.id;
            $scope.secretid = secretid;
            addEnvironment(environModel);

        }).error(function (data, status) {
            $("#alert-error").show().find(".msg").text("Failed to save Secret [" + data.errors + "]");
            $scope.Providerdisable = false;
            return false;
        });

    }

    function createSecret(environModel) {

        // Create a "secret" for the ARN
        var adde = {};
        var secretarr = {};
        secretarr = { arn: environModel.arn, region: environModel.region };
        adde = {
            type: environModel.type.data.name,
            secret: secretarr,
            description: environModel.description
        };

        console.log("Create Secret: ", adde);
        $http.defaults.headers.common.Authorization = token;
        $http({
            method: 'POST',
            url: $cookies.get("PlatForm") + '/v1/secrets',
            data: adde
        }).success(function (data, status) {

            //Submit ARN for vaidation
            var secretid = data.id;
            var urlmethod = "";
            console.log("Starting ARN Validation: ", secretid);
            urlmethod = $cookies.get("PlatForm") + "/v1/secrets/" + secretid + "/validate";
            $http.defaults.headers.common.Authorization = token;
            $http({
                method: 'POST',
                url: urlmethod
            }).success(function (data, status) {

                var jobId = data.jobId;
                //Check ARN Validation
                var isarn = CheckARNValidation(jobId, environModel);
                return isarn;

            }).error(function (data, status) {
                $("#alert-error").show().find(".msg").text("ARN Vaidation Failed! [" + data.errors + "]");
                $scope.Providerdisable = false;
                return false;
            });

        }).error(function (data, status) {
            a$("#alert-error").show().find(".msg").text("Failed to save Secret [" + data.errors + "]");
            $scope.Providerdisable = false;
            return false;
        });

    }

    function CheckARNValidation(jobId, environModel) {
        //Check ARN Validation
        console.log("Check ARN - JobID: ", jobId);
        var urlmethod = $cookies.get("PlatForm") + "/v1/events?jobId=" + jobId;
        $http.get(urlmethod, config1)
        .success(function (data) {
            if (data != undefined && data != null && data.length > 1) {
                var res = data[0];
                var typ = "";
                typ = res.type;
                if (typ == "AWS_VALIDATE_ARN_OK") {
                   $("#alert-success").show().find(".msg").text("ARN validated successfully!");
                    var arnsecid = res.secret.id;
                    $scope.secretid = arnsecid; //res.secretId;
                    addEnvironment(environModel);
                    return true;
                }
                else {
                    $("#alert-error").show().find(".msg").text("Invalid ARN!");
                    $scope.Providerdisable = false;
                    return false;
                }
            }
            else {
                CheckARNValidation(jobId, environModel);
            }
        })
        .error(function (data) {
            $("#alert-error").show().find(".msg").text("Error checking events!");
            $scopr.Providerdisable = false;
            return false;
        });
    }

    $(document).on('click', '.btn-github-signin', (e) => {
        e.preventDefault();
        $('.repo-errors').html('');


        //localhost
        //var url = "https://github.com/login/oauth/authorize?client_id=e505191d63f06b5f2256&scope=gist,user,user:email,repo,repo:status,read:org";

        //cybric.aptussoft.com
        var url = "https://github.com/login/oauth/authorize?client_id=2603a4ae6fdef66c08fb&scope=gist,user,user:email,repo,repo:status,read:org";




        $.oauthpopup({
            path: url,
            callback: (code) => {
                var githubcode = code;
                alert(githubcode);

                //localhost
                //var gurl = 'https://github.com/login/oauth/access_token?client_id=e505191d63f06b5f2256&client_secret=94ee8dfa397b263f56d3595230a252b0ed892de7&code=' + githubcode;

                //cybric.aptussoft.com
                var gurl = 'https://github.com/login/oauth/access_token?client_id=2603a4ae6fdef66c08fb&client_secret=d10e4abb7a6cc1e82b97cb07a8446bf52f06b0a1&code=' + githubcode;


                $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
                $http.defaults.headers.common['access-control-allow-credentials'] = 'true';
                $http.defaults.headers.common['access-control-expose-headers'] = 'content-type, content-length, etag';
                $http.defaults.headers.common['access-control-max-age'] = 60 * 60;


                // dynamically set allowed headers & method
                if ($http.defaults.headers['access-control-request-headers']) {
                    $http.defaults.headers['access-control-allow-headers'] =
                       $http.defaults.headers['access-control-request-headers'];
                }

                if ($http.defaults.headers['access-control-request-method']) {
                    $http.defaults.headers['access-control-allow-methods'] =
                       $http.defaults.headers['access-control-request-method'];
                }



                $http({
                    dataType: 'json',
                    method: 'POST',
                    url: gurl,
                    Accept: "application/json",

                }).success(function (data) {
                    alert(data);
                }).error(function (data) {
                    alert(data);
                });


            }
        });





    });

    $.oauthpopup = (options) => {
        const that = this;

        options.windowName = options.windowName || 'ConnectWithOAuth';
        options.windowOptions = options.windowOptions || 'location=0,status=0,width=800,height=400';
        options.callback = options.callback;

        that._oauthWindow = window.open(options.path, options.windowName, options.windowOptions);
        that._oauthInterval = window.setInterval(() => {
            if (that._oauthWindow.closed) {
                window.clearInterval(that._oauthInterval);
                options.callback(window.code);
            }
        }, 1000);


    };



});
