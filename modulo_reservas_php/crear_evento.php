<?php
include 'conexion.php';
include 'correo_institucional.php';
include_once 'notificar_correo.php';

header('Content-Type: application/json');



const DEBUG = true;
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        echo json_encode(DEBUG
            ? ["error" => "Error interno del servidor", "detalle" => $error['message'], "archivo" => $error['file'], "linea" => $error['line']]
            : ["error" => "Error interno del servidor"]
        );
    }
});

$response = array();

const MIN_PERSONAS = 20;
const MAX_PERSONAS = 40;
const DIAS_ANTICIPACION = 8;

$datos = json_decode(file_get_contents("php://input"));

if ($datos === null) {
    http_response_code(400);
    $response["error"] = "No se recibió un JSON válido en el cuerpo de la petición";
    echo json_encode($response);
    $conn->close();
    exit;
}


if (empty($datos->CorreoFk) || empty($datos->FechaInicio) || empty($datos->IdMenuFk)) {
    http_response_code(400);
    $response["error"] = "Faltan datos obligatorios (CorreoFk, FechaInicio o IdMenuFk)";
    echo json_encode($response);
    $conn->close();
    exit;
}

if (!es_correo_institucional($datos->CorreoFk)) {
    http_response_code(400);
    $response["error"] = "El correo debe ser institucional (@soy.sena.edu.co o @sena.edu.co)";
    echo json_encode($response);
    $conn->close();
    exit;
}

$datos->CorreoFk = normalizar_correo($datos->CorreoFk);

$personas = (int) ($datos->NumeroPersonas ?? 0);
if ($personas < MIN_PERSONAS || $personas > MAX_PERSONAS) {
    http_response_code(400);
    $response["error"] = "El número de personas debe estar entre " . MIN_PERSONAS . " y " . MAX_PERSONAS;
    echo json_encode($response);
    $conn->close();
    exit;
}

$fecha = substr($datos->FechaInicio, 0, 10); 
$fechaMinima = date('Y-m-d', strtotime('+' . DIAS_ANTICIPACION . ' days'));
if ($fecha < $fechaMinima) {
    http_response_code(400);
    $response["error"] = "La fecha debe ser al menos " . DIAS_ANTICIPACION . " días después de hoy";
    echo json_encode($response);
    $conn->close();
    exit;
}


$stmtDisp = $conn->prepare(
    "SELECT COUNT(*) AS total FROM eventos WHERE DATE(fecha_inicio) = ? AND estado != 'cancelado'"
);
if ($stmtDisp === false) {
    http_response_code(500);
    $response["error"] = "No se pudo validar disponibilidad: " . $conn->error;
    echo json_encode($response);
    $conn->close();
    exit;
}
$stmtDisp->bind_param("s", $fecha);
$stmtDisp->execute();
$stmtDisp->bind_result($totalEventos);
$stmtDisp->fetch();
$stmtDisp->close();

if ((int) $totalEventos > 0) {
    http_response_code(400);
    $response["error"] = "Ya existe un evento programado para ese día";
    echo json_encode($response);
    $conn->close();
    exit;
}


$stmtCliente = $conn->prepare(
    "INSERT INTO cliente (correo_pk, fecha_registro) VALUES (?, NOW())
     ON DUPLICATE KEY UPDATE correo_pk = correo_pk"
);
if ($stmtCliente !== false) {
    $stmtCliente->bind_param("s", $datos->CorreoFk);
    $stmtCliente->execute();
    $stmtCliente->close();
}


$idEvento = "EVT" . time();



$imagen = "cafe.jpg";
if (stripos($datos->Experiencia, "vino")  !== false) { $imagen = "vino.jpg"; }
if (stripos($datos->Experiencia, "queso") !== false) { $imagen = "quesos.jpg"; }
if (stripos($datos->Experiencia, "postre") !== false) { $imagen = "postre.jpg"; }

$stmt = $conn->prepare(
    "INSERT INTO eventos
        (id_evento, estado, correo_fk, franja_horaria, fecha_inicio, fecha_fin,
         numero_personas, experiencia, id_menu_fk, fecha_creacion, tipo_servicio, asistentes, costo_total, imagen)
     VALUES (?, 'pendiente', ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)"
);

if ($stmt === false) {
    http_response_code(500);
    $response["error"] = "No se pudo preparar el INSERT: " . $conn->error;
    echo json_encode($response);
    $conn->close();
    exit;
}


$stmt->bind_param(
    "sssssisssiis",
    $idEvento,
    $datos->CorreoFk,
    $datos->FranjaHoraria,
    $datos->FechaInicio,
    $datos->FechaInicio, 
    $personas,
    $datos->Experiencia,
    $datos->IdMenuFk,
    $datos->TipoServicio,
    $datos->Asistentes,
    $datos->CostoTotal,
    $imagen
);

if ($stmt->execute()) {

    
    
    
    $aviso = notificar_por_correo('evento', $datos->CorreoFk, [
        "evento"      => $idEvento,
        "experiencia" => $datos->Experiencia,
        "fecha"       => substr($datos->FechaInicio, 0, 10),
        "franja"      => $datos->FranjaHoraria,
        "personas"    => $personas,
        "total"       => $datos->CostoTotal
    ]);
    $response["CorreoEnviado"] = $aviso["enviado"];
    $response["CorreoDetalle"] = $aviso["mensaje"];

    $response["IdEvento"] = $idEvento;
    $response["Estado"] = "pendiente";
    $response["CorreoFk"] = $datos->CorreoFk;
    $response["FranjaHoraria"] = $datos->FranjaHoraria;
    $response["FechaInicio"] = $datos->FechaInicio;
    $response["NumeroPersonas"] = $personas;
    $response["Experiencia"] = $datos->Experiencia;
    $response["IdMenuFk"] = $datos->IdMenuFk;
    $response["CostoTotal"] = $datos->CostoTotal;
} else {
    http_response_code(500);
    $response["error"] = "No se pudo crear la reserva: " . $stmt->error;
}

echo json_encode($response);

$stmt->close();
$conn->close();
?>