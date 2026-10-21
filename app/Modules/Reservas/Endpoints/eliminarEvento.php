<?php
include 'conexion.php';

header('Content-Type: application/json');

if (isset($_GET['id']) && $_GET['id'] !== '') {
    $id = (string)$_GET['id'];
    $stmt = $conexion->prepare('DELETE FROM eventos WHERE id_evento = ?');
    $stmt->bind_param('s', $id);
    if ($stmt->execute()) {
        echo json_encode(["res" => "eliminado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "No fue posible eliminar el evento"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "ID no proporcionado"]);
}
?>
