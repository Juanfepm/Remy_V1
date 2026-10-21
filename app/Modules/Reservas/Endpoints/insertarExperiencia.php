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

    $stmt = $conexion->prepare('INSERT INTO experiencias (id_experiencia,nombre,descripcion,precio,img_experiencia,estado) VALUES (?,?,?,?,?,?)');
    $stmt->bind_param('sssiss', $id, $nombre, $descripcion, $precio, $img, $estado);
    if ($stmt->execute()) {
        echo json_encode(["res" => "insertado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "No fue posible guardar la experiencia"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos no recibidos"]);
}
?>
