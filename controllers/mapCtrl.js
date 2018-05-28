angular.module('albearth').controller('mapCtrl', function ($scope, $http, $window, $rootScope) {
    var lastFilters = $window.Cookies.getJSON("filters");
    $scope.studies = lastFilters ? lastFilters.studies : ['Biblioteca', 'Jardim', 'Sala de Leitura', 'Café', 'Shopping'];
    $scope.openTime = lastFilters ? lastFilters.openTime : 11;
    $scope.closeTime = lastFilters ? lastFilters.closeTime : 17;
    $scope.filtering = lastFilters ? lastFilters.filtering : false;
    $scope.clustering = lastFilters ? lastFilters.clustering : false;

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
        internet: false,
        encerramento: "",
        error: "",
        morada: ""
    };

    $scope.modify = {
        ruidos: ["Muito Alto", "Alto", "Moderado", "Baixo", "Muito Baixo"],
        ruido: "Moderado"
    };

    $scope.noise = lastFilters ? lastFilters.noise : {
        options: ["Todos", "Muito Alto", "Alto", "Moderado", "Baixo", "Muito Baixo"],
        selected: "Todos"
    };
    $scope.rating = lastFilters ? lastFilters.rating : {
        options: [1, 2, 3, 4, 5],
        selected: [true, false, false, false, false],
        stars: 1
    };

    $scope.dirMode = "DRIVING";
    var directions = {
        state: false,
        point: null
    };
    var map = $window.map;
    var styles = [{
            "featureType": "administrative.land_parcel",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "poi.business",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "road.local",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
            }]
        }
    ];

    var options = {
        center: {
            lat: 38.644711,
            lng: -9.235200
        },
        zoom: 8,
        clickableIcons: false,
        styles: styles
        //draggableCursor: "crosshair"
    };
    var hadCookie = false;

    var lastPos = $window.Cookies.getJSON("lastPos");
    console.log("LASTPOS");
    console.log(lastPos);
    if (lastPos) {
        options.center = lastPos.center;
        options.zoom = lastPos.zoom;
        hadCookie = true;
    }


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

    var markerCluster = new MarkerClusterer(map, null, {
        imagePath: 'Markers/clusters/m'
    });

    var studyArea = new google.maps.Polygon({
        paths: [],
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.1
    });
    studyArea.setMap(map);


    /**
     * Obter direcções para o ponto $scope.chosenDetail
     * 
     * @param {boolean} b Indicação do tipo de origem. true indica que a origem é calculada a partir de um ponto marcado previamente no mapa. false se a origem for baseada na posição real do utilizador
     */
    $scope.directions = function (b) {
        var request = {
            destination: $scope.chosenDetail.marker.position,
            travelMode: $scope.dirMode,
            unitSystem: google.maps.UnitSystem.METRIC
        };
        var res = false;
        if (b) {
            request.origin = directions.point;
            directionsService.route(request, function (result, status) {
                if (status == "OK") {
                    $scope.setView('directions', true, true);
                    directionsDisplay.setDirections(result);
                    directionsDisplay.setMap(map);
                    directionsDisplay.setPanel(document.getElementById("directionsPanel"));
                    res = true;
                } else {
                    alert("Não conseguimos obter uma rota com o modo de viagem escolhido.");
                    return;
                }
            });
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    request.origin = pos;

                    directionsService.route(request, function (result, status) {
                        if (status == "OK") {
                            $scope.setView('directions', true, true);
                            directionsDisplay.setDirections(result);
                            directionsDisplay.setMap(map);
                            directionsDisplay.setPanel(document.getElementById("directionsPanel"));
                            res = true;
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
        return res;
    }


    /**
     * Event listener de cliques no mapa.
     * Se $scope.local.add estiver a true, o ponto onde é efectuado o click no mapa é o local do novo ponto no mapa.
     * 
     * Caso contrário, se directions.state for true, o ponto escolhido no mapa será o ponto de origem utilizado para calcular direções até um local
     */
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

            //Obter morada do ponto escolhido
            geocoder.geocode({
                'location': event.latLng
            }, function (results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        $scope.add.morada = results[0].formatted_address;
                        //setForm(latLng.lat(), latLng.lng(), results[0].formatted_address);
                    } else {
                        // window.alert('No results found');
                        $scope.add.morada = "";
                    }
                } else {
                    // window.alert('Geocoder failed due to: ' + status);
                    $scope.add.morada = "";
                }
                $scope.refreshSlider();
            });
            //geocodeLatLng(geocoder, map, infoWindow, event.latLng);
        } else if (directions.state) {
            directions.state = false;
            map.setOptions({
                draggableCursor: ""
            });
            directions.point = event.latLng;
            $scope.directions(true)
        } else if ($rootScope.area.adding) {
            studyArea.getPath().push(event.latLng);
        }
        $scope.addVerifications();
        $scope.refreshSlider();
    });


    /**
     * Detecta quando os bounds do mapa mudam e guarda numa Cookie, para poder recuperar numa futura sessão
     */
    google.maps.event.addListener(map, 'bounds_changed', function (event) {
        $window.Cookies.remove("lastPos");
        var lastPos = {
            center: map.getCenter(),
            zoom: map.getZoom()
        }
        $window.Cookies.set("lastPos", lastPos);
    });

    function updateCookie() {
        $window.Cookies.remove("filters");
        var cookie = {
            studies: $scope.studies,
            openTime: $scope.openTime,
            closeTime: $scope.closeTime,
            filtering: $scope.filtering,
            clustering: $scope.clustering,
            noise: $scope.noise,
            rating: $scope.rating
        }
        $window.Cookies.set("filters", cookie);
    }

    /**
     * Função que irá fazer download dos dados a serem utilizados pela aplicação
     * 
     * @param {string} url onde se encontra o ficheiro XML com os dados.
     * @param {function} callback função que irá fazer o tratamento dos dados recebidos
     */
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

    /*
     * Chamada da função downloadUrl, que obtém os dados do ficheiro disponível em href/xmloutdom.php e que irá atribuir a objectos e introduzi-los no array locais. 
     */
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
            var morada = loc.childNodes[9].childNodes[0];
            locais[i].morada = morada ? morada.nodeValue : null;
            locais[i].internet = loc.childNodes[10].childNodes[0].nodeValue;
            var icon = null;
            //Determinar tipo de icon
            if (locais[i].type.toUpperCase() == "BIBLIOTECA")
                icon = "Markers/biblioteca_arrow.png";
            else if (locais[i].type.toUpperCase() == "CAFÉ")
                icon = "Markers/cafe_arrow.png";
            else if (locais[i].type.toUpperCase() == "SALA DE LEITURA")
                icon = "Markers/sala_arrow.png";
            else if (locais[i].type.toUpperCase() == "JARDIM")
                icon = "Markers/jardim_arrow.png";
            else if (locais[i].type.toUpperCase() == "SHOPPING")
                icon = "Markers/shopping_arrow.png";
            locais[i].marker = new google.maps.Marker({
                map: map,
                position: point,
                icon: icon
            });


            //Definir o que aparecerá na infoWindow
            var html = "<b>" + locais[i].name + "</b> <br/>" + locais[i].type + "<br/><br/>"
            //html += "<b> Tomadas</b> " + (locais[i].tomadas ? "Sim" : "Não");
            //html += "<br/><b>Computadores</b> " + (locais[i].computadores ? "Sim" : "Não");
            html += "<br/><b>Horário</b> " + locais[i].horario;
            html += locais[i].encerramento ? "<br/><b>Encerra</b> " + locais[i].encerramento : "";
            html += locais[i].morada ? "<br/><b>Morada</b> " + locais[i].morada : "";
            html += "<br/><br/><br/><center><input onclick=\"angular.element(this).scope().getDetails('" + i + "')\" class='btn al-btn det-btn' type='button' name='type' value='Ver detalhes' /></center>";

            bindInfoWindow(locais[i].marker, map, infoWindow, html);
            //bindRemove(locais[i], name);
            bounds.extend(point);
            //map.fitBounds(bounds);
        }

        //PROCESS ALL evaluations
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


            if (aval) {
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
        }


        if (!hadCookie)
            map.fitBounds(bounds);


        //No fim, verificar quais os pontos a ser mostrados
        $scope.performAllChecks();
    });


    /**
     * Função que retorna o rating do local com o índice index (média)
     * 
     * @param {int} index O índice do local em locais
     * @return {int} rating do local com índice index
     */
    function getRating(index) {
        if (locais[index].ratings.length == 0)
            return 1;
        var rates = [];
        for (var i = 0; i < locais[index].ratings.length; i++) {
            rates.push(locais[index].ratings[i].rating);
        }

        //Divisão da soma dos valores pela quantidade de valores, para obter a média
        var sum = rates.reduce(getSum);
        return Math.round(rates.reduce(getSum) / rates.length);
    }

    /**
     * Função que retorna a soma de todos os valores contidos num array.
     * 
     * @return soma total.
     */
    function getSum(total, num) {
        return parseInt(total) + parseInt(num);
    }

    /**
     * Método que associa uma infoWindow, juntamente com um dado conteúdo aos marcadores dos locais 
     * 
     * @param {Marker} marker Marker a ser afectado 
     * @param {Map} map Mapa onde o marker será posicionado
     * @param {InfoWindow} infoWindow Janela a ser mostrada quando se carrega no marker
     * @param {string} html Conteúdo a ser mostrado dentro da infoWindow
     */
    function bindInfoWindow(marker, map, infoWindow, html) {
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        });
    }

    /**
     * Método que retorn o local no índice l
     * 
     * @param {int} l índice do local
     * @return local no índice l
     */
    $rootScope.getLocal = function (l) {
        return locais[l];
    }

    /**
     * Método que serve de "toggle" para os parâmetros booleanos (Tipos de Estudo, Tomadas, etc). Se type já estiver em $scope.studies, é retirado de lá. Caso contrário, é acrescentado. Por fim, desencadeia verificações para mostrar apenas locais que respeitam os filtros
     * 
     * @param {string} type Tipo de local
     */
    $scope.clickType = function (type) {
        if ($scope.studies.includes(type))
            $scope.studies = $scope.studies.filter(e => e != type);
        else
            $scope.studies.push(type);
        console.log($scope.studies);
        $scope.performAllChecks();
    }

    /**
     * Função que recebe uma string de horário de funcionamento e verifica se respeita o horário especificado na filtragem ($scope.openTime e $scope.closeTime).
     * 
     * @param {string} hours horario de funcionamento.
     * @return {boolean} resultado da verificação
     */
    function checkHours(hours) {
        console.log($scope.openTime + " " + $scope.closeTime);
        if (!hours)
            return;
        var spl = hours.split("-");
        var abertura = spl[0];
        var fecho = spl[1];
        return (abertura.split(":")[0] <= $scope.openTime && fecho.split(":")[0] >= $scope.closeTime);
    }

    /**
     * Função responsável pelo mecanismo de rating. Garante, por exemplo, que se a estrela 4 for seleccionada, a 1, 2 e 3 também são automaticamente seleccionadas.
     * 
     * @param {int} star Número de estrelas escolhidas
     * @param {boolean} evaluating Variável booleana que indica se se trata de uma avaliação ou da filtragem.
     */
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

    /**
     * Função responsável por determinar que pontos devem ser mostrados no mapa, através da verificação dos parâmetros definidos na interface. Também tem em conta se os pontos são para ser aglomerados ou não.
     * 
     * @param {boolean} clusterChange Indica se o toggle de cluster foi alterado. Se sim, é necessário limpar os pontos do markerCluster.
     */
    $scope.performAllChecks = function (clusterChange) {
        if (clusterChange)
            markerCluster.clearMarkers();
        if (!$scope.clustering) {
            markerCluster.setMinClusterSize(Number.MAX_SAFE_INTEGER);
        } else {
            markerCluster.clearMarkers();
            markerCluster.setMinClusterSize(2);
        }
        for (var i = 0; i < locais.length; i++) {
            if (!$scope.filtering) {
                locais[i].marker.setVisible(visible);
                markerCluster.addMarker(locais[i].marker);
                continue;
            }
            var visible;

            //Verificar tipo de estudo
            visible = $scope.studies.includes(locais[i].type);

            //Verificar se o horario bate certo
            visible = visible && checkHours(locais[i].horario);

            //Verificar se tem ou nao tomadas
            visible = $scope.studies.includes('Tomadas') ? visible && $scope.studies.includes('Tomadas') == locais[i].tomadas : visible;
            // visible = visible && ($scope.bools.includes('Tomadas') == locais[i].tomadas);

            //Verificar se tem ou nao computadores
            visible = $scope.studies.includes('Computadores') ? visible && $scope.studies.includes('Computadores') == locais[i].computadores : visible;

            //Verificar se tem ou nao acesso a Internet
            visible = $scope.studies.includes('Internet') ? visible && $scope.studies.includes('Internet') == locais[i].internet : visible;

            //Verificar qual o nivel de ruido
            visible = visible && (locais[i].ruido == $scope.noise.selected || $scope.noise.selected == "Todos");

            visible = visible && (getRating(i) >= $scope.rating.stars);

            //Verificar se o ponto se encontra dentro do polígono
            if (studyArea.getPath() && studyArea.getPath().length >= 3)
                visible = visible && google.maps.geometry.poly.containsLocation(locais[i].marker.getPosition(), studyArea);

            if (visible) {
                markerCluster.addMarker(locais[i].marker);
            } else {
                markerCluster.removeMarker(locais[i].marker);
            }
            locais[i].marker.setVisible(visible);
        }
        updateCookie();
    }
    $scope.performAllChecks();


    /**
     * Função que atribui os valores enviados pelos sliders às variáveis respectivas. É fei
     * 
     * @param {int} open Valor inferior do range slider
     * @param {int} close Valor superior do range slider
     * @param {string} add Indica se a alteração se deu no slider de adicionar local, modificar local ou na filtragem
     */
    $scope.setTimes = function (open, close, add) {
        if (add == "filter") {
            $scope.openTime = open;
            $scope.closeTime = close;
            console.log($scope.openTime);
        } else if (add == "add") {
            $scope.add.open = open;
            $scope.add.close = close;
        } else if (add == "modify") {
            $scope.modify.open = open;
            $scope.modify.close = close;
        }
        $scope.refreshSlider();
        $scope.performAllChecks();
    }

    /**
     * Função responsável por capturar os eventos despoletados nos range sliders e enviá-los para outras funções para serem tratados
     */
    $scope.start = function () {
        $(function () {
            // change this so they are independent from each other
            $("#slider-range").slider({
                range: true,
                min: 0,
                max: 24,
                values: [$scope.openTime, $scope.closeTime],
                slide: function (event, ui) {
                    $scope.setTimes(ui.values[0], ui.values[1], "filter");
                }
            });
        });

        $(function () {
            // change this so they are independent from each other
            $("#slider-range-add").slider({
                range: true,
                min: 0,
                max: 24,
                values: [$scope.add.open, $scope.add.close],
                slide: function (event, ui) {
                    $scope.setTimes(ui.values[0], ui.values[1], "add");
                }
            });
        });

        $(function () {
            // change this so they are independent from each other
            $("#slider-range-modify").slider({
                range: true,
                min: 0,
                max: 24,
                values: [9, 17],
                slide: function (event, ui) {
                    $scope.setTimes(ui.values[0], ui.values[1], "modify");
                }
            });
        });
    }
    $scope.start();


    /**
     * Adiciona um local à base de dados, através do ficheiro addLocal.php, enviando o objecto do local escolhido
     */
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


    /**
     * Remove um local da base de dados, através do ficheiro removeLocal.php, enviando o id do local escolhido
     */
    $scope.removeLocal = function () {
        var local = {
            idLocal: $scope.chosenDetail.idLocal
        }
        $http({
            method: 'POST',
            url: 'removeLocal.php',
            data: local,
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
            console.log(data);
        });
    };

    /**
     * Adiciona um rating ao local place através do ficheiro addRating.php, enviando o username, place id, avaliacao e comentario.
     * 
     * @param {string} username 
     * @param {local} place 
     */
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
            else
                $window.alert("Já submeteu uma avaliação a este local.");
        }, function error(data) {
            console.log("ERROR");
        });
    }

    /**
     * Função que recebe o broadcast "add" da classe albearthCtrl.js e que determina que se irá escolher um ponto no mapa para associar a um novo local
     */
    $scope.$on('add', function (e) {
        map.setOptions({
            draggableCursor: "crosshair"
        });
        $scope.addVerifications();
    });

    /**
     * Função que recebe o broadcast "!add" da classe albearthCtrl.js e que indica que já não se está a adicionar um ponto no mapa. Dá reset aos dados possivelmente introduzidos anteriormente
     */
    $scope.$on("!add", function (e) {
        map.setOptions({
            draggableCursor: ""
        });
        $scope.add = {
            nome: "",
            open: 9,
            close: 20,
            study: "Biblioteca",
            noiseOptions: ["Muito Alto", "Alto", "Moderado", "Baixo", "Muito Baixo"],
            noiseSelected: "Moderado",
            tomadas: false,
            computadores: false,
            internet: false,
            encerramento: "",
            error: "",
            morada: ""
        };
    });

    /**
     * Função que recebe o broadcast "clearDirs" da classe albearthCtrl.js, retirando do mapa as direções até um dado ponto
     */
    $scope.$on("clearDirs", function (e) {
        directionsDisplay.setMap(null);
        directions.state = false;
    });

    /**
     * Função que recebe o broadcast "applyContains" da classe albearthCtrl.js, responsável por aplicar a filtragem por área e focar o mapa nessa mesma área
     */
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

    /**
     * Recebe o broadcast "removeArea" da classe albearthCtrl.js, responsável por retirar a área de filtragem do mapa e aplicar a nova filtragem aos pontos
     */
    $scope.$on("removeArea", function (e) {
        $scope.addArea(false);
        map.setOptions({
            draggableCursor: ""
        });
        $scope.performAllChecks();
    });

    /**
     * Muda o estado da aplicação para aceitação de um clique no mapa, que irá determinar o ponto de origem das direções até ao ponto escolhido
     */
    $scope.setPoint = function () {
        directionsDisplay.setMap(null);
        directions.state = true;
        map.setOptions({
            draggableCursor: "crosshair"
        });
    }

    /**
     * Verifica se os campos da view Adicionar Local estão minimamente preenchidos, mostrando uma mensagem de erro caso contrário
     */
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

    /**
     * Muda o estado da área de filtragem da aplicação. Se o parâmetro for true, a app esperará pela definição de uma área de filtragem. Se for false, irá limpar a área existente.
     * 
     * @param {boolean} val representa o novo estado da área. true indica que será definida uma nova área. false indica a remoção da área.
     */
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

    /**
     * Indica se o utilizador já definiu algum ponto da área.
     * @return existe um ponto da área
     */
    $rootScope.hasPoints = function () {
        if (studyArea.getPath())
            return studyArea.getPath().length > 0;
        return false;
    };

    /**
     * Efectua um zoom automático nos locais visíveis no mapa.
     */
    $rootScope.fitBounds = function () {
        var b = new google.maps.LatLngBounds();
        var p = markerCluster.getMarkers();
        for (var x = 0; x < locais.length; x++) {
            b.extend(p[x].getPosition());
        }
        map.fitBounds(b);
    }

    /**
     * Inicialização dos parâmetros para a modificação de um local
     */
    $scope.modifyLocal = function () {
        $scope.modify = $scope.chosenDetail;
        $scope.modify.open = 9;
        $scope.modify.close = 17;
        $scope.modify.tomadas = $scope.modify.tomadas == "1" ? true : false;
        $scope.modify.internet = $scope.modify.internet == "1" ? true : false;
        $scope.modify.computadores = $scope.modify.computadores == "1" ? true : false;
        $scope.modify.ruidos = ["Muito Alto", "Alto", "Moderado", "Baixo", "Muito Baixo"];
    }

    /**
     * Submete as modificações feitas pelo utilizador feitas em $scope.chosenDetail
     */
    $scope.submitModifications = function () {
        console.log($scope.modify);
        var mod = {
            idLocal: $scope.modify.idLocal,
            tipoEstudo: $scope.modify.type,
            name: $scope.modify.name,
            tomadas: $scope.modify.tomadas,
            ruido: $scope.modify.ruido,
            computadores: $scope.modify.computadores,
            internet: $scope.modify.internet,
            open: $scope.modify.open,
            close: $scope.modify.close,
            encerramento: $scope.modify.encerramento,
            morada: $scope.modify.morada
        }
        $http({
            method: 'POST',
            url: 'updateLocal.php',
            data: mod,
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
            console.log(data);
        });
    }
});