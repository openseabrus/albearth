angular.module('albearth').controller('albearthCtrl', function ($scope, $http, $window, $timeout, $rootScope) {

    $scope.sidenav = false;
    $scope.filters = true;
    $scope.currentView = "filters";
    $scope.chosenDetail = {};

    $scope.local = {
        add: false,
        marker: null
    };

    /**
     * Inicializa os campos referentes ao login
     * 
     * @param {boolean} loggedIn user encontra-se logged in
     * @param {string} username username inicial
     * @param {string} email email inicial
     */
    var setFields = function (loggedIn, username, email) {
        $scope.loggedIn = loggedIn ? loggedIn : false;
        $scope.username = username ? username : "";
        $scope.email = email ? email : "";
        var loc = document.location;
        if(loc.protocol == "http:") {
            $window.location.replace("https:" + loc.href.split(":")[1]);
        }
        console.log(loc);
    }
    setFields();

    /**
     * Passa o estado da aplicação para user logged in, com os parâmetros fornecidos. Cria uma cookie, para não se perder esta sessão em futuras visitas
     * 
     * @param {string} username username do utilizador a ser logado
     * @param {string} email email do utilizador a ser logado
     */
    $scope.logon = function (username, email) {
        $scope.loggedIn = true;
        $scope.username = username;
        $scope.email = email;
        var user = {
            "username": username,
            "email": email
        }
        $window.Cookies.set('loggedUser', user);
    }

    /**
     * Verifica se existem cookies correspondentes ao login. Se sim, efectua o login automático.
     */
    $scope.checkCookies = function () {
        var c = $window.Cookies.getJSON('loggedUser');
        if (c) {
            $scope.logon(c["username"], c["email"]);
        }

    }

    /**
     * Log out de utilizador. Limpa cookies existentes, referentes a login
     */
    $scope.logout = function () {
        $scope.loggedIn = false;
        $window.Cookies.remove('loggedUser');
    }

    //##############################
    //####### MAP MANAGEMENT #######
    //##############################

    /**
     * Executa um refresh à interface, para permitir a alguns elementos tomarem o valor correcto
     */
    $scope.refreshSlider = function () {
        $timeout(function () {
            $scope.$broadcast('rzSliderForceRender');
        });
    };


    /**
     * Altera o estado da sidenav. Se for fornecido um estado nos parâmetros, toma esse valor. Caso contrário, inverte o estado.
     * 
     * @param {boolean} state novo estado da sidenav
     */
    $scope.toggleNav = function (state) {		
        $scope.sidenav = state ? state : !$scope.sidenav;
		
		if($scope.sidenav)
			$("#main-container").css("width","calc(100% - 350px)").css("transition","width 0.5s ease-in-out");
		else
			$("#main-container").css("width","100%").css("transition","width 0.5s ease-in-out");
    };

    /**
     * Altera a view da sidenav para o parâmetro view. Limpa possíveis direções mostradas no mapa
     * 
     * @param {string} view Nova view da sidenav
     * @param {boolean} changeNav Indica se deve ser alterado o estado da sidenav
     * @param {boolean} newNavState Indica qual o novo estado da sidenav
     */
    $scope.setView = function (view, changeNav, newNavState) {
        $scope.currentView = view;
        $scope.toggleNav(changeNav ? newNavState : $scope.sidenav);
        $scope.refreshSlider();
        $scope.$broadcast("clearDirs");
    }

    /**
     * Obtém os detalhes do local com índice index, atribuindo à variável $scope.chosenDetail o seu valor, para ser mostrado na view "detalhes"
     * 
     * @param {int} index índice do local
     */
    $scope.getDetails = function (index) {
        $scope.chosenDetail = $rootScope.getLocal(index);
        $scope.chosenDetail.index = index;
        $scope.chosenDetail.rating = {
            options: [1, 2, 3, 4, 5],
            selected: [true, false, false, false, false],
            stars: 1,
            comment: null
        };
        console.log($scope.chosenDetail);
        $scope.setView('details', true, true);
    }

    /**
     * Retorna o rating médio do parâmetro ratings
     * 
     * @param {Array} ratings array contendo as avaliações do local respectivo
     */
    $scope.getRating = function (ratings) {
        if (ratings.length == 0)
            return "Sem avaliações.";
        var rates = [];
        for (var i = 0; i < ratings.length; i++) {
            rates.push(ratings[i].rating);
        }
        return Math.round(rates.reduce(getSum) / rates.length);
    }

    /**
     * Soma de todos os valores de um vector
     */
    function getSum(total, num) {
        return parseInt(total) + parseInt(num);
    }

    /**
     * Muda o estado de Adicionar Local para o parâmetro state. Se state for true, a view "add" será mostrada na sidenav, e a app irá ficar à espera da indicação de um ponto no mapa. Caso contrário, a view "filters" será mostrada e deixará de ser possível acrescentar pontos ao mapa, antes de se mudar novamente o estado
     * 
     * @param {boolean} state novo estado de adicionar ponto ao mapa
     */
    $scope.setAddState = function (state) {
        console.log($scope.local);
        $scope.local.add = state;
        if (state) {
            $scope.setView('add', true, true);
            $scope.$broadcast('add');
        } else {
            $scope.setView('filters', true, false);
            if ($scope.local.marker)
                $scope.local.marker.setVisible(false);
            $scope.local.marker = null;
            $scope.$broadcast("!add");
        }
    }

    /**
     * Aplica a filtragem por área
     */
    $scope.applyContains = function() {
        $scope.$broadcast("applyContains");
        $rootScope.area.adding = false;
    }

    /**
     * Remove a área de filtragem
     */
    $scope.removeArea = function() {
        $scope.$broadcast("removeArea");
        $rootScope.area.adding = false;
    }
});