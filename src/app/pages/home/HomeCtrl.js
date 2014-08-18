angular.module('civic.pages')
  .controller('HomeCtrl', HomeCtrl);

/**
 * @ngInject
 */
function HomeCtrl($rootScope, $scope, $log) {
  'use strict';
  $log.info('HomeCtrl instantiated');
  $rootScope.navMode = 'home';
  $rootScope.pageTitle = 'Home';
  $scope.loadedMsg = 'Loaded Home!';
}

