<?php
include 'conexion.php';

header('Content-Type: application/json');

$response = array();

$sql = "SELECT 
            e.id_evento AS idEvento,
            e.tipo_servicio     AS nombreEvento,
            e.correo_fk         AS correo,
            e.numero_personas   AS numeroPersonas,
            e.costo_total       AS total,
            e.estado,
            e.fecha_inicio      AS fechaInicio
        FROM eventos e
        WHERE e.estado = 'activo'
        ORDER BY e.fecha_inicio DESC";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $response[] = $row;
    }
}

echo json_encode($response);
$conn->close();
?>