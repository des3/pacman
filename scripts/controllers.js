'use strict';

angular.module('pacmanApp').controller('HeaderCtrl', function ($scope, $location) {

  $scope.isActive = function (viewLocation) { 
    return viewLocation === $location.path();
  };

  $scope.go = function (path) {
    $location.path(path);
  };

});


angular.module('pacmanApp').controller('HomeCtrl', function ($scope, $location, $window) {

  $scope.go = function (path) {
    $location.path(path);
  };

  $window.addEventListener('resize', function () {
    $scope.$broadcast('windowResize');
  });

});

angular.module('pacmanApp').controller('CustomersCtrl', function ($scope, $location) {


});