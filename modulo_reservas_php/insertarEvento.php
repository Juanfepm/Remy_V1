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
    $asistentes = (int)($data['asistentes'] ?? 0);
    $costo = (int)($data['costo_total'] ?? 0);
    $descripcion = mysqli_real_escape_string($conexion, $data['descripcion'] ?? '');
    $img = mysqli_real_escape_string($conexion, $data['imagen'] ?? 'cafe.jpg');

    if (stripos($experiencia, 'vino') !== false) { $img = 'vino.jpg'; }
    if (stripos($experiencia, 'queso') !== false) { $img = 'quesos.jpg'; }

    $correo = "carlos.lopez@gmail.com";
    $id_menu = "MEN-000001";

    $query = "INSERT INTO eventos (id_evento, estado, correo_fk, franja_horaria, fecha_inicio, fecha_fin, numero_personas, experiencia, descripcion, id_menu_fk, costo_total, tipo_servicio, asistentes, imagen)
              VALUES ('$id', 'activo', '$correo', '$franja', '$fecha_inicio', '$fecha_fin', $personas, '$experiencia', '$descripcion', '$id_menu', $costo, 'Presencial', $asistentes, '$img')";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(["res" => "insertado"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => mysqli_error($conexion), "sql" => $query]);
    }
}
?>