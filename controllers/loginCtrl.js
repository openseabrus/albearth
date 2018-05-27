angular.module('albearth').controller('loginCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.email = "";
    $scope.password = "";

    /**
     * Efectua o login de utilizadores com os parâmetros fornecidos no modal. Dados verificados através do ficheiro userlogin.php
     */
    $scope.login = function () {
        //Codificação dos dados em string
        var encodedString = 'email=' + $scope.email +
            '&password=' + $scope.password;

        console.log(encodedString);
        $http({
            method: 'POST',
            url: 'userlogin.php',
            data: encodedString,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            if (data.data != "DECLINED")
                $scope.logon(data["data"]["username"], $scope.email);
            else
                alert("Credenciais erradas!");
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