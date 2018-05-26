angular.module('albearth').controller('registerCtrl', ['$scope', '$window', '$http', function ($scope, $window, $http) {
    $scope.username = "";
    $scope.password = "";
    $scope.name = "";
    $scope.email = "";


    $scope.register = function () {
        if ($scope.username && $scope.password && $scope.name && $scope.email) {
            var encodedString = "username=" + $scope.username + "&password=" + $scope.password + "&name=" + $scope.name + '&email=' + $scope.email;


            console.log(encodedString);
            $http({
                method: 'POST',
                url: 'userregister.php',
                data: encodedString,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (data) {
                if (data["data"].toUpperCase() == "DECLINED") {
                    alert("Registo sem sucesso. O email ou username já existe.");
                    return;
                } else
                    $scope.logon(data["data"], $scope.email);
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
    }
}]);