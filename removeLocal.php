<?php 
ini_set('display_errors', 1);
require("login.php");


$mysqli= new mysqli($server, $username, $password, $database);

$content = trim(file_get_contents("php://input"));
$data = json_decode($content, true);

$idLocal = $data['idLocal'];

$stmt = "DELETE FROM locais WHERE idLocal='$idLocal'";
$result = $mysqli->query('SET NAMES utf8');
$result = $mysqli->query('SET CHARACTER SET utf8');


$result = $mysqli->query($stmt);
if (!$result) {
    die($idLocal);
}

echo 'ACCEPTED';

?>
