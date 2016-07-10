/**
 * Created by aitor on 10/7/16.
 */
$(document).ready(function() {
    var url = 'https://bip05.upc.es:5000';
    var msgs = [];
    var route = [];
    var markers = [];
    var img = document.getElementById("frame");
    var logger = document.getElementById('logger');
    var map;

    function initialize() {
        map = new google.maps.Map(document.getElementById("map"),
            {
                zoom: 17,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
    }

    google.maps.event.addDomListener(window, 'load', initialize);

    function refresh() {
        $('#chat').append("<div class='bubble you'>" + $('#text').val() + "</div>"
            + "<div style='clear:both;'></div>");

        $('#text').val('');

        var scroller = document.getElementById('chatscroll');
        scroller.scrollTop = scroller.scrollHeight;

    }

    $(document).keydown(function (e) {
        var keyCode = e.keyCode;
        var msg;

        if (keyCode == 37) msg = "Ir a la izquierda";
        if (keyCode == 38) msg = "Seguir recto";
        if (keyCode == 39) msg = "Ir a la derecha";
        if (keyCode == 40) msg = "Dar media vuelta ";
        if (keyCode == 32) msg = "Parar!";

        if (typeof msg != 'undefined') {
            $('#chat').append("<div class='bubble you'>" + msg + "</div><div style='clear:both;'></div>");
        }

        var scroller = document.getElementById('chatscroll');
        scroller.scrollTop = scroller.scrollHeight;

        $.ajax({
            type: "POST",
            url: url + "/chat/postdirection",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8", // this is the default value, so it's optional
            data: {
                "message": msg
            }
        });
    });


    /* SOCKET.IO */

    var socket = io.connect(url);

    socket.on('connect', function () {
        log('connected');
    });

    socket.on('disconnect', function () {
        log('disconnected');
    });

    socket.on('data', function (data) {
        img.src = data;
    });

    socket.on('coords', function (data) {
        console.log('coords');
        console.log(data);
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers.length = 0;
        route.push(new google.maps.LatLng(data.latitude, data.longitude));
        console.log(route);
        map.setCenter(new google.maps.LatLng(data.latitude, data.longitude));
        var path = new google.maps.Polyline(
            {
                path: route,
                strokeColor: "#FF0000",
                strokeOpacity: 0.7,
                strokeWeight: 3
            });
        path.setMap(map);
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.latitude, data.longitude),
        });
        markers.push(marker);
        marker.setMap(map);
    });

    socket.on('chat', function (data) {
        if (data !== "undefined") $('#chat').append("<div class='bubble me'>" + data + "</div><div style='clear:both;'></div>");
    });

    /* END SOCKET.IO */

    function log(message) {
        if (logger != null) logger.innerHTML = logger.innerHTML + message + "<br/>";
    }
});
