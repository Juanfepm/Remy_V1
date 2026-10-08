<?php
include 'conexion.php';

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



$fecha = $_GET['fecha'] ?? date('Y-m-d');

$stmt = $conn->prepare(
    "SELECT COUNT(*) AS total
     FROM eventos
     WHERE DATE(fecha_inicio) = ? AND estado != 'cancelado'"
);

if ($stmt === false) {
    http_response_code(500);
    $response["error"] = "No se pudo preparar la consulta: " . $conn->error;
    echo json_encode($response);
    $conn->close();
    exit;
}

$stmt->bind_param("s", $fecha);
$stmt->execute();
$stmt->bind_result($total);
$stmt->fetch();
$stmt->close();

$response["Fecha"] = $fecha;
$response["Disponible"] = ((int) $total) === 0;

echo json_encode($response);

$conn->close();
?>