angular.module('albearth').controller('mapCtrl', function ($scope, $http, $window, $rootScope) {
    $scope.studies = ['Biblioteca', 'Jardim', 'Sala de Leitura', 'Café'];
    $scope.openTime = 11;
    $scope.closeTime = 17;

    $rootScope.area = {
        adding: false,
        points: []
    }

    var points = [];

    $scope.add = {
        nome: "",
        open: 9,
        close: 20,
        study: "Biblioteca",
        noiseOptions: ["Muito Alto", "Alto", "Moderado", "Baixo", "Muito Baixo"],
        noiseSelected: "Moderado",
        tomadas: false,
        computadores: false,
        encerramento: "",
        error: ""
    };

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

    var directions = {
        state: false,
        point: null
    };
    var map = $window.map;
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
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: {
            strokeColor: "#ff0000",
            strokeOpacity: .75,
            clickable: false
        },
        suppressMarkers: true
    });

    var studyArea = new google.maps.Polygon({
        paths: [],
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#FF0000',
        fillOpacity: 0.1
    });
    studyArea.setMap(map);


    $scope.directions = function (b) {
        if (b) {
            var request = {
                origin: directions.point,
                destination: $scope.chosenDetail.marker.position,
                travelMode: "DRIVING",
                unitSystem: google.maps.UnitSystem.METRIC
            };

            directionsService.route(request, function (result, status) {
                if (status == "OK") {
                    directionsDisplay.setDirections(result);
                    directionsDisplay.setMap(map);
                }
            });
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    var request = {
                        origin: pos,
                        destination: $scope.chosenDetail.marker.position,
                        travelMode: "DRIVING",
                        unitSystem: google.maps.UnitSystem.METRIC
                    };

                    directionsService.route(request, function (result, status) {
                        if (status == "OK") {
                            directionsDisplay.setDirections(result);
                            directionsDisplay.setMap(map);
                        }
                    });
                }, function () {
                    console.log("JJJJJ");
                });
            } else {
                // Browser doesn't support Geolocation
                alert("O seu browser não suporta Geolocalização.");
                return;
            }
        }
    }


    google.maps.event.addListener(map, 'click', function (event) {
        if ($scope.local.add) {
            $scope.add.error = "";
            if ($scope.local.marker)
                $scope.local.marker.setPosition(event.latLng);
            else {
                $scope.local.marker = new google.maps.Marker({
                    position: event.latLng,
                    map: map,
                    title: "Drag me!",
                    draggable: true
                });
            }
            //geocodeLatLng(geocoder, map, infoWindow, event.latLng);
        } else if (directions.state) {
            directions.state = false;
            map.setOptions({
                draggableCursor: ""
            });
            directions.point = event.latLng;
            $scope.directions(true);
        } else if ($rootScope.area.adding) {
            studyArea.getPath().push(event.latLng);
        }
        $scope.addVerifications();
        $scope.refreshSlider();
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

            var html = "<b>" + locais[i].name + "</b> <br/>" + locais[i].type + "<br/><br/>"
            //html += "<b> Tomadas</b> " + (locais[i].tomadas ? "Sim" : "Não");
            //html += "<br/><b>Computadores</b> " + (locais[i].computadores ? "Sim" : "Não");
            html += "<br/><b>Horário</b> " + locais[i].horario;
            html += locais[i].encerramento ? "<br/><b>Encerra</b> " + locais[i].encerramento : "";
            html += "<br/><br/><br/><center><input onclick=\"angular.element(this).scope().getDetails('" + i + "')\" class='btn al-btn det-btn' type='button' name='type' value='Ver detalhes' /></center>";

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
            var username = loc.childNodes[0].childNodes[0].nodeValue;
            var idLocal = loc.childNodes[1].childNodes[0].nodeValue;
            var aval = loc.childNodes[2].childNodes[0];
            aval = aval ? aval.nodeValue : null;
            var comment = loc.childNodes[3].childNodes[0];
            comment = comment ? comment.nodeValue : null;

            if (aval || true) {
                for (var j = 0; j < locais.length; j++) {
                    if (locais[j].idLocal == idLocal) {
                        var eval = {
                            username: username,
                            rating: aval,
                            comment: comment
                        };
                        locais[j].ratings.push(eval);
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
        if (locais[index].ratings.length == 0)
            return 1;
        var rates = [];
        for (var i = 0; i < locais[index].ratings.length; i++) {
            rates.push(locais[index].ratings[i].rating);
        }
        var sum = rates.reduce(getSum);
        return Math.round(rates.reduce(getSum) / rates.length);
    }

    function getSum(total, num) {
        return parseInt(total) + parseInt(num);
    }

    function bindInfoWindow(marker, map, infoWindow, html) {
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        });
    }

    $rootScope.getLocal = function (l) {
        return locais[l];
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

    $scope.rate = function (star, evaluating) {
        if (!evaluating) {
            $scope.rating.stars = star;
            var i;
            for (i = 0; i < $scope.rating.options.length; i++) {
                if (i < star)
                    $scope.rating.selected[i] = true;
                else
                    $scope.rating.selected[i] = false;
            }
            $scope.performAllChecks();
        } else {
            $scope.chosenDetail.rating.stars = star;
            for (i = 0; i < $scope.chosenDetail.rating.options.length; i++) {
                if (i < star)
                    $scope.chosenDetail.rating.selected[i] = true;
                else
                    $scope.chosenDetail.rating.selected[i] = false;
            }
        }
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

            visible = visible && (getRating(i) >= $scope.rating.stars);

            //Verificar se o ponto se encontra dentro do polígono
            if (studyArea.getPath() && studyArea.getPath().length >= 3)
                visible = visible && google.maps.geometry.poly.containsLocation(locais[i].marker.getPosition(), studyArea);


            locais[i].marker.setVisible(visible);
        }
    }


    $scope.setTimes = function (open, close, add) {
        if (!add) {
            $scope.openTime = open;
            $scope.closeTime = close;
            console.log($scope.openTime);
        } else {
            $scope.add.open = open;
            $scope.add.close = close;
        }
        $scope.refreshSlider();
        $scope.performAllChecks();
    }

    $scope.start = function () {
        $(function () {
            // change this so they are independent from each other
            $("#slider-range").slider({
                range: true,
                min: 0,
                max: 24,
                values: [11, 17],
                slide: function (event, ui) {
                    $scope.setTimes(ui.values[0], ui.values[1], false);
                }
            });
        });

        $(function () {
            // change this so they are independent from each other
            $("#slider-range-add").slider({
                range: true,
                min: 0,
                max: 24,
                values: [9, 20],
                slide: function (event, ui) {
                    $scope.setTimes(ui.values[0], ui.values[1], true);
                }
            });
        });
    }
    $scope.start();


    $scope.addLocal = function () {
        if (!$scope.addVerifications()) {
            return;
        }
        var latlng = $scope.local.marker.getPosition();
        $scope.add.latitude = latlng.lat();
        $scope.add.longitude = latlng.lng();
        console.log($scope.add);
        $http({
            method: 'POST',
            url: 'addLocal.php',
            data: $scope.add,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (data) {
            //if (data.status === 200) {
            //    window.location.href = 'welcome.php';
            //} else {
            //    console.log(data);
            //    $scope.errorMsg = "Username and password do not match.";
            //}
            console.log(data);
            if (data.data.toUpperCase() == "ACCEPTED")
                $window.location.reload();
            console.log("YES");
        }, function error(data) {
            console.log("ERROR");
        });
    };

    $scope.submitRating = function (username, place) {
        var data = {
            username: username,
            idLocal: place.idLocal,
            avaliacao: place.rating.stars,
            comentario: place.rating.comment
        }
        $http({
            method: 'POST',
            url: 'addRating.php',
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (data) {
            //if (data.status === 200) {
            //    window.location.href = 'welcome.php';
            //} else {
            //    console.log(data);
            //    $scope.errorMsg = "Username and password do not match.";
            //}
            console.log(data);
            if (data.data.toUpperCase() == "ACCEPTED")
                $window.location.reload();
            console.log("YES");
        }, function error(data) {
            console.log("ERROR");
        });
    }

    $scope.$on('add', function (e) {
        map.setOptions({
            draggableCursor: "crosshair"
        });
        $scope.addVerifications();
    });

    $scope.$on("!add", function (e) {
        map.setOptions({
            draggableCursor: ""
        });
    });

    $scope.$on("clearDirs", function (e) {
        directionsDisplay.setMap(null);
        directions.state = false;
    });

    $scope.$on("applyContains", function (e) {
        //$scope.addArea(false);
        map.setOptions({
            draggableCursor: ""
        });
        $scope.performAllChecks();

        var b = new google.maps.LatLngBounds();
        //var p = studyArea.getPath();
        studyArea.getPath().forEach(function (latLng) {
            b.extend(latLng);
        });
        map.fitBounds(b);
    });

    $scope.$on("removeArea", function (e) {
        $scope.addArea(false);
        map.setOptions({
            draggableCursor: ""
        });
        $scope.performAllChecks();
    });

    $scope.setPoint = function () {
        directionsDisplay.setMap(null);
        directions.state = true;
        map.setOptions({
            draggableCursor: "crosshair"
        });
    }

    $scope.addVerifications = function () {
        if (!$scope.add.nome) {
            $scope.add.error = "Campo Nome vazio.";
            return false;
        } else if (!$scope.local.marker) {
            $scope.add.error = "Selecionar um local no mapa.";
            return false;
        }
        $scope.add.error = "";
        return true;
    };

    $scope.addArea = function (val) {
        $scope.performAllChecks();
        $rootScope.area.adding = true;
        if (val) {
            map.setOptions({
                draggableCursor: "crosshair"
            });
        }
        studyArea.setPath([]);
    };

    $rootScope.hasPoints = function () {
        if (studyArea.getPath())
            return studyArea.getPath().length > 0;
        return false;
    }

});