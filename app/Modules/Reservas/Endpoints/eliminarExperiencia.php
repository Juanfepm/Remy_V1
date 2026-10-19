<?php
include 'conexion.php';

header('Content-Type: application/json');

if (isset($_GET['id'])) {
    $id = (string)$_GET['id'];
    $stmt = $conexion->prepare('DELETE FROM experiencias WHERE id_experiencia = ?');
    $stmt->bind_param('s', $id);
    if ($stmt->execute()) {
        echo json_encode(["res" => "eliminado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "No fue posible eliminar la experiencia"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "ID no proporcionado"]);
}
?>
