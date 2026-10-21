<?php
// Inicia web, API y correo del módulo de reservas en desarrollo.
if (PHP_SAPI !== 'cli') exit('Ejecute desde consola: php activadores/reservas.php' . PHP_EOL);
putenv('REMY_ACTIVE_MODULE=reservas');
$root = dirname(__DIR__);
passthru(escapeshellarg(PHP_BINARY) . ' -S 127.0.0.1:8003 -t ' . escapeshellarg($root . '/public') . ' ' . escapeshellarg($root . '/public/router.php'));
