'use strict';

angular
  .module('pacmanApp', [
    'ngResource',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/metrics', {
        templateUrl: 'views/metrics.html',
      })
      .when('/agents', {
        templateUrl: 'views/agents.html',
      })
      .when('/plan', {
        templateUrl: 'views/plan.html',
      })
      .when('/model', {
        templateUrl: 'views/model.html',
      })
      .when('/customers', {
        templateUrl: 'views/customers.html',
        controller: 'CustomersCtrl'
      })
      .when('/forecast', {
        templateUrl: 'views/forecast.html',
      })
      .otherwise({
        redirectTo: '/'
      });
  });
