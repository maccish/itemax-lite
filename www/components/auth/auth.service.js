(function() {

  'use strict';

  angular
    .module('app')
    .service('authService', authService);

  authService.$inject = ['$rootScope', 'lock', 'authManager', 'jwtHelper'];

  function authService($rootScope, lock, authManager, jwtHelper) {

    var userProfile = JSON.parse(localStorage.getItem('profile')) || {};

    function login() {
      lock.show();
    }

    // Logging out just requires removing the user's
    // id_token and profile
    function logout() {
      console.log("logging out");
      isAuthenticated = false;
      localStorage.removeItem('id_token');
      localStorage.removeItem('profile');
      localStorage.removeItem('itemax_access_token');
      authManager.unauthenticate();
      userProfile = {};
    }

    // Set up the logic for when a user authenticates
    // This method is called from app.run.js
    function registerAuthenticationListener() {
      lock.on('authenticated', function(authResult) {
        localStorage.setItem('id_token', authResult.idToken);
        console.log(authResult);
        localStorage.setItem('itemax_access_token', authResult.accessToken);
        authManager.authenticate();
        lock.hide();

        // Redirect to default page
        location.hash = '#/';

        lock.getProfile(authResult.idToken, function(error, profile) {
          if (error) {
            console.log(error);
          }
          localStorage.setItem('profile', JSON.stringify(profile));
          console.log(profile);
          $rootScope.profile = profile;
        });
      });

      lock.on('authorization_error', function(error) {
        console.log(error);
      });
    }

    function checkAuthOnRefresh() {
      var token = localStorage.getItem('id_token');
      var atoken = localStorage.getItem('itemax_access_token');
      console.log("Checking token");
      if (token && atoken) {
        console.log("Tokens found");
        console.log("Token expires " + jwtHelper.getTokenExpirationDate(token));
        if (!jwtHelper.isTokenExpired(token)) {
          console.log("Token expired");
          if (!$rootScope.isAuthenticated) {
            console.log("Reauthenticating");
            authManager.authenticate();
          }
        } else {
          login();
        }
      } else {
        login();
      }
    }

    return {
      userProfile: userProfile,
      login: login,
      logout: logout,
      registerAuthenticationListener: registerAuthenticationListener,
      checkAuthOnRefresh: checkAuthOnRefresh
    }
  }
}());
