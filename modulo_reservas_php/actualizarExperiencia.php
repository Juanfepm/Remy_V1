<?php
include 'conexion.php';

header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    $id = $data['id_experiencia'];
    $nombre = $data['nombre'];
    $descripcion = $data['descripcion'];
    $precio = (int)$data['precio'];

    $query = "UPDATE experiencias SET
              nombre = '$nombre',
              descripcion = '$descripcion',
              precio = $precio
              WHERE id_experiencia = '$id'";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(["res" => "actualizado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => mysqli_error($conexion)]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos no recibidos"]);
}
?>