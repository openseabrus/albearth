angular.module('albearth').controller('importCtrl', ['$scope', '$rootScope', '$http', '$window', function ($scope, $rootScope, $http, $window) {

    $scope.test = {};
    $scope.test.src = "";

    $scope.uploadFile = function () {
        var file = document.getElementById("import").files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                console.log(evt.target.result);
                submitXML(evt.target.result);
            }
            reader.onerror = function (evt) {
                console.log("error reading file");
            }
        }
    };

    function submitXML(xml) {
        $http({
            method: 'POST',
            url: 'addBatch.php',
            data: xml,
            headers: {
                'Content-Type': 'application/xml'
            }
        }).then(function (data) {
            console.log(data);
            if (data.data.toUpperCase() == "ACCEPTED")
                $window.location.reload();
            console.log("YES");
        }, function error(data) {
            console.log("ERROR");
        });
    }
}]);