<?php
// Router for php -S localhost:8000 -t public public/router.php
$file = __DIR__ . (parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if (is_file($file) && realpath($file) !== __FILE__) return false;
require __DIR__ . '/index.php';
