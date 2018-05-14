<?php 
ini_set('display_errors', 1);
require("login.php");


$username2 = "baec497d590684";
$password2 = "018358a8";
$db = "heroku_aa3f00257c04492";
$mysqli= new mysqli($server, $username, $password, $database);

$pw = hash('sha512', $_POST['password']);
$em = $_POST["email"];
 
$stmt = "SELECT username FROM user WHERE 
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
 
if ($row > 0){
    $row = $result->fetch_assoc();
    echo $row["username"];
} else{ 
    echo "Declined";
}
 
?>
