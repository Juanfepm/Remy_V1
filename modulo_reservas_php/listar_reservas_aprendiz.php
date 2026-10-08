<?php
include 'conexion.php';
header('Content-Type: application/json');

$response = array();

$sql = "SELECT 
    r.id_reserva    AS idReserva,
    r.correo_fk     AS correo,
    r.cantidad_menus AS cantMenus,
    r.estado,
    m.precio        AS precioMenu
FROM reservas_dia r
JOIN programacion_dia p ON DATE(p.Fecha_Reserva) = DATE(r.Fecha_reserva)
JOIN menu m             ON m.id_menu = p.id_menu
WHERE DATE(r.Fecha_reserva) = CURDATE()
ORDER BY r.estado ASC";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $response[] = $row;
    }
}

echo json_encode($response);
$conn->close();
?>