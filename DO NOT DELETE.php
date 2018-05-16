<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require("login.php");

// Start XML file, create parent node

$dom = new DOMDocument('1.0', 'UTF-8');
$node = $dom->createElement("albearth");
$parnode = $dom->appendChild($node);

$node = $dom->createElement("locais");
$locais = $parnode->appendChild($node);

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
  $newnode = $locais->appendChild($node);
  $newnode->setAttribute("idLocal",$row['idLocal']);

  $node = $dom -> createElement("tipoEstudo",$row['tipoEstudo']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("nome",$row['nome']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("tomadas",$row['tomadas']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("ruido",$row['ruido']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("computadores",$row['computadores']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("horario",$row['horario']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("encerramento",$row['encerramento']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("latitude",$row['latitude']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("longitude",$row['longitude']);
  $newnode -> appendChild($node);
} 




$node = $dom->createElement("avaliacoes");
$avaliacoes = $parnode->appendChild($node);

// Select all the rows in the markers table
$query = "SELECT * FROM avaliacao";
$result = $mysqli->query('SET NAMES utf8');
$result = $mysqli->query('SET CHARACTER SET utf8');
$result = $mysqli->query($query);
if (!$result) {  
  die('Invalid query: ' . $mysqli->error);
}


while ($row = @mysqli_fetch_assoc($result)){  
  // ADD TO XML DOCUMENT NODE  
  $node = $dom->createElement("avaliacao");  
  $newnode = $avaliacoes->appendChild($node);
  $newnode->setAttribute("idAvaliacao",$row['idAvaliacao']);
  
  $node = $dom -> createElement("username",$row['username']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("idLocal",$row['idLocal']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("avaliacao",$row['avaliacao']);
  $newnode -> appendChild($node);
  $node = $dom -> createElement("comentario",$row['comentario']);
  $newnode -> appendChild($node);
} 

echo $dom->saveXML();

?>