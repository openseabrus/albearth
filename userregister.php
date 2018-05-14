<?php 
ini_set('display_errors', 1);
require("login.php");


$username2 = "baec497d590684";
$password2 = "018358a8";
$db = "heroku_aa3f00257c04492";
$mysqli= new mysqli($server, $username, $password, $database);
//var encodedString = "username=" + $scope.username + "&password=" + $scope.password + "&name=" + $scope.name + '&email=' + $scope.email + "&picture=" + $scope.picture;

$user = $_POST["username"];
$pw = hash('sha512', $_POST['password']);
$name = $_POST["name"];
$em = $_POST["email"];
$pic = $_POST["picture"];
 
$stmt = "INSERT INTO user
VALUES('$user', '$pw', '$name', '$em', '$pic')";
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
