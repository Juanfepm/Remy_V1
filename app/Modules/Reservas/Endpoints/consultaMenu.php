<?php

header('Content-Type: application/json; charset=utf-8');


$conexion = \Remy\Core\Database::connectMysqli();
$conn = $conexion;


$conn->set_charset("utf8");


$hoy = date('Y-m-d');
$sql = "SELECT m.*
        FROM menu m
        LEFT JOIN programacion_dia p
          ON p.id_menu = m.id_menu AND DATE(p.fecha_reserva) = ?
        WHERE m.estado = 'activo'
        ORDER BY (p.id_menu IS NOT NULL) DESC, m.id_menu ASC
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $hoy);
$stmt->execute();
$result = $stmt->get_result();

$menu = array();

if ($result) {
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $row['precio'] = (int)$row['precio'];
            $row['tiempos_menu'] = (int)$row['tiempos_menu'];
            $row['img_plato_fuerte'] = trim((string) ($row['img_plato_fuerte'] ?? '')) ?: 'plato.jpg';
            $row['img_bebida'] = trim((string) ($row['img_bebida'] ?? '')) ?: 'bebida.jpg';
            $row['img_entrada'] = trim((string) ($row['img_entrada'] ?? '')) ?: 'entrada.jpg';
            $row['img_postre'] = trim((string) ($row['img_postre'] ?? '')) ?: 'postre.jpg';
            $menu[] = $row;
        }
    }
} else {
    
    die(json_encode(["error" => $conn->error]));
}


echo json_encode($menu, JSON_UNESCAPED_UNICODE);
?>
