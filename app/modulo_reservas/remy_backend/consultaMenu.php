<?php

header('Content-Type: application/json; charset=utf-8');


include_once 'conexion.php'; 


$conn->set_charset("utf8");


$hoy = date('Y-m-d');
$sql = "SELECT m.id_menu, m.nombre, m.tiempos_menu, m.precio, m.descripcion, m.estado,
               m.fecha_creacion, m.img_plato_fuerte, m.img_bebida, m.img_entrada, m.img_postre
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
            $menu[] = $row;
        }
    }
} else {
    
    die(json_encode(["error" => $conn->error]));
}


echo json_encode($menu, JSON_UNESCAPED_UNICODE);
?>