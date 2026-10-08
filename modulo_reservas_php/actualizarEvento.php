<?php
include 'conexion.php';
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    $id = mysqli_real_escape_string($conexion, $data['id_evento']);
    $experiencia = substr(mysqli_real_escape_string($conexion, $data['experiencia']), 0, 64);
    $franja = substr(mysqli_real_escape_string($conexion, $data['franja_horaria']), 0, 20);
    $fecha_inicio = mysqli_real_escape_string($conexion, $data['fecha_inicio']);
    $fecha_fin = mysqli_real_escape_string($conexion, $data['fecha_fin']);
    $personas = (int)$data['numero_personas'];
    $descripcion = mysqli_real_escape_string($conexion, $data['descripcion'] ?? '');
    $costo = (int)($data['costo_total'] ?? 0);

    $query = "UPDATE eventos SET
              experiencia = '$experiencia',
              fecha_inicio = '$fecha_inicio',
              fecha_fin = '$fecha_fin',
              franja_horaria = '$franja',
              numero_personas = $personas,
              descripcion = '$descripcion',
              costo_total = $costo
              WHERE id_evento = '$id'";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(["res" => "actualizado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => mysqli_error($conexion), "query" => $query]);
    }
}
?>