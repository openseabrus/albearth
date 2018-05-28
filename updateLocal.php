<?php 
ini_set('display_errors', 1);
require("login.php");


$mysqli= new mysqli($server, $username, $password, $database);

$content = trim(file_get_contents("php://input"));
$data = json_decode($content, true);

$idLocal = $data['idLocal'];
$tipoEstudo = $data['tipoEstudo'];
$nome = $data["name"];
$tomadas = $data['tomadas'];
if($tomadas == false)
    $tomadas = "0";
else
    $tomadas = "1";
$ruido = $data['ruido'];
$computadores = $data['computadores'];
if($computadores == false)
    $computadores = "0";
else
    $computadores = "1";
$internet = $data['internet'];
if($internet == false)
    $internet = "0";
else
    $internet = "1";
$horario = $data['open'] . ":00-" . $data['close'] . ":00";
$encerramento = $data['encerramento'];
$morada = $data['morada'];

/*
* tipoEstudo varchar(45) 
nome varchar(45) 
tomadas tinyint(1) 
computadores tinyint(1) 
internet tinyint(1) 
ruido varchar(45) 
horario varchar(45) 
encerramento text 
morada text
*/

$stmt = "UPDATE locais
SET tipoEstudo='$tipoEstudo', nome='$nome', tomadas='$tomadas', computadores='$computadores', internet='$internet', ruido='$ruido', horario='$horario', encerramento='$encerramento', morada='$morada'
WHERE idLocal='$idLocal'";
$result = $mysqli->query('SET NAMES utf8');
$result = $mysqli->query('SET CHARACTER SET utf8');

$result = $mysqli->query($stmt);
if (!$result) {
    die($idLocal);
}

echo 'ACCEPTED';

?>
