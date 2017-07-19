(function () {

  'use strict';

  angular
    .module('app')
    .controller('itemController', itemController);

  itemController.$inject = ['$state', 'authService', '$http', '$timeout'];

  function itemController($state, authService, $http, $timeout) {



  }

} ());
