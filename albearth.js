var markers = new Array();
var xmlmarkers = new Array();

function initMap() {
    var mapOptions = {
        center: new google.maps.LatLng(38.644711, -9.235200),
        zoom: 16,
        backgroundColor: "red",
        draggableCursor: "crosshair"
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);

    var infoWindow = new google.maps.InfoWindow;

    google.maps.event.addListener(map, 'click', function (event) {
        var marker = new google.maps.Marker({
            position: event.latLng,
            map: map,
            title: "New Marker"
        });
        var form = document.getElementById("mar");
        var latf = form.elements[0];
        latf.value = event.latLng.lat();
        var lngf = form.elements[1];
        lngf.value = event.latLng.lng();
    });


    function downloadUrl(url, callback) {
        var request = window.ActiveXObject ?
            new ActiveXObject('Microsoft.XMLHTTP') :
            new XMLHttpRequest;

        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                request.onreadystatechange = doNothing;
                callback(request, request.status);
            }
        };

        request.open('GET', url, true);
        request.send(null);
    }

    function doNothing() { }

    downloadUrl("xmloutdom.php", function (data) {
        var xml = data.responseXML;
        xmlmarkers = xml.documentElement.getElementsByTagName("marker");
        for (var i = 0; i < xmlmarkers.length; i++) {
            var name = xmlmarkers[i].getAttribute("name");
            var type = xmlmarkers[i].getAttribute("type");
            var point = new google.maps.LatLng(
                parseFloat(xmlmarkers[i].getAttribute("lat")),
                parseFloat(xmlmarkers[i].getAttribute("lng")));
            var html = "<b>" + name + "</b> <br/>" + type;
            var icon = null;
            if (type == "hotel")
                icon = "http://labs.google.com/ridefinder/images/mm_20_red.png";
            else if (type == "restaurante")
                icon = "http://labs.google.com/ridefinder/images/mm_20_blue.png";
            else if (type == "servicos")
                icon = "http://labs.google.com/ridefinder/images/mm_20_green.png";
            else if (type == "transportes")
                icon = "http://labs.google.com/ridefinder/images/mm_20_yellow.png";
            else if (type == "policia")
                icon = "http://labs.google.com/ridefinder/images/mm_20_white.png";
            markers[i] = new google.maps.Marker({
                map: map,
                position: point,
                icon: icon
            });
            bindInfoWindow(markers[i], map, infoWindow, html);
            bindRemove(markers[i], name);
        }
    });



    function bindInfoWindow(marker, map, infoWindow, html) {
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
            console.log("yes");
        });
    }

    function bindRemove(marker, name) {
        google.maps.event.addListener(marker, 'dblclick', function () {
            var apaga = document.getElementById("del");
            var n = apaga.elements[0];
            n.value = name;
            marker.setIcon("http://labs.google.com/ridefinder/images/mm_20_black.png");
            console.log("no");
        });
    }
}

function checkLegend() {
    var legenda = document.getElementById("legenda");
    var hotel = legenda.elements[0];
    var servicos = legenda.elements[1];
    var policia = legenda.elements[2];
    var restaurantes = legenda.elements[3];
    var transportes = legenda.elements[4];

    for (var i = 0; i < markers.length; i++) {
        if (xmlmarkers[i].getAttribute("type")[0] == "h")
            markers[i].setVisible(hotel.checked);
        else if (xmlmarkers[i].getAttribute("type")[0] == "r")
            markers[i].setVisible(restaurantes.checked);
        else if (xmlmarkers[i].getAttribute("type")[0] == "s")
            markers[i].setVisible(servicos.checked);
        else if (xmlmarkers[i].getAttribute("type")[0] == "p")
            markers[i].setVisible(policia.checked);
        else if (xmlmarkers[i].getAttribute("type")[0] == "t")
            markers[i].setVisible(transportes.checked);
    }
}