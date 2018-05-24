<?php 
ini_set('display_errors', 1);
require("login.php");


$mysqli= new mysqli($server, $username, $password, $database);

$pw = hash('sha512', $_POST['password']);
$em = $_POST["email"];
 
$stmt = "SELECT username, picture FROM user WHERE 
email='$em' and password='$pw'";
$result = $mysqli->query('SET NAMES utf8');
$result = $mysqli->query('SET CHARACTER SET utf8');

/*
$sql="INSERT INTO markers (name, lat, lng, type)
VALUES
('$_POST[name]','$_POST[lat]','$_POST[lng]','$_POST[type]')";
*/
$result = $mysqli->query($stmt);
if (!$result) {
die('Invalid query: ' . $mysqli->error);
}
 
$row = $result->num_rows;
$r = new \stdClass();
 
if ($row > 0){
    $row = $result->fetch_assoc();
    $r->username = $row["username"];
    $r->picture = $row["picture"];
    $j = json_encode($r);
    echo $j;
} else{ 
    echo "DECLINED";
}
 
?>
