<?php
include 'conexion.php';
header('Content-Type: application/json');

$query = "SELECT * FROM eventos ORDER BY id_evento ASC";
$resultado = mysqli_query($conexion, $query);
$eventos = [];

while ($fila = mysqli_fetch_assoc($resultado)) {
    
    $fila['numero_personas'] = (int)$fila['numero_personas'];
    $fila['asistentes'] = (int)$fila['asistentes'];
    $fila['costo_total'] = (int)$fila['costo_total'];
    $eventos[] = $fila;
}

echo json_encode($eventos);
mysqli_close($conexion);
?>