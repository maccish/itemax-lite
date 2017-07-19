(function () {

  'use strict';

  angular
    .module('app')
    .controller('DeviceController', DeviceController);

  DeviceController.$inject = ['$state', '$timeout', '$http', 'itemService'];

  function DeviceController($state, $timeout, $http, itemService) {

    var vm = this;
    vm.device = [];
    vm.item = [];

    vm.getdevicedetails = getDeviceDetails;
    vm.registerButtonDisabled = true;
    getDeviceDetails();


    function getDeviceDetails() {
        /*********************** get device information **************************/
        ionic.Platform.ready(function () {
            // will execute when device is ready, or immediately if the device is already ready.
        });

        console.log("device object:");
        console.log(ionic.Platform.device());

        vm.device = ionic.Platform.device();
        vm.device.manufacturer = vm.device.manufacturer.toUpperCase();

        if (vm.device.isVirtual) {
          vm.registerButtonDisabled = true;
        } else {
          vm.registerButtonDisabled = false;
        }


        console.log(vm.registerButtonDisabled);


        /*************************************************************************/
    }


    vm.addItem = function (device) {

        var item = [];

        item.name = device.manufacturer + " " + device.model;
        item.information = device.platform + " version=" + device.version + " serial=" + device.serial;
        item.category = "";
        item.location = "Tampere";

        itemService.addItem(item);
        $state.go("home");

    };

    vm.test = function () {
      itemService.myLocation();
    }
  }



  }());


