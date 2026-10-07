<?php

header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';

$sql = "SELECT
			id_menu AS IdMenu,
			nombre AS Nombre,
			tiempos_menu AS TiemposMenu,
			precio AS Precio,
			descripcion AS Descripcion,
			img_plato_fuerte AS ImgMenu
		FROM menu
		WHERE estado = 'activo'
		ORDER BY fecha_creacion DESC";

$resultado = $conexion->query($sql);

if (!$resultado) {
	echo json_encode([
		'error' => $conexion->error
	], JSON_UNESCAPED_UNICODE);
	exit;
}

$menus = [];

while ($menu = $resultado->fetch_assoc()) {
	$menu['TiemposMenu'] = (int) $menu['TiemposMenu'];
	$menu['Precio'] = (int) $menu['Precio'];
	$menus[] = $menu;
}

echo json_encode($menus, JSON_UNESCAPED_UNICODE);

$conexion->close();
?>
