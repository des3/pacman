angular.module('pacmanApp')
  .controller('HeaderCtrl', function ($scope, $location) {

    $scope.isActive = function (viewLocation) { 
      return viewLocation === $location.path();
    };

    $scope.go = function (path) {
      $location.path(path);
    };

  });


angular.module('pacmanApp')
  .controller('HomeCtrl', function ($scope, $location) {

    $scope.go = function (path) {
      $location.path(path);
    };

  });