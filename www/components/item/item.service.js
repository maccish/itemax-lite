(function () {

  'use strict';

  angular
    .module('app')
    .service('itemService', itemService);

  itemService.$inject = ['$state', '$timeout', '$http', '$cordovaCamera'];

  function itemService($state, $timeout, $http, $cordovaCamera) {

    //vm.item = JSON.parse($state.params.object);
    var vm = this;
    var userItems = [];
    vm.newId = "";
    vm.item = new Object();
    vm.item.tags = [];
    var test = "";

    vm.addNewItem = function () {
      vm.takeImage()
        .then(vm.recognizeItemImage())
          .then(function (){
            vm.item.name = vm.item.tags[0] + " " + vm.item.tags[1];
            vm.item.information = "No info yet";
            vm.item.location = "None";

            console.log(vm.item);
      });

      /*
      console.log(phototrue);
      if(phototrue) {
        console.log("go to rec");
        console.log(vm.item.imgPath);


        vm.item.name = vm.item.tags[0] + " " + vm.item.tags[1];
        vm.item.information = "No info yet";
        vm.item.location = "None";

        console.log(vm.item);
        //vm.addItemDetails(vm.item);
      }*/
    }

    vm.takeImage = function () {
      var promise = new Promise(function(resolve, reject) {

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
          resolve("data:image/jpeg;base64," + imageData);
        }, function (err) {
          console.log(err);
          // An error occured. Show a message to the user
        });
      });
      return promise;
    }


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
          vm.addItemDetails(device);
        }

      }

    vm.addItemDetails = function(newItem) {

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

              vm.newId = response.data.Id;

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
    };

    vm.recognizeItemImage = function(imagePath) {
      var promise = new Promise(function(resolve, reject) {

        var personInPicture = false;

        console.log("uploading to recognize the item.......");
        console.log(imagePath);

        var win = function (r) {
          // downloadImage();
          console.log("UPLOAD TO RECOGNIZE SUCCESS! * * * * * ");
          var jsonObject = JSON.parse(r.response);
          var preCheckTag = true;
          console.log(jsonObject.results[0].result);


          console.log("Processing the keywords ");

          for (var i = 0; i < jsonObject.results[0].result.tag.classes.length; i++) {
            if (jsonObject.results[0].result.tag.classes[i] != "no person") {
              vm.item.tags.push({
                name: jsonObject.results[0].result.tag.classes[i],
                prechecked: preCheckTag,
                probability: jsonObject.results[0].result.tag.probs[i]
              });

              // only top 5 tags will be prechecked
              if (i > 4) {
                preCheckTag = false;
              }

            }

            /* Commenting out because still in too early stage
             if
             (jsonObject.results[0].result.tag.classes[i] === "person" ||
             jsonObject.results[0].result.tag.classes[i] === "people" ||
             jsonObject.results[0].result.tag.classes[i] === "man" ||
             jsonObject.results[0].result.tag.classes[i] === "woman" ||
             jsonObject.results[0].result.tag.classes[i] === "boy" ||
             jsonObject.results[0].result.tag.classes[i] === "girl") {

             bannedTags.push(jsonObject.results[0].result.tag.classes[i]);
             personInPicture = true;
             }
             */

          }
          console.log(vm.item.tags);
          resolve(vm.item.tags);

          /**********
           if (personInPicture) {
            $scope.rectags = [];
            $scope.pictureFailed();
            $scope.nextSlide = false;
          } else {
            $scope.emptyTagMessage = "";
            $scope.nextSlide = true;
            $ionicSlideBoxDelegate.update();
            $scope.textToTakePicture = swipeRightTxt;
            $scope.recognitiondone = true;
            $scope.moveToNextSlide(1);

          }
           ***************/


        };

        var fail = function (error) {
          console.log("error recognizing image:");
          console.log(error);
        };

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = "item_recognize";
        options.mimeType = "image/jpeg";
        options.httpMethod = 'POST';

        options.headers = {
          //'x-access-token': window.localStorage.getItem("itemaxToken")
          'Authorization': "Bearer " + window.localStorage.getItem("id_token"),
          'Authentication': "Bearer " + window.localStorage.getItem("itemax_access_token")
        };

        var ft = new FileTransfer();

        //////$scope.loadingStatus = {};

        ft.upload(imagePath, encodeURI(window.globalVariable.address + "user/items/recognize/"), win, fail, options);
      });
      return promise;

    };

    function uploadItemImage(generatedUnique, imagePath) {

      console.log("uploading the image on server...");

      var win = function () {
        // downloadImage();
        console.log("UPLOAD SUCCESS! * * * * * ");
      };

      var fail = function (error) {
        //  alert("An error has occurred: Code = " + error.code);
        console.log("error uploading image");
        console.log(error);
      };

      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = "item" + generatedUnique;
      options.mimeType = "image/jpeg";
      options.httpMethod = 'PUT';

      options.headers = {
        'Authorization': "Bearer " + window.localStorage.getItem("id_token"),
        'Authentication': "Bearer " + window.localStorage.getItem("itemax_access_token")

      };

      var ft = new FileTransfer();


      ft.upload(imagePath, encodeURI(window.globalVariable.address + "user/items/" + generatedUnique), win, fail, options);

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

