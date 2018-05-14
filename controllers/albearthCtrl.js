angular.module('albearth').controller('albearthCtrl', function ($scope, $http, $window) {

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

    $scope.checkCookies = function() {
        var c = $window.Cookies.getJSON('loggedUser');
        if(c) {
            $scope.logon(c["username"], c["email"], c["picture"]);
        }
        console.log(c);
        console.log(c["username"] + " " + c["email"] + " " + c["picture"]);
    }
});