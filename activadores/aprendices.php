<?php
// Inicia todos los servicios del módulo de aprendices en desarrollo.
if (PHP_SAPI !== 'cli') exit('Ejecute desde consola: php activadores/aprendices.php' . PHP_EOL);
putenv('REMY_ACTIVE_MODULE=aprendices');
$root = dirname(__DIR__);
passthru(escapeshellarg(PHP_BINARY) . ' -S 127.0.0.1:8001 -t ' . escapeshellarg($root . '/public') . ' ' . escapeshellarg($root . '/public/router.php'));
