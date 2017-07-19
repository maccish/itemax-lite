(function () {

  'use strict';

  angular
    .module('app')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$state', 'authService', '$http', '$timeout', '$rootScope','$cordovaCamera'];

  function HomeController($state, authService, $http, $timeout, $rootScope, $cordovaCamera) {

      var vm = this;

      vm.login = login;

      vm.displayItems = [];
      vm.itemsFound = false;
      vm.noItemsMessage = "You have not added any items yet";


      vm.logout = logout;
      vm.gotouser = gotouser;

      vm.shouldShowDelete = false;
      vm.shouldShowReorder = false;
      vm.listCanSwipe = true;

      vm.logItems = function() {
        console.log(vm.displayItems);
      }

      vm.loadMore = function () {
        console.log("Starting to load more updates");
        $http({
          method: "GET",
          url: window.globalVariable.address + "user/items",
          timeout: 10000,
          headers: {
            'Authorization': "Bearer " + window.localStorage.getItem("id_token"),
            'Authentication': "Bearer " + window.localStorage.getItem("itemax_access_token")
          }

        }).then(function (response) {

          console.log("--");
          console.log(response);

          if (response.status === 0) {

            alert("ERROR!");
          } else {
            if (response.data.success === true) {

              vm.itemsFound = true;
               angular.forEach(response.data.items, function (value, key) {
               value.imgPath = "img/placeholder.jpg";
               downloadItemImage(value);
               });


              console.log(response.data.items.reverse());

              console.log("parsing items to screen...");


              vm.displayItems = response.data.items;

              $rootScope.$broadcast('scroll.refreshComplete');



            } else {
              alert('Failed to get items! 1');


            }
          }

        }).catch(function (error) {
          console.log("ERROR!");
          console.log(error);
          //alert('Failed to contact server! 2');


        });

      }

      function downloadItemImage(item) {

        $timeout(function () {
          $http({
            method: "GET",
            url: window.globalVariable.address + "user/items/" + item.generatedUnique + "/icon",
            timeout: 10000,
            headers: {
              'Authorization': "Bearer " + window.localStorage.getItem("id_token"),
              'Authentication': "Bearer " + window.localStorage.getItem("itemax_access_token")
            },
            responseType: "arraybuffer"

          }).then(function (response) {
            console.log("RESPONSE IS : ");
            console.log(response);

            var blob = new Blob([response.data], {type: "image/jpeg"});
            item.imgPath = URL.createObjectURL(blob);
          }).catch(function (error) {
            console.log(error);
          });
        }, 1000);
      } // function downloadImage ends

      function login() {
        $state.go("login");
      }

      function gotouser() {
        $state.go("user");
      }

      function getDeviceInfo() {
        $state.go("device");
      }

      function logout() {
        alert("Logging out! Good bye!");
        authService.logout;
        $state.go("login");
      }

      vm.addItem = function () {

        var options = {
          quality: 10,           // Higher is better
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: false,
          encodingType: Camera.EncodingType.JPEG,
          width: 600,
          height: 450,
          //      popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation: true
          //  encodingType : Camera.EncodingType.PNG
        };

        console.log("camera options");
        console.log(options);

        $cordovaCamera.getPicture(options).then(function (imageData) {
          vm.imgPath = "data:image/jpeg;base64," + imageData;
        }, function (err) {
          // An error occured. Show a message to the user
        });
      }

      vm.popup = function (text) {
        alert(text);
      }


      vm.loadMore();

    }



}());
