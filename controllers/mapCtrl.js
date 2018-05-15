angular.module('albearth').controller('mapCtrl', function ($scope, $http, $window) {
    $scope.studies = ['Biblioteca', 'Jardim', 'Sala de Leitura', 'Café'];
    $scope.openTime = 11;
    $scope.closeTime = 17;
    $scope.bools = ["Tomadas", "Computadores"];
    $scope.noise = {
        options: ["Todos", "Muito Alto", "Alto", "Moderado", "Baixo", "Muito Baixo"],
        selected: "Todos"
    };
    $scope.rating = {
        options: [1, 2, 3, 4, 5],
        selected: [true, false, false, false, false],
        stars: 1
    };

    $scope.slider = {
        options: {
            id: '1904',
            floor: 0,
            ceil: 24,
            step: 1,
            onChange: function (id) {
                $scope.performAllChecks();
            }
        }
    };

    var map = $window.map;
    var addState = false;

    var options = {
        center: {
            lat: 38.644711,
            lng: -9.235200
        },
        zoom: 8
        //draggableCursor: "crosshair"
    };

    var locais = [];
    var xmllocais = [];

    map = new google.maps.Map(document.getElementById("map"), options);

    var infoWindow = new google.maps.InfoWindow;
    var geocoder = new google.maps.Geocoder;
    var bounds = new google.maps.LatLngBounds;


    google.maps.event.addListener(map, 'click', function (event) {
        if (addState) {
            var marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                title: "New Marker"
            });
            geocodeLatLng(geocoder, map, infoWindow, event.latLng);
        }
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

    function doNothing() {}

    downloadUrl("xmloutdom.php", function (data) {
        var xml = data.responseXML;
        xmllocais = xml.documentElement.getElementsByTagName("local");
        for (var i = 0; i < xmllocais.length; i++) {
            var name = xmllocais[i].getAttribute("nome");
            var type = xmllocais[i].getAttribute("tipoEstudo");
            var tomadas = xmllocais[i].getAttribute("tomadas");
            var computadores = xmllocais[i].getAttribute("computadores");
            var horario = xmllocais[i].getAttribute("horario");
            var encerramento = xmllocais[i].getAttribute("encerramento");


            var point = new google.maps.LatLng(
                parseFloat(xmllocais[i].getAttribute("latitude")),
                parseFloat(xmllocais[i].getAttribute("longitude"))
            );
            var html = "<b>" + name + "</b> <br/>" + type + "<br/><br/>"
            html += "<b> Tomadas</b> " + (tomadas ? "Sim" : "Não");
            html += "<br/><b>Computadores</b> " + (computadores ? "Sim" : "Não");
            html += "<br/><b>Horário</b> " + horario;
            html += encerramento ? "<br/><b>Encerra</b> " + encerramento : "";
            var icon = null;
            if (type.toUpperCase() == "BIBLIOTECA")
                icon = "Markers/mm_20_red.png";
            else if (type.toUpperCase() == "CAFÉ")
                icon = "Markers/mm_20_blue.png";
            else if (type.toUpperCase() == "SALA DE LEITURA")
                icon = "Markers/mm_20_white.png";
            else if (type.toUpperCase() == "JARDIM")
                icon = "Markers/mm_20_green.png";
            locais[i] = new google.maps.Marker({
                map: map,
                position: point,
                icon: icon
            });
            bindInfoWindow(locais[i], map, infoWindow, html);
            //bindRemove(locais[i], name);
            bounds.extend(point);
            map.fitBounds(bounds);
        }
        $scope.performAllChecks();
    });



    function bindInfoWindow(marker, map, infoWindow, html) {
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        });
    }

    /* REMOVE MARKER
    function bindRemove(marker, name) {
        google.maps.event.addListener(marker, 'dblclick', function () {
            var apaga = document.getElementById("del");
            var n = apaga.elements[0];
            n.value = name;
            marker.setIcon("http://labs.google.com/ridefinder/images/mm_20_black.png");
        });
    }*/


    function geocodeLatLng(geocoder, map, infowindow, latLng) {
        var address = "";
        geocoder.geocode({
            'location': latLng
        }, function (results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    var marker = new google.maps.Marker({
                        position: latLng,
                        map: map
                    });
                    //setForm(latLng.lat(), latLng.lng(), results[0].formatted_address);
                } else {
                    window.alert('No results found');
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }
        });
    }

    function setForm(lat, lng, name) {
        var form = document.getElementById("mar");
        form[0].value = lat;
        form[1].value = lng;
        form[2].value = name;
    }

    $scope.clickType = function (type) {
        if ($scope.studies.includes(type))
            $scope.studies = $scope.studies.filter(e => e != type);
        else
            $scope.studies.push(type);
        console.log($scope.studies);
        $scope.performAllChecks();
    }

    $scope.clickBool = function (type) {
        if ($scope.bools.includes(type))
            $scope.bools = $scope.bools.filter(e => e != type);
        else
            $scope.bools.push(type);
        console.log($scope.bools);
        $scope.performAllChecks();
    }

    function checkHours(hours) {
        console.log($scope.openTime + " " + $scope.closeTime);
        if (!hours)
            return;
        var spl = hours.split("-");
        var abertura = spl[0];
        var fecho = spl[1];
        return (abertura.split(":")[0] <= $scope.openTime && fecho.split(":")[0] >= $scope.closeTime);
    }

    $scope.rate = function (star) {
        $scope.rating.stars = star;
        var i;
        for (i = 0; i < $scope.rating.options.length; i++) {
            if (i < star)
                $scope.rating.selected[i] = true;
            else
                $scope.rating.selected[i] = false;
        }
        console.log($scope.rating.stars);
    }

    $scope.performAllChecks = function () {
        for (var i = 0; i < locais.length; i++) {
            var visible;

            //Verificar tipo de estudo
            visible = $scope.studies.includes(xmllocais[i].getAttribute('tipoEstudo'));

            //Verificar se o horario bate certo
            visible = visible && checkHours(xmllocais[i].getAttribute('horario'));

            //Verificar se tem ou nao tomadas
            visible = visible && ($scope.bools.includes('Tomadas') == xmllocais[i].getAttribute('tomadas'));

            //Verificar se tem ou nao computadores
            visible = visible && ($scope.bools.includes('Computadores') == xmllocais[i].getAttribute('computadores'));

            //Verificar qual o nivel de ruido
            visible = visible && (xmllocais[i].getAttribute('ruido') == $scope.noise.selected || $scope.noise.selected == "Todos");



            locais[i].setVisible(visible);
        }
    }

    $scope.setAddState = function () {
        addState = true;
    }


});