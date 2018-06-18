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

                functions.initFrom($('#orderId').val());

                $('#orderId').change(function() {
                    functions.initFrom($('#orderId').val());
                });
            });
        });


    }, mapInit : function initialize() {
        let mapDiv = document.getElementById('map-canvas');

        map = new google.maps.Map(mapDiv, {
            center: new google.maps.LatLng(6.84, 79.89),
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        
    }, clearMarkers: function(){
        map.setZoom(11)
        if (markersArray) {
            for (let i in markersArray) {
                markersArray[i].setMap(null);
            }
            markersArray.length = 0;
        }
    }, getUserCurrentAddress: function(latitude, longitude){

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(function(position) {
                /*
                let pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                */
                setMarker();

            }, function() {
                setMarker();
            });
        } else {
            setMarker();
        }

        function setMarker() {
            let pos = {
                lat: latitude,
                lng: longitude
            };

            map.setCenter(new google.maps.LatLng(pos.lat, pos.lng));

            functions.calculateDistance($('#foodStoreLatitudeAndLongitude').attr('dataFoodStoreLatitudeAndLongitude'), pos.lat + ',' + pos.lng);
            functions.addMarker('User', pos.lat, pos.lng);
        }

    }, addMarker: function(type, latitude, longitude){

        let markerobject = new google.maps.Marker({
            map: map,
            draggable: true,
            position: new google.maps.LatLng(latitude, longitude)
        });

        markersArray.push(markerobject);

        if(type === 'Restaurant'){

            google.maps.event.addListener(markerobject, 'dragend', function(args){
                functions.calculateDistance(args.latLng.lat() + ',' + args.latLng.lng(), $('#UserAddressLatitudeAndLongitude').attr('dataUserAddressLatitudeAndLongitude'));
            });

        }else{

            google.maps.event.addListener(markerobject, 'dragend', function(args){
                functions.calculateDistance($('#foodStoreLatitudeAndLongitude').attr('dataFoodStoreLatitudeAndLongitude'), args.latLng.lat() + ',' + args.latLng.lng())
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

        $.ajax(settings).done(function (response) {

            if(response.length > 0){
                response[0].destination = userAddressLatitudeAndLongitude;
                response[0].origin = foodStoreLatitudeAndLongitude;
                functions.setInputValuse(response[0]);
            }
        });

    }, initFrom: function(dropDownVal){

        let settings = {
            'async': true,
            'crossDomain': true,
            'url': window.location.origin + '/orders?orderId=' + dropDownVal,
            'method': 'GET',
            'headers': {
                'cache-control': 'no-cache'
            }
        };

        $.ajax(settings).done(function (response) {

            functions.clearMarkers();

            functions.setInputValuse(response);
            let originSplit = response.origin.split(',');
            let destinationSplit = response.destination.split(',');

            functions.addMarker('Restaurant', originSplit[0], originSplit[1]);
            functions.getUserCurrentAddress(destinationSplit[0], destinationSplit[1]);

        });

    }, setInputValuse: function(response){

        $('#UserAddressLatitudeAndLongitude').attr('dataUserAddressLatitudeAndLongitude', response.destination);
        $('#UserAddressLatitudeAndLongitude').val(response.destination_address);

        $('#foodStoreLatitudeAndLongitude').attr('dataFoodStoreLatitudeAndLongitude', response.origin);
        $('#foodStoreLatitudeAndLongitude').val(response.origin_address);

        $('#distance').val(response.distance.text);
        $('#basePrice').val(Math.round((response.distance.value / 1000) * 40).toFixed(2) + '/=');
        $('#duration').val(response.duration.text);

    }, orderSubmit: function () {

        let orderJson = {
            orderId: $('#orderId').val(),
            foodStoreLatitudeAndLongitude: $('#foodStoreLatitudeAndLongitude').attr('dataFoodStoreLatitudeAndLongitude'),
            UserAddressLatitudeAndLongitude: $('#UserAddressLatitudeAndLongitude').attr('dataUserAddressLatitudeAndLongitude')
        };

        $('#orderId').val(''); $('#foodStoreLatitudeAndLongitude').val(''); $('#UserAddressLatitudeAndLongitude').val('');
        $('#distance').val(''); $('#basePrice').val(''); $('#duration').val('');

        let settings = {
            'async': true,
            'crossDomain': true,
            'url': window.location.origin + '/drivers/available?orderId=' + orderJson.orderId + '&origin=' + orderJson.foodStoreLatitudeAndLongitude + '&destination=' + orderJson.UserAddressLatitudeAndLongitude,
            'method': 'POST',
            'headers': {
                'cache-control': 'no-cache'
            }
        };

        $.ajax(settings).done(function (response) {
            // console.log(response);
            console.log('Successfully ordered');
        });

    }, showDrivers: function () {
        let orderJson = {
            orderId: $('#orderId').val(),
            foodStoreLatitudeAndLongitude: $('#foodStoreLatitudeAndLongitude').attr('dataFoodStoreLatitudeAndLongitude'),
            UserAddressLatitudeAndLongitude: $('#UserAddressLatitudeAndLongitude').attr('dataUserAddressLatitudeAndLongitude')
        };

        let settings = {
            'async': true,
            'crossDomain': true,
            'url': window.location.origin + '/drivers/available?orderId=' + orderJson.orderId + '&origin=' + orderJson.foodStoreLatitudeAndLongitude + '&destination=' + orderJson.UserAddressLatitudeAndLongitude,
            'method': 'GET',
            'headers': {
                'cache-control': 'no-cache'
            }
        };

        $.ajax(settings).done(function (response) {

            let i, j;

            for(i = 0; i < response.data.length; i +=1){

                for(j = 0; j < response.data[i].length; j +=1){
                    console.log()

                    let markerobject = new google.maps.Marker({
                        map: map,
                        draggable: false,
                        icon: window.location.origin + '/Food_app/assets/img/car.png',
                        position: new google.maps.LatLng(response.data[i][j].latitude, response.data[i][j].longitude)
                    });

                    markersArray.push(markerobject);
                }
            }

        });
    }

};


let map, markersArray = [];