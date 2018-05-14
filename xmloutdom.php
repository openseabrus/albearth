<?php
ini_set('display_errors', 1);
require("login.php");

// Start XML file, create parent node

$dom = new DOMDocument("1.0");
$node = $dom->createElement("locais");
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

$query = "SELECT * FROM locais";
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
  $node = $dom->createElement("local");  
  $newnode = $parnode->appendChild($node);
  $newnode->setAttribute("idLocal",$row['idLocal']);
  $newnode->setAttribute("tipoEstudo",$row['tipoEstudo']);
  $newnode->setAttribute("nome",$row['nome']);
  $newnode->setAttribute("tomadas",$row['tomadas']);
  $newnode->setAttribute("ruido",$row['ruido']);
  $newnode->setAttribute("computadores",$row['computadores']);
  $newnode->setAttribute("horario",$row['horario']);
  $newnode->setAttribute("encerramento",$row['encerramento']);
  $newnode->setAttribute("latitude",$row['latitude']);
  $newnode->setAttribute("longitude",$row['longitude']);
} 

echo $dom->saveXML();

?>