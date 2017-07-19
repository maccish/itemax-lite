(function () {

  'use strict';

  angular
    .module('app')
    .controller('serviceController', serviceController);

  serviceController.$inject = ['$state', '$cordovaGeolocation', '$ionicLoading', '$ionicPlatform', '$http', '$location', '$rootScope', '$ionicScrollDelegate', '$timeout'];

  function serviceController($state, $cordovaGeolocation, $ionicLoading, $ionicPlatform, $http, $location, $rootScope, $ionicScrollDelegate, $timeout) {

    var vm = this;
    vm.showMap = true;
    vm.showList = false;
    vm.showRange = false;
    vm.showDetails = false;
    var vmmap = {};
    var temp = [];
    vm.services = "";
    vm.spDetails = "";
    vm.SearchWord = "Car";
    vm.SearchType = "Repair";
    vm.mapBtnName = "List";
    vm.emptySearchResultMessage = "";
    var mapOptions = {};
    var gMapUrl = 'https://maps.googleapis.com/maps/api/place';
    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var labelIndex = 0;
    var googleKey = "AIzaSyBkNNf7NM4yxBBAe76VuxbuFo-6Av3Rk3o";
    var previousLocationLat = "";
    var previousLocationLong = "";

    vm.showRange = function () {
      vm.rangeVisible = true;
      $timeout(function(){
        $ionicScrollDelegate.$getByHandle('myScroll').scrollTop(true);
      },50)
    }

    $ionicPlatform.ready(function() {

      $ionicLoading.show({
        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
      });

      var posOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      };

      /* http://www.gajotres.net/using-cordova-geoloacation-api-with-google-maps-in-ionic-framework/ */
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        vm.mylat  = position.coords.latitude;
        vm.mylong = position.coords.longitude;

        //vm.mylat = 63.8964465; // Sonkajärvi
        //vm.mylong = 27.7592433; // Sonkajärvi
        //vm.mylat = 59.8964465; // Gulf of Finland
        //vm.mylong = 24.7592433; // Gulf of Finland
        //vm.mylat = 60.1964465; // Helsinki
        //vm.mylong = 24.9592433; // Helsinki
        //vm.mylat = 56.9664465; // RIga
        //vm.mylong = 24.0492433; // RIga
        //vm.mylat = 53.9600000; // York, UK
        //vm.mylong = -1.08730000; // York, UK
        //vm.mylat = 61.792466;
        //vm.mylong = 34.339335;

        /* COMMENTING OUT AS THIS IS SET IN SEARCH FUNCTION
        var myLatlng = new google.maps.LatLng(vm.mylat, vm.mylong);

        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var vmmap = new google.maps.Map(document.getElementById("map"), mapOptions);
*/
        function codeLatLng(lat, lng) {
          console.log("Coordinates: " + lat + " " + lng);
          var latlng = new google.maps.LatLng(lat, lng);
          var city = [];
          var postalcode = [];
          var country = [];


          var geocoder;
          geocoder = new google.maps.Geocoder();

          geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              console.log("starting to parse city name");
              console.log(results);
              if (results[1]) {

                //find country name
                for (var i=0; i<results[0].address_components.length; i++) {
                  for (var b=0; b<results[0].address_components[i].types.length; b++) {

                    //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                    if (results[0].address_components[i].types[b] === "postal_code") {
                      //this is the object you are looking for
                      postalcode= results[0].address_components[i];
                      break;
                    } else

                    //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                    if (results[0].address_components[i].types[b] === "locality") {
                      //this is the object you are looking for
                      city= results[0].address_components[i];
                      break;
                    } else

                    //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                    if (results[0].address_components[i].types[b] === "country") {
                      //this is the object you are looking for
                      country= results[0].address_components[i];
                      break;
                    }
                  }
                }

                //console.log(city);
                //console.log(postalcode);
                //console.log(country);

                //formatted address
                vm.city_short = city.short_name;
                vm.city_long = city.long_name;
                vm.country_long = country.long_name;
                vm.country_short = country.short_name;
                vm.postal_code = postalcode.short_name;
                vm.language = vm.country_short.toLowerCase();

                console.log("Check: " + vm.city_short);

                if (vm.city_short === "" || vm.city_short === undefined) {
                  vm.city_short = vm.postal_code + ", " + vm.country_short;
                  vm.city_long = vm.postal_code + ", " + vm.country_long;
                }

                //vm.search.city = vm.city_long; CHECK!

                //console.log("stateParams.itemKeyword :" + $stateParams.itemKeyWord);

                vm.searchBox = vm.itemKeyWord;


              } else {
                alert("Not able to find location");
              }
            } else {
              alert("Finding location failed: " + status);
            }
          });
        }

        // resolve the city name
        if (previousLocationLat !== vm.mylat || previousLocationLong !== vm.myLong) {
          codeLatLng(vm.mylat, vm.mylong);
        }

        vm.searchThis(vm.SearchWord, vm.SearchType, vm.mylat , vm.mylong, "10000", vmmap);
        $ionicLoading.hide();

      }, function(err) {
        $ionicLoading.hide();
        console.log(err);
      });
    })

    vm.swapView = function (mapOn) {
      vm.showMap = mapOn;
      vm.showList = !mapOn;
      if (mapOn) {
        vm.mapBtnName = "List";
      } else {
        vm.mapBtnName = "Map";
      }
    }

    // Adds a marker to the map.
    function addMarker(location, map, serviceprovider) {
      console.log("Starting addMarker for " + serviceprovider.name);
      // Add the marker at the clicked location, and add the next-available label
      // from the array of alphabetical characters.
      var marker = new google.maps.Marker({
        position: location,
        //label: labels[labelIndex++ % labels.length],
        label: serviceprovider.name,
        map: map
      });

      marker.addListener('click', function() {
        infowindow.open(map, marker);
      });


      console.log(serviceprovider);
      var contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading">' + serviceprovider.name + '</h1>'+
        '<div id="bodyContent">'+
        '<p><b>Rating: ' + serviceprovider.rating + ' out of 5</b></p>' +
        '<p>' + vm.serviceDetails.website + '</p>' +
        '</p>'+
        '</div>'+
        '</div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });

      return marker.getPosition();
    }



    vm.searchThis = function (keyw, type, userlat, userlong, radius) {
      var allDone = "";

      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      if (userlat === undefined || userlong === undefined || keyw === undefined) {
        alert("Error with empty keyword or missing location!");
        return;
      }

      if (radius === undefined || radius === 0) {
        radius = 10000;
      }

      $ionicLoading.show({
        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Finding services!'
      });

      vm.SearchWord = keyw;
      keyw = keyw + ' ' + type;

      var userLatLng = new google.maps.LatLng(userlat, userlong);

      mapOptions = {
        center: userLatLng,
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      vmmap = new google.maps.Map(document.getElementById("map"), mapOptions);

      var tag;

      tag = keyw.replace(/\s+/g, '+').toLowerCase();
      tag = tag.replace(/_/g, '+').toLowerCase();

      console.log("Executing search for '" + tag + "' and '" + userlat + ',' + userlong + "' in radius " + radius);
      console.log(gMapUrl + "/nearbysearch/json?radius=" + radius + "&key=" + googleKey + "&keyword=" + tag + "&location=" + userlat + ',' + userlong);

      if (tag !== "") {

        $http({
            method: "GET",
            url: gMapUrl + "/nearbysearch/json?radius=" + radius + "&key=" + googleKey + "&keyword=" + tag + "&location=" + userlat + ',' + userlong,
            timeout: 10000
        }).then(function (response) {

          console.log(response);

          vm.services = response.data.results;
          console.log(vm.services);

          if(vm.services.length === 0) {
            vm.searchResultMessage = "No services found. Try to change search range."
          } else {
            vm.searchResultMessage = "Services for '" + keyw + "' in range of " + radius/1000 + " km from your location:";
            for (var i = 0; i < vm.services.length; i++) {

              if (vm.services[i].geometry.location != null && vm.services[i].geometry.location.lat != null && vm.services[i].geometry.location.lng != null) {

                vm.serviceDetails(vm.services[i]);


              }

              /******************* CHECK AGAIN, DIDN'T WORK BECAUSE OPEN_NOW NOT EXISTING FOR SOME SERVICES
               // decorate opening hours for UI
               if (typeof vm.services[i].opening_hours.open_now !== null && vm.services[i].opening_hours.open_now !== "undefined") {
                if (vm.services[i].opening_hours.open_now === false) {
                  vm.services[i].opening_hours.open_now = "Closed for today";
                }
                else {
                  vm.services[i].opening_hours.open_now = "Open";
                }
              }
               **********/

              // let's change '_' to spaces in tag contents
              for (var j = 0; j < vm.services[i].types.length; j++) {
                vm.services[i].types[j] = vm.services[i].types[j].replace(/_/g, ' ').toLowerCase();
              }

            }
            for (var k = 0; k < vm.services.length; k++) {
              var serviceLatlng = new google.maps.LatLng(vm.services[k].geometry.location.lat, vm.services[k].geometry.location.lng);
              addMarker(serviceLatlng, vmmap, vm.services[k]);
            }

          }

          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          $timeout(function(){
            $ionicScrollDelegate.$getByHandle('myScroll').scrollTop(true);
          },50)

          vmmap.setZoom(13);
          vmmap.setCenter(addMarker(userLatLng, vmmap, '[name: "You are here"]'));


          vm.map = vmmap;
          vm.rangeVisible = false;
          $ionicLoading.hide();
          $rootScope.$broadcast('scroll.refreshComplete');


        }).catch(function (error) {

          // Catch and handle exceptions from success/error/finally functions
        });
      }
    }

    vm.serviceDetails = function(service) {

      console.log("Finding service details");
      console.log(service);
      console.log(gMapUrl + "/details/json?key=" + googleKey + "&place_id=" + service.place_id);
      $http({
        method: "GET",
        url: gMapUrl + "/details/json?key=" + googleKey + "&place_id=" + service.place_id,
        timeout: 10000
      }).then(function (res) {
        console.log("serviceDetails: ");
        vm.spDetails = res.data.result;
        console.log(vm.spDetails);

      }).catch(function (error) {
        console.log(error);
        // Catch and handle exceptions from success/error/finally functions
      });

    }

    vm.showserviceDetails = function (service) {
      vm.showDetails = true;
      vm.showMap = false;
      vm.showList = false;
      vm.showRange = false;
      vm.serviceDetails(service);
    }

    vm.closeserviceDetails = function () {
      vm.showDetails = false;
      vm.showMap = false;
      vm.showList = true;
      vm.showRange = false;
    }




    }
}());
