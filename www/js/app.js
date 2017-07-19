// Ionic Starter App
window.globalVariable = {
  user: {
    avatar: "file:///storage/emulated/0/" + localStorage.getItem("username") + "/" + "myavatar.jpg"//"cdvfile://localhost/persistent/img/avatar.jpg"// "file:///storage/emulated/0/myavatar.jpg"
  },
  message: {
    errorMessage: "Technical error please try again later." //Default error message.
  },
  address: "https://itemax.xyz:8443/api/"
};// End Global variable



(function () {

  'use strict';

  angular
    .module('app', ['ionic', 'auth0.lock', 'angular-jwt', 'ngCordova'])
    .config(config)
    .directive('httpSrc', [
      '$http', function ($http) {
        var directive = {
          link: link,
          restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
          var requestConfig = {
            method: 'Get',
            url: attrs.httpSrc,
            responseType: 'arraybuffer',
            cache: 'true'
          };

          $http(requestConfig)
            .success(function (data) {
              var arr = new Uint8Array(data);

              var raw = '';
              var i, j, subArray, chunk = 5000;
              for (i = 0, j = arr.length; i < j; i += chunk) {
                subArray = arr.subarray(i, i + chunk);
                raw += String.fromCharCode.apply(null, subArray);
              }

              var b64 = btoa(raw);

              attrs.$set('src', "data:image/jpeg;base64," + b64);
            });
        }

      }
    ]);


  config.$inject = ['$stateProvider', '$urlRouterProvider', 'lockProvider', 'jwtOptionsProvider', '$ionicConfigProvider'];


  function config($stateProvider, $urlRouterProvider, lockProvider, jwtOptionsProvider, $ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('home', {
        url: '/',
        templateUrl: 'components/home/home.html'
      })

      .state('login', {
        url: '/login',
        templateUrl: 'components/login/login.html'
      })

      .state('device', {
          url: "/device",
          templateUrl: "components/device/device.html"
        })

      .state('service', {
        url: "/service",
        templateUrl: "components/service/service.html"
      })

      .state('user', {
          url: "/user",
          templateUrl: "components/user/user.html"
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/');

    lockProvider.init({
      clientID: AUTH0_CLIENT_ID,
      domain: AUTH0_DOMAIN,
      options: {
        auth: {
          redirect: false,
          sso: false,
          params: {
            scope: 'openid',
            device: 'Mobile device'
          }
        }
      }
    });

    // Configuration for angular-jwt
    jwtOptionsProvider.config({
      tokenGetter: function() {
        return localStorage.getItem('id_token');
      },
      whiteListedDomains: ['localhost'],
      unauthenticatedRedirectPath: '/login'
    });

  }

})();
