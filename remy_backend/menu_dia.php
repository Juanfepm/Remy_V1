<?php

header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';


$baseImg = "img_menu/";

$sql = "SELECT * FROM menu WHERE estado = 'activo' LIMIT 1";

$resultado = $conexion->query($sql);

if ($resultado && $resultado->num_rows > 0) {

    $menu = $resultado->fetch_assoc();

    echo json_encode([
        "titulo"      => $menu["nombre"],
        "descripcion" => $menu["descripcion"],
        "precio"      => (int)$menu["precio"],

        "imagenPlatoFuerte" => $baseImg . $menu["img_plato_fuerte"],
        "imagenBebida"      => $baseImg . $menu["img_bebida"],
        "imagenEntrada"     => $baseImg . $menu["img_entrada"],
        "imagenPostre"      => $baseImg . $menu["img_postre"]
    ], JSON_UNESCAPED_UNICODE);

} else {

    echo json_encode([
        "error" => "No hay menú registrado"
    ]);
}

$conexion->close();

?>
