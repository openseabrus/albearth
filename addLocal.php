<?php 
ini_set('display_errors', 1);
require("login.php");


$mysqli= new mysqli($server, $username, $password, $database);

$tipoEstudo = $_POST['tipoEstudo'];
$nome = $_POST["nome"];
$tomadas = $_POST['tomadas'];
$ruido = $_POST['ruido'];
$computadores = $_POST['computadores'];
$horario = $_POST['horario'];
$encerramento = $_POST['encerramento'];
$latitude = $_POST['latitude'];
$longitude = $_POST['longitude'];

$stmt = "INSERT INTO locais (tipoEstudo, nome, tomadas, ruido, computadores, horario, encerramento, latitude, longitude)
VALUES ('$tipoEstudo', '$nome', '$tomadas', '$ruido', '$computadores', '$horario', '$encerramento', '$latitude', '$longitude')";
$result = $mysqli->query('SET NAMES utf8');
$result = $mysqli->query('SET CHARACTER SET utf8');

/*
INSERT INTO locais (tipoEstudo, nome, tomadas, ruido, computadores, horario, encerramento, latitude, longitude)
VALUES ("Biblioteca", "Biblioteca Municipal de Cascais", 1, "Moderado", 1, "10:00-24:00", "Domingos e feriados.", 38.701190, -9.420704);
*/
$result = $mysqli->query($stmt);
if (!$result) {
    die('DECLINED');
}

echo 'ACCEPTED'

?>