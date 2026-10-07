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
    $img = $data['img_experiencia'] ?? 'cafe.jpg';
    $estado = 'activo';

    $query = "INSERT INTO experiencias (id_experiencia, nombre, descripcion, precio, img_experiencia, estado)
              VALUES ('$id', '$nombre', '$descripcion', $precio, '$img', '$estado')";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(["res" => "insertado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => mysqli_error($conexion)]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos no recibidos"]);
}
?>