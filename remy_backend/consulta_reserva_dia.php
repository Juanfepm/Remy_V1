<?php
include 'conexion.php';

header('Content-Type: application/json; charset=utf-8');



$correo = strtolower(trim($_GET['correo'] ?? ''));

if ($correo === '') {
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Falta el correo."]);
    $conn->close();
    exit;
}

$stmt = $conn->prepare(
    "SELECT r.id_reserva, r.cantidad_menus, r.fecha_reserva, r.estado, m.precio
     FROM reservas_dia r
     LEFT JOIN programacion_dia p ON p.fecha_reserva = r.fecha_reserva
     LEFT JOIN menu m             ON m.id_menu = p.id_menu
     WHERE r.correo_fk = ? AND DATE(r.fecha_reserva) = CURDATE() AND r.estado <> 'cancelada'
     LIMIT 1"
);
$stmt->bind_param("s", $correo);
$stmt->execute();
$reserva = $stmt->get_result()->fetch_assoc();
$stmt->close();

echo json_encode([
    "ok"           => true,
    "tieneReserva" => $reserva ? true : false,
    "idReserva"    => $reserva ? (int) $reserva['id_reserva']     : null,
    "cantMenus"    => $reserva ? (int) $reserva['cantidad_menus'] : null,
    "estado"       => $reserva ? $reserva['estado']               : null,
    "precioMenu"   => $reserva ? (int) $reserva['precio']         : null
], JSON_UNESCAPED_UNICODE);

$conn->close();
