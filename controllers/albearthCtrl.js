angular.module('albearth').controller('albearthCtrl', function ($scope, $http, $window, $timeout, $rootScope) {

    $scope.sidenav = false;
    $scope.filters = true;
    $scope.currentView = "filters";
    $scope.chosenDetail = {};

    $scope.local = {
        add: false,
        marker: null
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

    //##############################
    //####### MAP MANAGEMENT #######
    //##############################

    // loading the page with hidden sidenav causes slider to not render correctly
    // this should fix that
    $scope.refreshSlider = function () {
        $timeout(function () {
            $scope.$broadcast('rzSliderForceRender');
        });
    };



    $scope.toggleNav = function (state) {
        $scope.sidenav = state ? state : !$scope.sidenav;
    };

    $scope.setView = function (view, changeNav, newNavState) {
        $scope.currentView = view;
        $scope.toggleNav(changeNav ? newNavState : $scope.sidenav);
        $scope.refreshSlider();
        $scope.$broadcast("clearDirs");
    }

    $scope.getDetails = function (index) {
        $scope.chosenDetail = $rootScope.getLocal(index);
        $scope.chosenDetail.index = index;
        console.log($scope.chosenDetail);
        $scope.setView('details', true, true);
    }

    $scope.getRating = function (ratings) {
        if (ratings.length == 0)
            return "Sem avaliações.";
        return Math.round(ratings.reduce(getSum) / ratings.length);
    }

    function getSum(total, num) {
        return total + num;
    }

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

});