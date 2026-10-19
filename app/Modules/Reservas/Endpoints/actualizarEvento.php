<?php
include 'conexion.php';
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    $id = (string)$data['id_evento'];
    $experiencia = substr((string)$data['experiencia'], 0, 64);
    $franja = substr((string)$data['franja_horaria'], 0, 20);
    $fecha_inicio = (string)$data['fecha_inicio'];
    $fecha_fin = (string)$data['fecha_fin'];
    $personas = (int)$data['numero_personas'];
    $descripcion = (string)($data['descripcion'] ?? '');
    $costo = (int)($data['costo_total'] ?? 0);

    $stmt = $conexion->prepare('UPDATE eventos SET experiencia=?,fecha_inicio=?,fecha_fin=?,franja_horaria=?,numero_personas=?,descripcion=?,costo_total=? WHERE id_evento=?');
    $stmt->bind_param('ssssisis', $experiencia, $fecha_inicio, $fecha_fin, $franja, $personas, $descripcion, $costo, $id);
    if ($stmt->execute()) {
        echo json_encode(["res" => "actualizado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "No fue posible actualizar el evento"]);
    }
}
?>
