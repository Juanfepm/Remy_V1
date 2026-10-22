<?php
// Inicia el módulo de inventario e ingredientes en desarrollo.
if (PHP_SAPI !== 'cli') exit('Ejecute desde consola: php activadores/inventario.php' . PHP_EOL);
putenv('REMY_ACTIVE_MODULE=inventario');
$root = dirname(__DIR__);
passthru(escapeshellarg(PHP_BINARY) . ' -S 127.0.0.1:8004 -t ' . escapeshellarg($root . '/public') . ' ' . escapeshellarg($root . '/public/router.php'));
