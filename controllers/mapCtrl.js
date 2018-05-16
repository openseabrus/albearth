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

        //PROCESS ALL LOCALS
        var xmllocais = xml.documentElement.getElementsByTagName("local");
        for (var i = 0; i < xmllocais.length; i++) {
            locais[i] = {};
            var loc = xmllocais[i];
            locais[i].idLocal = loc.getAttribute("idLocal");
            locais[i].type = loc.childNodes[0].childNodes[0].nodeValue; //tipoEstudo
            locais[i].name = loc.childNodes[1].childNodes[0].nodeValue;
            locais[i].tomadas = loc.childNodes[2].childNodes[0].nodeValue;
            locais[i].ruido = loc.childNodes[3].childNodes[0].nodeValue;
            locais[i].computadores = loc.childNodes[4].childNodes[0].nodeValue;
            locais[i].horario = loc.childNodes[5].childNodes[0].nodeValue;
            var encerramento = loc.childNodes[6].childNodes[0];
            locais[i].encerramento = encerramento ? encerramento.nodeValue : null;
            locais[i].ratings = [];

            //console.log(loc.childNodes[5].childNodes[0]);

            var point = new google.maps.LatLng(
                parseFloat(loc.childNodes[7].childNodes[0].nodeValue),
                parseFloat(loc.childNodes[8].childNodes[0].nodeValue)
            );
            var html = "<b>" + locais[i].name + "</b> <br/>" + locais[i].type + "<br/><br/>"
            html += "<b> Tomadas</b> " + (locais[i].tomadas ? "Sim" : "Não");
            html += "<br/><b>Computadores</b> " + (locais[i].computadores ? "Sim" : "Não");
            html += "<br/><b>Horário</b> " + locais[i].horario;
            html += locais[i].encerramento ? "<br/><b>Encerra</b> " + locais[i].encerramento : "";
            var icon = null;
            if (locais[i].type.toUpperCase() == "BIBLIOTECA")
                icon = "Markers/mm_20_red.png";
            else if (locais[i].type.toUpperCase() == "CAFÉ")
                icon = "Markers/mm_20_blue.png";
            else if (locais[i].type.toUpperCase() == "SALA DE LEITURA")
                icon = "Markers/mm_20_white.png";
            else if (locais[i].type.toUpperCase() == "JARDIM")
                icon = "Markers/mm_20_green.png";
            locais[i].marker = new google.maps.Marker({
                map: map,
                position: point,
                icon: icon
            });
            bindInfoWindow(locais[i].marker, map, infoWindow, html);
            //bindRemove(locais[i], name);
            bounds.extend(point);
            map.fitBounds(bounds);
        }


        //PROCESS ALL evaluations
        /*
        <avaliacao idAvaliacao="1">
            <username>alberto</username>
            <idLocal>11</idLocal>
            <avaliacao>2</avaliacao>
            <comentario>Biblioteca demasiado barulhenta. É impossível estudar neste local. NÃO FREQUENTAR!</comentario>
        </avaliacao>
        */
        var xmlavals = xml.documentElement.getElementsByTagName("avaliacao");
        for (var i = 0; i < xmlavals.length; i++) {
            var loc = xmlavals[i];
            console.log(loc.childNodes[1]);
            var idLocal = loc.childNodes[1].childNodes[0].nodeValue;
            var aval = loc.childNodes[2].childNodes[0];
            aval = aval ? aval.nodeValue : null;
            var comment = loc.childNodes[3].childNodes[0];
            comment = comment ? comment.nodeValue : null;

            if (aval) {
                for (var j = 0; j < locais.length; j++) {
                    if (locais[j].idLocal == idLocal) {
                        locais[j].ratings.push(aval);
                        google.maps.event.addListener(locais[j].marker, 'click', function () {
                            infoWindow.setContent(infoWindow.getContent() + "<br/><b>Rating</b> " + getRating(j) + " / 5");
                            infoWindow.open(map, locais[j].marker);
                        });
                        break;
                    }
                }
            }


            //bindInfoWindow(locais[i].marker, map, infoWindow, html);
            //bindRemove(locais[i], name);
            //bounds.extend(point);
            //map.fitBounds(bounds);
        }

        //console.log(locais);

        $scope.performAllChecks();
    });


    function getRating(index) {
        if(locais[index].ratings.length == 0)
            return 1;
        return Math.round(locais[index].ratings.reduce(getSum) / locais[index].ratings.length);
    }

    function getSum(total, num) {
        return total + num;
    }

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
        $scope.performAllChecks();
    }

    $scope.performAllChecks = function () {
        for (var i = 0; i < locais.length; i++) {
            var visible;

            //Verificar tipo de estudo
            visible = $scope.studies.includes(locais[i].type);

            //Verificar se o horario bate certo
            visible = visible && checkHours(locais[i].horario);

            //Verificar se tem ou nao tomadas
            visible = visible && ($scope.bools.includes('Tomadas') == locais[i].tomadas);

            //Verificar se tem ou nao computadores
            visible = visible && ($scope.bools.includes('Computadores') == locais[i].computadores);

            //Verificar qual o nivel de ruido
            visible = visible && (locais[i].ruido == $scope.noise.selected || $scope.noise.selected == "Todos");

            visible = visible && (getRating(i) >= $scope.rating.stars)


            locais[i].marker.setVisible(visible);
        }
    }

    $scope.setAddState = function () {
        addState = true;
    }


});