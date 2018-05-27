angular.module('albearth').controller('importCtrl', ['$scope', '$rootScope', '$http', '$window', function ($scope, $rootScope, $http, $window) {

    /**
     * Carrega o ficheiro especificado e chama a função submitXML para submeter a informação do ficheiro na base de dados
     */
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

    /**
     * Adiciona o conteúdo de um ficheiro XML à base de dados
     * 
     * @param {string} xml caminho para o ficheiro XML
     */
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