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

                functions.onStartInit($('#orderIdSelect').val());

                $('#orderIdSelect').change(function() {
                    functions.onStartInit($('#orderIdSelect').val());

                    map.setZoom(11)
                    if (markersArray) {
                        for (i in markersArray) {
                            markersArray[i].setMap(null);
                        }
                        markersArray.length = 0;
                    }
                });

                setInterval(function(){
                    functions.onStartInit($('#orderIdSelect').val());
                }, 5 * 1000);
            });
        });




    }, addMarker: function(latitude, longitude){
        let marker = new google.maps.Marker({
            map: map,
            draggable: false,
            position: new google.maps.LatLng(latitude, longitude)
        });

        markersArray.push(marker);

    }, onStartInit: function(id) {

        let settings = {
            'async': true,
            'crossDomain': true,
            'url': window.location.origin + '/orders?orderId=' + id,
            'method': 'GET',
            'headers': {
                'cache-control': 'no-cache'
            }
        };

        $.ajax(settings).done(function (response) {

            $('#orderId').html(response.orderId);
            $('#orderStatus').html(response.orderStatus);
            $('#orderOrigin').html(response.origin_address);
            $('#orderDestination').html(response.destination_address);
            $('#orderTimestamp').html(Date(response.timestamp));

            let originSplit = response.origin.split(',');
            let destinationSplit = response.destination.split(',');

            functions.populateTableRow(response);

            let request = {
                origin: new google.maps.LatLng(originSplit[0], originSplit[1]),
                destination: new google.maps.LatLng(destinationSplit[0], destinationSplit[1]),
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {

                    if(!directionsDisplay.directions || (directionsDisplay.directions.request.origin.location.lat() !== response.request.origin.location.lat() && directionsDisplay.directions.request.origin.location.lng() !== response.request.origin.location.lng() && directionsDisplay.directions.request.destination.location.lat() !== response.request.destination.location.lat() && directionsDisplay.directions.request.destination.location.lng() !== response.request.destination.location.lng())){

                        directionsDisplay.setDirections(response);
                    }
                } else {
                    functions.addMarker(originSplit[0], originSplit[1]);
                    functions.addMarker(destinationSplit[0], destinationSplit[1]);
                    map.setCenter(new google.maps.LatLng(destinationSplit[0], destinationSplit[1]));
                }
            });

        });
    }, populateTableRow: function(populatingData) {

        $('#oderListTableBody').html('');

        let i;
        for (i = 0; i < populatingData.notifiedDrivers.length; i += 1) {
            if(populatingData.orderStatus === 'REQUEST_PENDING'){

                $('#oderListTableBody').append('' +
                    '<tr >\n' +
                    '    <td>' + (i + 1) + '</td>\n' +
                    '    <td>' + populatingData.notifiedDrivers[i].key + '</td>\n' +
                    '    <td>' + populatingData.notifiedDrivers[i].distance + '</td>\n' +
                    '    <td>' + populatingData.notifiedDrivers[i].rating + '</td>\n' +
                    '    <td>' +
                    '        <button type="submit" class="btn btn-primary pull-right" onclick="functions.acceptOrder(\''+ populatingData.orderId + '\', \'' + populatingData.notifiedDrivers[i].key + '\');">Accept Order</button>' +
                    '    </td>\n' +
                    '</tr>');

            }else {

                if(populatingData.notifiedDrivers[i].key === populatingData.orderAccepter){
                    $('#oderListTableBody').append('' +
                        '<tr >\n' +
                        '    <td>' + (i + 1) + '</td>\n' +
                        '    <td>' + populatingData.notifiedDrivers[i].key + '</td>\n' +
                        '    <td>' + populatingData.notifiedDrivers[i].distance + '</td>\n' +
                        '    <td>' + populatingData.notifiedDrivers[i].rating + '</td>\n' +
                        '    <td class="text-primary">Fair Accepted</td>\n' +
                        '</tr>');
                }else {
                    $('#oderListTableBody').append('' +
                        '<tr >\n' +
                        '    <td>' + (i + 1) + '</td>\n' +
                        '    <td>' + populatingData.notifiedDrivers[i].key + '</td>\n' +
                        '    <td>' + populatingData.notifiedDrivers[i].distance + '</td>\n' +
                        '    <td>' + populatingData.notifiedDrivers[i].rating + '</td>\n' +
                        '    <td class="text-primary">Not Responded</td>\n' +
                        '</tr>');
                }
            }

            let marker = new google.maps.Marker({
                map: map,
                draggable: false,
                icon: window.location.origin + '/Food_app/assets/img/car.png',
                position: new google.maps.LatLng(populatingData.notifiedDrivers[i].latitude, populatingData.notifiedDrivers[i].longitude)
            });

            markersArray.push(marker);
        }

    }, acceptOrder: function (orderId, driverId) {

        let jsonData = {
            orderId: orderId,
            driverId: driverId
        };

        var settings = {
            'async': true,
            'crossDomain': true,
            'url': window.location.origin + '/orders',
            'method': 'POST',
            'headers': {
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            },
            'processData': false,
            'data': JSON.stringify(jsonData)
        }

        $.ajax(settings).done(function (response) {

            $('#orderId').html(response.orderId);
            $('#orderStatus').html(response.orderStatus);
            $('#orderOrigin').html(response.origin);
            $('#orderDestination').html(response.destination);
            $('#orderTimestamp').html(Date(response.timestamp));

            functions.populateTableRow(response);

        });

    }, mapInit : function initialize() {
         let mapDiv = document.getElementById('map-canvas');
         map = new google.maps.Map(mapDiv, {
             center: new google.maps.LatLng(6.84, 79.89),
             zoom: 11,
             mapTypeId: google.maps.MapTypeId.ROADMAP,
             gestureHandling: 'cooperative'
         });

        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);

    }

};

let map, markersArray = [], directionsService, directionsDisplay;