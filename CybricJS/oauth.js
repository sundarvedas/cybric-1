var app = angular.module('CybricApp', ["ngCookies"]);
app.controller('oauthCtrlr', function ($scope, $http, $cookies) {

    //app.config(function ($httpProvider) {
    //    $httpProvider.defaults.headers.common = {};
    //    $httpProvider.defaults.headers.post = {};
    //    $httpProvider.defaults.headers.put = {};
    //    $httpProvider.defaults.headers.patch = {};
    //});

    $scope.getoauth = function () {
       // alert("test");

        //localhost
        //var url = "https://github.com/login/oauth/authorize?client_id=e505191d63f06b5f2256&scope=gist,user,user:email,repo,repo:status,read:org";

        //cybric.aptussoft.com
        //var url = "https://github.com/login/oauth/authorize?client_id=2603a4ae6fdef66c08fb&scope=gist,user,user:email,repo,repo:status,read:org";
       
        //ganesan-vedas - localhost
        var url = "https://github.com/login/oauth/authorize?client_id=84bc80ba3e302152fba4&scope=gist,user,user:email,repo,repo:status,read:org";

        
        $.oauthpopup({
            path: url,
            callback: (code) => {
                var githubcode = code;
                alert(githubcode);

                //localhost
                var gurl = 'https://github.com/login/oauth/access_token?client_id=e505191d63f06b5f2256&client_secret=94ee8dfa397b263f56d3595230a252b0ed892de7&code=' + githubcode;

                //cybric.aptussoft.com
                //var gurl = 'https://github.com/login/oauth/access_token?client_id=2603a4ae6fdef66c08fb&client_secret=d10e4abb7a6cc1e82b97cb07a8446bf52f06b0a1&code=' + githubcode;

                //ganesan-vedas - localhost
                var gurl = 'https://github.com/login/oauth/access_token?client_id=84bc80ba3e302152fba4&client_secret=eb415f1cb3002c43c6badabd0eb735da96264240&code=' + githubcode;

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

               // $http.defaults.headers.post['dataType'] = 'json'
                //$http.defaults.headers.post['Content-Type'] = 'application/json'

                $http({
                    dataType: 'json',
                    method: 'POST',
                    url: gurl,
                    //contentType: "application/json",
                    Accept: "application/json",
                    //crossDomain: true,
                   
                    //headers: {  'Access-Control-Allow-Origin': '*'},
                    //contentType: "application/json; charset=utf-8",
                    //beforeSend: function (xhr) {
                    //    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
                    //}
                }).success(function (data) {
                    alert(data);
                }).error(function (data) {
                    alert(data);
                });

                               
            }
        });




       
    };

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