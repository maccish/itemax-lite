(function () {

  'use strict';

  angular
    .module('app')
    .controller('userController', userController);

  userController.$inject = ['$state', 'authService'];

  function userController($state, authService) {

    var vm = this;

    vm.login = login;

    vm.logout = logout;

    console.log(authService.userProfile);
    vm.profile = authService.userProfile;


    function login() {
      $state.go("login");
    }

    function logout() {
      alert("Logging out! Good bye!");
      authService.logout;
      $state.go("login");
    }

  }



}());
