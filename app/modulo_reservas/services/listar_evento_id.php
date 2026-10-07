<?php
header('Content-Type: application/json');
include 'conexion.php';

$idEvento = $_GET['id_evento'] ?? null;

if (!$idEvento) {
    http_response_code(400);
    echo json_encode(["error" => "Falta id_evento"]);
    exit;
}

$sql = "SELECT 
            id_evento       AS idEvento,
            tipo_servicio   AS nombreEvento,
            correo_fk       AS correo,
            numero_personas AS numeroPersonas,
            costo_total     AS total,
            estado,
            fecha_inicio    AS fechaInicio
        FROM eventos
        WHERE id_evento = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $idEvento);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $evento = $resultado->fetch_assoc();
    $evento['numeroPersonas'] = (int) $evento['numeroPersonas'];
    $evento['total']          = (int) $evento['total'];
    echo json_encode($evento);
} else {
    http_response_code(404);
    echo json_encode(["error" => "Evento no encontrado"]);
}

$stmt->close();
$conn->close();
?>