<?php
ini_set('display_errors', 1);
require("login.php");

// Start XML file, create parent node

$dom = new DOMDocument("1.0");
$node = $dom->createElement("markers");
$parnode = $dom->appendChild($node); 

// Opens a connection to a MySQL server and database
$url = parse_url(getenv("CLEARDB_DATABASE_URL"));
$server = $url["host"];
$username2 = $url["user"];
$password2 = $url["pass"];
$db = substr($url["path"], 1);
$mysqli= new mysqli($server, $username2, $password2, $db);
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

// Select all the rows in the markers table

$query = "SELECT * FROM markers WHERE 1";
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