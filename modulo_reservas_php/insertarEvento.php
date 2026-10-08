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

    // El evento queda a nombre de quien lo crea (el instructor en sesión) y
    // con un menú activo real: correo_fk e id_menu_fk son llaves foráneas.
    $correo = mysqli_real_escape_string($conexion, strtolower(trim($data['correo'] ?? '')));
    if ($correo === '') {
        http_response_code(400);
        echo json_encode(["error" => "Falta el correo de quien crea el evento"]);
        exit;
    }
    mysqli_query($conexion, "INSERT INTO cliente (correo_pk, fecha_registro) VALUES ('$correo', NOW())
                             ON DUPLICATE KEY UPDATE correo_pk = correo_pk");

    $id_menu = mysqli_real_escape_string($conexion, $data['id_menu'] ?? '');
    if ($id_menu === '') {
        $fila = mysqli_fetch_assoc(mysqli_query($conexion,
            "SELECT id_menu FROM menu WHERE estado = 'activo' ORDER BY id_menu ASC LIMIT 1"));
        $id_menu = $fila['id_menu'] ?? '';
    }
    if ($id_menu === '') {
        http_response_code(400);
        echo json_encode(["error" => "No hay ningún menú activo para asociar al evento"]);
        exit;
    }

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