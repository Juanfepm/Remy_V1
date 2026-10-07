<?php
include 'conexion.php';
header('Content-Type: application/json');


if (ob_get_length()) ob_clean();


$queryHoy = "SELECT
                id_evento, 
                experiencia,
                descripcion,
                fecha_inicio, 
                fecha_fin,
                franja_horaria,
                asistentes,
                numero_personas, 
                costo_total, 
                imagen 
             FROM eventos 
             WHERE DATE(fecha_inicio) = CURDATE() 
             LIMIT 1";

$resHoy = mysqli_query($conexion, $queryHoy);
$eventoHoy = mysqli_fetch_assoc($resHoy);

if ($eventoHoy) {
    $eventoHoy['asistentes'] = (int)$eventoHoy['asistentes'];
    $eventoHoy['numero_personas'] = (int)$eventoHoy['numero_personas'];
    $eventoHoy['costo_total'] = (int)$eventoHoy['costo_total'];
}


$queryProx = "SELECT 
                id_evento, 
                experiencia,
                descripcion,
                fecha_inicio, 
                fecha_fin,
                franja_horaria,
                asistentes,
                numero_personas, 
                costo_total, 
                imagen 
              FROM eventos 
              WHERE DATE(fecha_inicio) > CURDATE() 
              ORDER BY fecha_inicio ASC";

$resProx = mysqli_query($conexion, $queryProx);
$proximos = [];

while ($fila = mysqli_fetch_assoc($resProx)) {
    $fila['asistentes'] = (int)$fila['asistentes'];
    $fila['numero_personas'] = (int)$fila['numero_personas'];
    $fila['costo_total'] = (int)$fila['costo_total'];
    $proximos[] = $fila;
}


echo json_encode([
    "disponible_hoy" => $eventoHoy,
    "proximos" => $proximos
]);

mysqli_close($conexion);
?>