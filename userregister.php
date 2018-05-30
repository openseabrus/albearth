<?php 
ini_set('display_errors', 1);
require("login.php");


$mysqli= new mysqli($server, $username, $password, $database);
//var encodedString = "username=" + $scope.username + "&password=" + $scope.password + "&name=" + $scope.name + '&email=' + $scope.email + "&picture=" + $scope.picture;

$user = $_POST["username"];
$pw = hash('sha512', $_POST['password']);
$name = $_POST["name"];
$em = $_POST["email"];
 
$stmt = "INSERT INTO user
VALUES('$user', '$pw', '$name', '$em')";
$result = $mysqli->query('SET NAMES utf8');
$result = $mysqli->query('SET CHARACTER SET utf8');

/*
$sql="INSERT INTO markers (name, lat, lng, type)
VALUES
('$_POST[name]','$_POST[lat]','$_POST[lng]','$_POST[type]')";
*/
$result = $mysqli->query($stmt);
if (!$result) {
die('DECLINED');
}
 
echo $user;
 
?>
