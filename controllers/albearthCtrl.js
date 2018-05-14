angular.module('albearth', ['rzModule']).controller('albearthCtrl', function ($scope, $http, $window) {
    $scope.openTime = 0;
    $scope.closeTime = 24;
    $scope.slider = {
        options: {
            floor: 0,
            ceil: 24,
            step: 1
        }
    };

    var setFields = function (loggedIn, username, email, picture) {
        $scope.loggedIn = loggedIn ? loggedIn : false;
        $scope.username = username ? username : "";
        $scope.email = email ? email : "";
        $scope.picture = picture ? picture : "";
    }
    setFields();

    $scope.logon = function (username, email, picture) {
        $scope.loggedIn = true;
        $scope.username = username;
        $scope.email = email;
        $scope.picture = picture;
        var user = {
            "username": username,
            "email": email,
            "picture": picture
        }
        $window.Cookies.set('loggedUser', user);
    }

    $scope.checkCookies = function () {
        var c = $window.Cookies.getJSON('loggedUser');
        if (c) {
            $scope.logon(c["username"], c["email"], c["picture"]);
        }

    }

    $scope.logout = function () {
        $scope.loggedIn = false;
        $scope.picture = "";
        $window.Cookies.remove('loggedUser');
    }

    $scope.noise = {
        options: ["Muito Alto", "Alto", "Moderado", "Baixo", "Muito Baixo"],
        selected: "Moderado"
    }

    $scope.rating = {
        options: [1, 2, 3, 4, 5],
        selected: [true, false, false, false, false],
        stars: 1
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

    /*
    <select name="noise" id="noiseSelect" ng-options="option.name for option in noise.options track by option.name" ng-model="noise.selected"></select>
    */

});