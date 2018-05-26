<?php 
ini_set('display_errors', 1);
require("login.php");


$mysqli= new mysqli($server, $username, $password, $database);

$content = trim(file_get_contents("php://input"));
$data = json_decode($content, true);

$tipoEstudo = $data['study'];
$nome = $data["nome"];
$tomadas = $data['tomadas'];
if($tomadas == false)
    $tomadas = "0";
$ruido = $data['noiseSelected'];
$computadores = $data['computadores'];
if($computadores == false)
    $computadores = "0";
$internet = $data['internet'];
if($internet == false)
    $internet = "0";
$horario = $data['open'] . ":00-" . $data['close'] . ":00";
$encerramento = $data['encerramento'];
$latitude = $data['latitude'];
$longitude = $data['longitude'];
$morada = $data['morada'];

$stmt = "INSERT INTO locais (tipoEstudo,nome,tomadas,computadores,internet,ruido,horario,encerramento,latitude,longitude,morada)
VALUES ('$tipoEstudo', '$nome', '$tomadas', '$computadores', '$internet', '$ruido', '$horario', '$encerramento', '$latitude', '$longitude', '$morada')";
$result = $mysqli->query('SET NAMES utf8');
$result = $mysqli->query('SET CHARACTER SET utf8');

/*
INSERT INTO locais (tipoEstudo, nome, tomadas, ruido, computadores, horario, encerramento, latitude, longitude)
VALUES ("Biblioteca", "Biblioteca Municipal de Cascais", 1, "Moderado", 1, "10:00-24:00", "Domingos e feriados.", 38.701190, -9.420704);
*/
$result = $mysqli->query($stmt);
if (!$result) {
    die($tipoEstudo);
}

echo 'ACCEPTED';

?>
