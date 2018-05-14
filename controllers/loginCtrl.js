angular.module('albearth').controller('loginCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.email = "alberto@caeiro.pt";
    $scope.password = "alberto123";
    $scope.login = function() {
        var encodedString = 'email=' + $scope.email +
            '&password=' + $scope.password;

        console.log(encodedString);
        $http({
            method: 'POST',
            url: 'userlogin.php',
            data: encodedString,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            $scope.logon(data["data"]["username"], $scope.email, data["data"]["picture"]);
            //if (data.status === 200) {
            //    window.location.href = 'welcome.php';
            //} else {
            //    console.log(data);
            //    $scope.errorMsg = "Username and password do not match.";
            //}
            console.log(data);
            console.log("YES");
        }, function error(data) {
            console.log("ERROR");
        });
    }
}]);