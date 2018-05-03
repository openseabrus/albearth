<?php
ini_set('display_errors', 1);
require("login.php");

// Start XML file, create parent node

$dom = new DOMDocument("1.0");
$node = $dom->createElement("markers");
$parnode = $dom->appendChild($node);


// Opens a connection to a MySQL server and database
// $url = parse_url(getenv("CLEARDB_DATABASE_URL"));
// $url = "mysql://baec497d590684:018358a8@eu-cdbr-west-02.cleardb.net/heroku_aa3f00257c04492?reconnect=true";
//$server = "eu-cdbr-west-02.cleardb.net";
$username2 = "baec497d590684";
$password2 = "018358a8";
$db = "heroku_aa3f00257c04492";
$mysqli= new mysqli($server, $username, $password, $database);
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

// Select all the rows in the markers table

$query = "SELECT * FROM markers WHERE 1";
$result = $mysqli->query('SET NAMES utf8');
$result = $mysqli->query('SET CHARACTER SET utf8');
$result = $mysqli->query($query);
if (!$result) {  
  die('Invalid query: ' . $mysqli->error);
} 

header("Content-type: text/xml");

// Iterate through the rows, adding XML nodes for each

while ($row = @mysqli_fetch_assoc($result)){  
  // ADD TO XML DOCUMENT NODE  
  $node = $dom->createElement("marker");  
  $newnode = $parnode->appendChild($node);   
  $newnode->setAttribute("name",$row['name']);
  //$newnode->setAttribute("address", $row['address']);  
  $newnode->setAttribute("lat", $row['lat']);  
  $newnode->setAttribute("lng", $row['lng']);  
  $newnode->setAttribute("type", $row['type']);
} 

echo $dom->saveXML();

?>