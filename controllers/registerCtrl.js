angular.module('albearth').controller('registerCtrl', ['$scope', '$window', '$http', function ($scope, $window, $http) {
    $scope.username = "";
    $scope.password = "";
    $scope.name = "";
    $scope.email = "";


    /**
     * Efectua o registo de um utilizador com os parâmetros especificados na view correspondente. O registo é feito através do ficheiro userregister.php
     */
    $scope.register = function () {
        if ($scope.username && $scope.password && $scope.name && $scope.email) {
            //Codificação dos dados em string
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
                    console.log(data);
                    return;
                } else
                    $scope.logon(data["data"], $scope.email);
                console.log(data);
                console.log("YES");
            }, function error(data) {
                console.log("ERROR");
            });
        }
    }
}]);