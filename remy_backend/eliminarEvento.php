<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || isset($_GET['id'])) {
    $id = $_GET['id'];

    $query = "DELETE FROM eventos WHERE id_evento = '$id'";
    
    if (mysqli_query($conexion, $query)) {
        echo json_encode(["res" => "eliminado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => mysqli_error($conexion)]);
    }
}
?>
