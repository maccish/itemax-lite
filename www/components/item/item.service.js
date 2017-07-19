(function () {

  'use strict';

  angular
    .module('app')
    .service('itemService', itemService);

  itemService.$inject = ['$state', '$timeout', '$http'];

  function itemService($state, $timeout, $http) {

    vm.item = JSON.parse($state.params.object);
    var vm = this;
    var userItems = [];

    vm.addDevice = function (device) {
      console.log("Starting to add a new device");
      console.log(device);

      if (vm.checkItemExists(device)) {
        console.log("Device already exists");
        alert("Device already registered!");
      }
      else
        {
          device.tags = "phone, mobile phone, smartphone";
          console.log("Device not exists");
          vm.addItem(device);
        }

      }

    vm.addItem = function(newItem) {

      console.log("starting to add an item");
      console.log(newItem);


      if (newItem.name !== undefined &&
        newItem.information !== undefined) {


          $http({
            method: "POST",
            url: window.globalVariable.address + "user/items",
            timeout: 10000,
            headers: {
              'Authorization': "Bearer " + window.localStorage.getItem("id_token"),
              'Authentication': "Bearer " + window.localStorage.getItem("itemax_access_token")
            },
            data: {
              item: {
                name: newItem.name,
                category: "",
                information: newItem.information,
                location: newItem.location,
                tagCombined: newItem.tags
              }
            }
          }).then(function (response) {

            console.log(response.data);

            if (response.data.success === true) {

              alert('Your ' + newItem.name + ' added successfully!');


            } else {
              alert('Error while adding your ' + newItem.name + '!');
            }

          }).catch(function (error) {
            console.log("ERROR!");
            console.log(error);
          });

      } else {

        console.log("Missing required information!");
        alert("Missing required information!");
      }
    }

    vm.checkItemExists = function(currentDevice) {
      console.log("getting all user items...");
      $timeout(function () {
        $http({
          method: "GET",
          url: window.globalVariable.address + "user/items",
          timeout: 10000,
          headers: {
            'Authorization': "Bearer " + window.localStorage.getItem("id_token"),
            'Authentication': "Bearer " + window.localStorage.getItem("itemax_access_token")
          }
        }).then(function (response) {
          console.log("Starting to compare existing and new items");
          console.log(response);
          console.log(currentDevice);
          console.log("--");
          if (response.status === 0) {
            alert("ERROR!");
          } else {
            if (response.data.success === true) {
              var oldDevice = false;
              for (var i = 0; i < response.data.items.length; i++) {
                console.log(response.data.items[i].information +"==="+ currentDevice.information);
                console.log(response.data.items[i].name +"==="+ currentDevice.name);
                  if (response.data.items[i].information === currentDevice.information &&
                    response.data.items[i].name === currentDevice.name) {
                    console.log("Found it!");
                    oldDevice = true;
                    break;
                  }
              }

              return oldDevice;


            } else {
              alert("Failed to get items! 1");
            }

          }
        }).catch(function (error) {
          console.log("ERROR!");
          console.log(error);
          // Catch and handle exceptions from success/error/finally functions
        });

      }, 1000);
    }

    vm.getItemDetails = function (item) {
      console.log("getting user item...");
      console.log(item);

      $timeout(function () {
        $http({
          method: "GET",
          url: window.globalVariable.address + "user/items/" + item.generatedUnique + "/image",
          timeout: 10000,
          headers: {
            'Authorization': "Bearer " + window.localStorage.getItem("id_token"),
            'Authentication': "Bearer " + window.localStorage.getItem("itemax_access_token")
          },
          responseType: "arraybuffer"
        }).then(function (response) {
          console.log(response);
          if (response.status === 0) {
            alert("ERROR!");
          } else {
            if (response.data.success === true) {
              var blob = new Blob([response.data], {type: "image/jpeg"});
              vm.imgPath = URL.createObjectURL(blob);

            } else {
              alert("Failed to get items! 1");
            }

          }
        }).catch(function (error) {
          console.log("ERROR!");
          console.log(error);
          // Catch and handle exceptions from success/error/finally functions
        });

      }, 1000);

    }

  };
}());

