$(document).ready(function() {
    functions.getAPIkey();
});

let functions = {

    getAPIkey: function () {

        let settings = {
            'async': true,
            'crossDomain': true,
            'url': window.location.origin + '/apiKey',
            'method': 'GET',
            'headers': {
                'cache-control': 'no-cache'
            }
        };

        $.ajax(settings).done(function (response) {

            let loadScriptSettings = {
                'async': true,
                'crossDomain': true,
                'dataType': 'script',
                'url': 'https://maps.googleapis.com/maps/api/js?sensor=false&key=' + response.key
            };

            $.ajax(loadScriptSettings).done(function () {
                functions.mapInit();

            });
        });


    }, mapInit : function initialize() {
        let mapDiv = document.getElementById('map-canvas');

        map = new google.maps.Map(mapDiv, {
            center: new google.maps.LatLng(6.84, 79.89),
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);

        $('#foodStoreLatitudeAndLongitude').val('41 Sri Medhankara Rd, Dehiwala-Mount Lavinia, Sri Lanka');
        functions.addMarker('Restaurant', 6.850740, 79.873541);
        functions.addMarker('User',  6.794126, 79.908880);

        $('#UserAddressLatitudeAndLongitude').val('Deniya Rd, Piliyandala, Sri Lanka');


        functions.calculateDistance('6.850740,79.873541', '6.794126,79.908880');
        
    }, clearMarkers: function(){
        map.setZoom(11)
        if (markersArray) {
            for (let i in markersArray) {
                markersArray[i].setMap(null);
            }
            markersArray.length = 0;
        }
    }, addMarker: function(type, latitude, longitude){

        let markerobject = new google.maps.Marker({
            map: map,
            draggable: true,
            position: new google.maps.LatLng(latitude, longitude),
            label: labels[labelIndex++ % labels.length]
        });

        if(type === 'Restaurant'){

            google.maps.event.addListener(markerobject, 'dragend', function(args){
                functions.calculateDistance(args.latLng.lat() + ',' + args.latLng.lng(), $('#UserAddressLatitudeAndLongitude').attr('dataUserAddressLatitudeAndLongitude'));
            });

        }else{

            google.maps.event.addListener(markerobject, 'dragend', function(args){
                functions.calculateDistance($('#foodStoreLatitudeAndLongitude').attr('dataFoodStoreLatitudeAndLongitude'), args.latLng.lat() + ',' + args.latLng.lng());
            });

        }

    }, calculateDistance: function(foodStoreLatitudeAndLongitude, userAddressLatitudeAndLongitude){

        let settings = {
            'async': true,
            'crossDomain': true,
            'url': window.location.origin + '/maps/distancematrix/?origins=' + foodStoreLatitudeAndLongitude + '&destinations=' + userAddressLatitudeAndLongitude,
            'method': 'GET',
            'headers': {
                'cache-control': 'no-cache'
            }
        };
        let originSplit = foodStoreLatitudeAndLongitude.split(','), destinationSplit = userAddressLatitudeAndLongitude.split(',');

        request = {
            origin: new google.maps.LatLng(originSplit[0], originSplit[1]),
            destination: new google.maps.LatLng(destinationSplit[0], destinationSplit[1]),
            travelMode: google.maps.TravelMode.DRIVING
        };

        $.ajax(settings).done(function (response) {

            if(response.length > 0){
                response[0].destination = userAddressLatitudeAndLongitude;
                response[0].origin = foodStoreLatitudeAndLongitude;
                functions.setInputValuse(response[0]);
            }
        });

    }, setInputValuse: function(response){

        $('#UserAddressLatitudeAndLongitude').attr('dataUserAddressLatitudeAndLongitude', response.destination);
        $('#UserAddressLatitudeAndLongitude').val(response.destination_address);

        $('#foodStoreLatitudeAndLongitude').attr('dataFoodStoreLatitudeAndLongitude', response.origin);
        $('#foodStoreLatitudeAndLongitude').val(response.origin_address);

        let km = response.distance.value / 1000, baseprice = Math.round((response.distance.value / 1000) * 40);

        $('#distance').val(km.toFixed(2) + ' Km');
        $('#basePrice').val(baseprice.toFixed(2) + '/=');
        $('#duration').val(response.duration.text);

        /*
        directionsService.route(request, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });
        */

    }, showDrivers: function () {

        let orderJson = {
            foodStoreLatitudeAndLongitude: $('#foodStoreLatitudeAndLongitude').attr('dataFoodStoreLatitudeAndLongitude'),
            UserAddressLatitudeAndLongitude: $('#UserAddressLatitudeAndLongitude').attr('dataUserAddressLatitudeAndLongitude')
        };

        let settings = {
            'async': true,
            'crossDomain': true,
            'url': window.location.origin + '/orders/available/vehicles?origin_latitude_longitude=' + orderJson.foodStoreLatitudeAndLongitude + '&destination_latitude_longitude=' + orderJson.foodStoreLatitudeAndLongitude + '&timestamp=1529222131192&payment_method=1',
            'method': 'GET',
            'headers': {
                'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImN1c3RvbWVyMDEiLCJpYXQiOjE1MjkzMTYxMzAsImV4cCI6MTUyOTQwMjUzMH0.peHrJA-yJf5GrmXQ8LhkLYFiSo4ECKumoQpPvheRmG4',
                'cache-control': 'no-cache'
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('jqXHR: ');
                console.log(jqXHR);
                console.log('textStatus: ');
                console.log(textStatus);
                console.log('errorThrown: ');
                console.log(errorThrown);
            }
        };

        $.ajax(settings).done(function (response) {

            functions.clearMarkers();

            for(let i = 0; i < response.data.availableVehicles.length; i +=1) {

                let markerobject = new google.maps.Marker({
                    map: map,
                    draggable: false,
                    icon: window.location.origin + '/Food_app/assets/img/car.png',
                    position: new google.maps.LatLng(response.data.availableVehicles[i].latitude, response.data.availableVehicles[i].longitude)
                });

                markersArray.push(markerobject);
            }

        });

    }, orderSubmit: function () {

        let orderJson = {
            origin_latitude_longitude: $('#foodStoreLatitudeAndLongitude').attr('dataFoodStoreLatitudeAndLongitude'),
            destination_latitude_longitude: $('#UserAddressLatitudeAndLongitude').attr('dataUserAddressLatitudeAndLongitude'),
            timestamp: Date.now(),
            payment_method: 1
        };

        let settings = {
            'async': true,
            'crossDomain': true,
            'url': window.location.origin + '/orders/available/vehicles',
            'method': 'POST',
            'headers': {
                'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImN1c3RvbWVyMDEiLCJpYXQiOjE1MjkzMTYxMzAsImV4cCI6MTUyOTQwMjUzMH0.peHrJA-yJf5GrmXQ8LhkLYFiSo4ECKumoQpPvheRmG4',
                'cache-control': 'no-cache'
            },
            'data': orderJson,
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('jqXHR: '); console.log(jqXHR);
                console.log('textStatus: '); console.log(textStatus);
                console.log('errorThrown: '); console.log(errorThrown);

                $('#exampleModal').modal();
                $('#exampleModalLabel').html('Error');
                $('#exampleModalBody').html('Error, P]please try again later!!');
            }
        };

        $.ajax(settings).done(function (response) {
            $('#exampleModal').modal();
            $('#exampleModalLabel').html('Success');
            $('#exampleModalBody').html('Order has been successfully made!!');
        });

    }

};


let map, markersArray = [], labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', labelIndex = 0, directionsService, directionsDisplay, request;


