var app = angular.module('CybricApp', ["ngCookies", "ngRoute", "angularjs-datetime-picker"]);

app.config(function ($routeProvider) {
    $routeProvider.
        when('/login', {
            templateUrl: 'Login.html',
            controller: 'LoginCtrlr'
        }).
        when('/dashboard', {
            templateUrl: 'dashboard.html',
            controller: 'Dashb'
        }).
        when('/Environments', {
            templateUrl: 'Environments.html',
            controller: 'Environlst'
        }).
        when('/AddEnvironment', {
            templateUrl: 'AddEnvironment.html',
            controller: 'AddEnvironment'
        }).
        when('/Policies', {
            templateUrl: 'Policies.html',
            controller: 'Policylst'
        }).
        when('/AddPolicy', {
            templateUrl: 'AddPolicy.html',
            controller: 'AddPolicy'
        }).
        when('/AddPolicy/:Pid', {
            templateUrl: 'AddPolicy.html',
            controller: 'AddPolicy'
        }).
         when('/Profile', {
             templateUrl: 'Profile.html',
             controller: 'ProfileCtrlr'
         }).
        otherwise({
            redirectTo: '/login'
        });
});








