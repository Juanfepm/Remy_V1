<?php

header('Content-Type: application/json; charset=utf-8');

$conexion = \Remy\Core\Database::connectMysqli();
$conn = $conexion;


$baseImg = "assets/img_menu/";

$sql = "SELECT * FROM menu WHERE estado = 'activo' LIMIT 1";

$resultado = $conexion->query($sql);

if ($resultado && $resultado->num_rows > 0) {

    $menu = $resultado->fetch_assoc();
    $imagenPlatoFuerte = trim((string) ($menu['img_plato_fuerte'] ?? '')) ?: 'plato.jpg';
    $imagenBebida = trim((string) ($menu['img_bebida'] ?? '')) ?: 'bebida.jpg';
    $imagenEntrada = trim((string) ($menu['img_entrada'] ?? '')) ?: 'entrada.jpg';
    $imagenPostre = trim((string) ($menu['img_postre'] ?? '')) ?: 'postre.jpg';

    echo json_encode([
        "titulo"      => $menu["nombre"],
        "descripcion" => $menu["descripcion"],
        "precio"      => (int)$menu["precio"],

        "imagenPlatoFuerte" => $baseImg . $imagenPlatoFuerte,
        "imagenBebida"      => $baseImg . $imagenBebida,
        "imagenEntrada"     => $baseImg . $imagenEntrada,
        "imagenPostre"      => $baseImg . $imagenPostre
    ], JSON_UNESCAPED_UNICODE);

} else {

    echo json_encode([
        "error" => "No hay menú registrado"
    ]);
}

$conexion->close();

?>
