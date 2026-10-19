<?php
include 'conexion.php';
include 'correo_institucional.php';
include_once 'notificar_correo.php';

header('Content-Type: application/json; charset=utf-8');



$idEvento = $_POST['id_evento'] ?? $_GET['id_evento'] ?? '';
$correo   = $_POST['correo']    ?? $_GET['correo']    ?? '';

if ($idEvento === '' || $correo === '') {
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Faltan datos."]);
    $conn->close();
    exit;
}

if (!es_correo_institucional($correo)) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "mensaje" => "El correo debe ser institucional (@soy.sena.edu.co o @sena.edu.co)"
    ], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

$correo = normalizar_correo($correo);


$stmtEvento = $conn->prepare(
    "SELECT id_evento, experiencia, fecha_inicio, franja_horaria,
            numero_personas, asistentes, costo_total, estado
     FROM eventos
     WHERE id_evento = ?"
);
$stmtEvento->bind_param("s", $idEvento);
$stmtEvento->execute();
$evento = $stmtEvento->get_result()->fetch_assoc();
$stmtEvento->close();

if (!$evento) {
    http_response_code(404);
    echo json_encode(["ok" => false, "mensaje" => "Ese evento no existe."], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

if (strtolower((string) $evento['estado']) === 'cancelado') {
    http_response_code(409);
    echo json_encode(["ok" => false, "mensaje" => "Ese evento está cancelado."], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

$cupoLibre = ((int) $evento['numero_personas']) - ((int) $evento['asistentes']);

if ($cupoLibre <= 0) {
    http_response_code(409);
    echo json_encode(["ok" => false, "mensaje" => "Este evento ya no tiene cupos disponibles."], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}


$stmtCliente = $conn->prepare(
    "INSERT INTO cliente (correo_pk, fecha_registro) VALUES (?, NOW())
     ON DUPLICATE KEY UPDATE correo_pk = correo_pk"
);
$stmtCliente->bind_param("s", $correo);
$stmtCliente->execute();
$stmtCliente->close();


$stmt = $conn->prepare(
    "INSERT INTO asistencias (id_evento, correo_fk, fecha_registro) VALUES (?, ?, NOW())"
);
$stmt->bind_param("ss", $idEvento, $correo);

if (!$stmt->execute()) {

    
    if ($conn->errno === 1062) {
        http_response_code(409);
        echo json_encode([
            "ok"        => false,
            "duplicada" => true,
            "mensaje"   => "Con este correo ya confirmaste tu asistencia a este evento."
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode(["ok" => false, "mensaje" => "Error de MySQL: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

$stmt->close();


$stmtCupo = $conn->prepare("UPDATE eventos SET asistentes = asistentes + 1 WHERE id_evento = ?");
$stmtCupo->bind_param("s", $idEvento);
$stmtCupo->execute();
$stmtCupo->close();


$aviso = notificar_por_correo('asistencia', $correo, [
    "experiencia" => $evento['experiencia'],
    "fecha"       => substr((string) $evento['fecha_inicio'], 0, 10),
    "franja"      => trim((string) $evento['franja_horaria']),
    "precio"      => (int) $evento['costo_total']
]);

echo json_encode([
    "ok"            => true,
    "idEvento"      => $idEvento,
    "correo"        => $correo,
    "experiencia"   => $evento['experiencia'],
    "cuposLibres"   => $cupoLibre - 1,
    "mensaje"       => "¡Asistencia confirmada!",
    "correoEnviado" => $aviso["enviado"],
    "correoDetalle" => $aviso["mensaje"]
], JSON_UNESCAPED_UNICODE);

$conn->close();
