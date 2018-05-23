<?php 
ini_set('display_errors', 1);
require("login.php");


$mysqli= new mysqli($server, $username, $password, $database);

$content = trim(file_get_contents("php://input"));
$data = json_decode($content, true);

/*
var data = {
            username: username,
            idLocal: place.idLocal,
            avaliacao: place.rating.stars,
            comentario: place.rating.comment
        }*/

$username = $data['username'];
$idLocal = $data["idLocal"];
$avaliacao = $data['avaliacao'];
$comentario = $data['comentario'];

$stmt = "INSERT INTO avaliacao (username, idLocal, avaliacao, comentario)
VALUES ('$username', '$idLocal', '$avaliacao', '$comentario')";
$result = $mysqli->query('SET NAMES utf8');
$result = $mysqli->query('SET CHARACTER SET utf8');

/*
INSERT INTO locais (tipoEstudo, nome, tomadas, ruido, computadores, horario, encerramento, latitude, longitude)
VALUES ("Biblioteca", "Biblioteca Municipal de Cascais", 1, "Moderado", 1, "10:00-24:00", "Domingos e feriados.", 38.701190, -9.420704);
*/
$result = $mysqli->query($stmt);
if (!$result) {
    die($idLocal);
}

echo 'ACCEPTED';

?>
