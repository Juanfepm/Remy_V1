<?php


define('URL_MICRO_CORREO', getenv('REMY_URL_CORREO') ?: 'http://127.0.0.1:5090/correo');
const ESPERA_CORREO = 30;


function notificar_por_correo($tipo, $correo, $datos) {

    $cuerpo = json_encode([
        'tipo'   => $tipo,
        'correo' => $correo,
        'datos'  => $datos
    ], JSON_UNESCAPED_UNICODE);

    if (!function_exists('curl_init')) {
        return ["enviado" => false, "mensaje" => "La extensión cURL de PHP está desactivada."];
    }

    $peticion = curl_init(URL_MICRO_CORREO);
    curl_setopt_array($peticion, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $cuerpo,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => ESPERA_CORREO,
        CURLOPT_CONNECTTIMEOUT => 1,
        CURLOPT_IPRESOLVE      => CURL_IPRESOLVE_V4,
        CURLOPT_PROXY          => ''
    ]);

    $respuesta = curl_exec($peticion);
    $error     = curl_error($peticion);
    curl_close($peticion);

    if ($respuesta === false) {
        return [
            "enviado" => false,
            "mensaje" => "No se pudo hablar con el micro de correo (¿está corriendo modulo_reservas_php/correo/app.py?): " . $error
        ];
    }

    $datosRespuesta = json_decode($respuesta, true);

    if (!is_array($datosRespuesta)) {
        return ["enviado" => false, "mensaje" => "El micro de correo respondió algo que no es JSON."];
    }

    return [
        "enviado" => (bool) ($datosRespuesta['enviado'] ?? false),
        "mensaje" => (string) ($datosRespuesta['mensaje'] ?? '')
    ];
}
