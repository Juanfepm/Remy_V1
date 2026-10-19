<?php


require_once dirname(__DIR__) . '/Correo.php';


function notificar_por_correo($tipo, $correo, $datos) {
    return \Remy\Modules\Reservas\Correo::confirmar((string)$tipo, (string)$correo, (array)$datos);
}
