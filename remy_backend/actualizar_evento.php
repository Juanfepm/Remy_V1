<?php
header('Content-Type: application/json');
include 'conexion.php';



$body = json_decode(file_get_contents('php://input'), true) ?: [];

$idEvento       = $_REQUEST['id_evento']       ?? $body['idEvento']       ?? null;
$numeroPersonas = $_REQUEST['numero_personas'] ?? $body['numeroPersonas'] ?? null;
$fechaInicio    = $_REQUEST['fecha_inicio']    ?? $body['fechaInicio']    ?? null;

if (!$idEvento || !$numeroPersonas) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Datos incompletos"]);
    exit;
}


$sqlMenu = "SELECT id_menu_fk FROM eventos WHERE id_evento = ?";
$stmtM   = $conn->prepare($sqlMenu);
$stmtM->bind_param("s", $idEvento);
$stmtM->execute();
$resM   = $stmtM->get_result()->fetch_assoc();
$idMenu = $resM['id_menu_fk'] ?? null;
$stmtM->close();

$nuevoCosto = 0;
if ($idMenu) {
    $sqlP  = "SELECT precio FROM menu WHERE id_menu = ?";
    $stmtP = $conn->prepare($sqlP);
    $stmtP->bind_param("s", $idMenu);
    $stmtP->execute();
    $resP       = $stmtP->get_result()->fetch_assoc();
    $nuevoCosto = (int) $numeroPersonas * (int) ($resP['precio'] ?? 0);
    $stmtP->close();
}


if ($fechaInicio) {
    $stmt = $conn->prepare(
        "UPDATE eventos 
         SET numero_personas    = ?,
             costo_total        = ?,
             fecha_inicio       = ?,
             fecha_modificacion = NOW()
         WHERE id_evento = ?"
    );
    $stmt->bind_param("iiss", $numeroPersonas, $nuevoCosto, $fechaInicio, $idEvento);
} else {
    $stmt = $conn->prepare(
        "UPDATE eventos 
         SET numero_personas    = ?,
             costo_total        = ?,
             fecha_modificacion = NOW()
         WHERE id_evento = ?"
    );
    $stmt->bind_param("iis", $numeroPersonas, $nuevoCosto, $idEvento);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "mensaje" => "Evento actualizado"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
