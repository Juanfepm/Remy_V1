<?php

header('Content-Type: application/json; charset=utf-8');

$conexion = \Remy\Core\Database::connectMysqli();
$conn = $conexion;

$sql = "SELECT * FROM menu WHERE estado = 'activo' ORDER BY fecha_creacion DESC";

$resultado = $conexion->query($sql);

if (!$resultado) {
	echo json_encode([
		'error' => $conexion->error
	], JSON_UNESCAPED_UNICODE);
	exit;
}

$menus = [];

while ($menu = $resultado->fetch_assoc()) {
	$menus[] = [
		'IdMenu' => $menu['id_menu'],
		'Nombre' => $menu['nombre'],
		'TiemposMenu' => (int) $menu['tiempos_menu'],
		'Precio' => (int) $menu['precio'],
		'Descripcion' => $menu['descripcion'] ?? '',
		'ImgMenu' => trim((string) ($menu['img_plato_fuerte'] ?? '')) ?: 'plato.jpg',
	];
}

echo json_encode($menus, JSON_UNESCAPED_UNICODE);

$conexion->close();
?>
