<?php
include 'conexion.php';

header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT e.id_evento,
               e.tipo_servicio AS nombre,
               e.correo_fk,
               e.numero_personas,
               e.fecha_inicio,
               e.franja_horaria
        FROM eventos e
        ORDER BY e.fecha_inicio ASC";

$result = mysqli_query($conn, $sql);

$lista = array();
while ($row = mysqli_fetch_assoc($result)) {
    $row['numero_personas'] = (int)$row['numero_personas'];
    $lista[] = $row;
}

echo json_encode($lista, JSON_UNESCAPED_UNICODE);
?>
