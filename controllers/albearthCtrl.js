angular.module('albearth', ['rzModule']).controller('albearthCtrl', function ($scope, $http, $window, $timeout) {

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
    var refreshSlider = function () {
	    $timeout(function () {
		    $scope.$broadcast('rzSliderForceRender');
	    });
    };
	
	$scope.openNav = function() {
        angular.element(document.querySelector('#mySidenav')).addClass("open-sidenav");
		refreshSlider();
    };
	
	$scope.closeNav = function() {
        angular.element(document.querySelector('#mySidenav')).removeClass("open-sidenav");
    };

    
});