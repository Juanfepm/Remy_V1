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

    $stmt = $conexion->prepare('UPDATE experiencias SET nombre=?,descripcion=?,precio=? WHERE id_experiencia=?');
    $stmt->bind_param('ssis', $nombre, $descripcion, $precio, $id);
    if ($stmt->execute()) {
        echo json_encode(["res" => "actualizado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "No fue posible actualizar la experiencia"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos no recibidos"]);
}
?>
