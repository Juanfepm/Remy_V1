<?php
include 'conexion.php';

header('Content-Type: application/json');

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    $query = "DELETE FROM experiencias WHERE id_experiencia = '$id'";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(["res" => "eliminado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => mysqli_error($conexion)]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "ID no proporcionado"]);
}
?>