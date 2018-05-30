<?php 
ini_set('display_errors', 1);
require("login.php");


$mysqli= new mysqli($server, $username, $password, $database);

$content = trim(file_get_contents("php://input"));
$xml = simplexml_load_string($content);

if ($xml === false) {
    echo "DECLINED";
    foreach(libxml_get_errors() as $error) {
        echo "<br>", $error->message;
    }
} else {
    //print_r($xml);
}

$locals = $xml->locais;
$users = $xml->users;
$avals = $xml->avaliacoes;

if($locals) {
    foreach($locals->children() as $local) {
        $tipoEstudo = $local->tipoEstudo;
        $nome = $local->nome;
        $tomadas = $local->tomadas;
        if($tomadas == false)
        $tomadas = "0";
        $ruido = $local->ruido;
        $computadores = $local->computadores;
        if($computadores == false)
        $computadores = "0";
        $internet = $local->internet;
        if($internet == false)
        $internet = "0";
        $horario = $local->horario;
        $encerramento = $local->encerramento;
        $latitude = $local->latitude;
        $longitude = $local->longitude;
        $morada = $local->morada;
        
        
        $stmt = "INSERT INTO locais (tipoEstudo,nome,tomadas,computadores,internet,ruido,horario,encerramento,latitude,longitude,morada)
        VALUES ('$tipoEstudo', '$nome', '$tomadas', '$computadores', '$internet', '$ruido', '$horario', '$encerramento', '$latitude', '$longitude', '$morada')";
        $result = $mysqli->query('SET NAMES utf8');
        $result = $mysqli->query('SET CHARACTER SET utf8');
        
        $result = $mysqli->query($stmt);
    }
}

if($users) {
    foreach($users->children() as $user) {
        $username = $user->username;
        $password = $user->password;
        $pw = hash('sha512', $password);
        $nome = $user->nome;
        $email = $user->email;
        
        
        $stmt = "INSERT INTO user
        VALUES ('$username', '$pw', '$nome', '$email')";
        $result = $mysqli->query('SET NAMES utf8');
        $result = $mysqli->query('SET CHARACTER SET utf8');
        
        $result = $mysqli->query($stmt);
    }
}

if($avals) {
    foreach($avals->children() as $aval) {
        $username = $aval->username;
        $idLocal = $aval->idLocal;
        $avaliacao = $aval->avaliacao;
        $comentario = $aval->comentario;
        
        
        $stmt = "INSERT INTO avaliacao (username,idLocal,avaliacao,comentario)
        VALUES ('$username', '$idLocal', '$avaliacao', '$comentario')";
        $result = $mysqli->query('SET NAMES utf8');
        $result = $mysqli->query('SET CHARACTER SET utf8');
        
        $result = $mysqli->query($stmt);
    }
}


/*
INSERT INTO locais (tipoEstudo, nome, tomadas, ruido, computadores, horario, encerramento, latitude, longitude)
VALUES ("Biblioteca", "Biblioteca Municipal de Cascais", 1, "Moderado", 1, "10:00-24:00", "Domingos e feriados.", 38.701190, -9.420704);
*/

echo 'ACCEPTED';

?>
