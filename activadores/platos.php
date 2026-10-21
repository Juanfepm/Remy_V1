<?php
// Inicia todos los servicios del módulo de platos y menús en desarrollo.
if (PHP_SAPI !== 'cli') exit('Ejecute desde consola: php activadores/platos.php' . PHP_EOL);
putenv('REMY_ACTIVE_MODULE=platos');
$root = dirname(__DIR__);
passthru(escapeshellarg(PHP_BINARY) . ' -S 127.0.0.1:8002 -t ' . escapeshellarg($root . '/public') . ' ' . escapeshellarg($root . '/public/router.php'));
