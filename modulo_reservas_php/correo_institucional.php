<?php


function es_correo_institucional($correo) {
    return (bool) preg_match(
        '/^[A-Za-z0-9._%+-]+@(soy\.sena\.edu\.co|sena\.edu\.co)$/i',
        trim((string) $correo)
    );
}



function normalizar_correo($correo) {
    return strtolower(trim((string) $correo));
}
