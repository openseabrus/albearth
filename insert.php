<?php

require("login.php");
$mysqli= new mysqli($server, $username, $password, $database);
if ($mysqli->connect_errno) {
echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

$sql="INSERT INTO markers (name, lat, lng, type)
VALUES
('$_POST[name]','$_POST[lat]','$_POST[lng]','$_POST[type]')";

$result = $mysqli->query($sql);
if (!$result) {
die('Invalid query: ' . $mysqli->error);
}
header('location: http://albearth.herokuapp.com');
mysqli_close($con);
exit;

?>