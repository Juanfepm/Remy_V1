<?php
declare(strict_types=1);

date_default_timezone_set('America/Bogota');

spl_autoload_register(static function (string $class): void {
    $prefix = 'Remy\\';
    if (str_starts_with($class, $prefix)) {
        $path = dirname(__DIR__) . '/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (is_file($path)) require_once $path;
    }
});

function env_value(string $key, string $default = ''): string {
    $value = getenv($key);
    return $value === false ? $default : $value;
}

function base_url(string $path = ''): string {
    $explicit = getenv('REMY_BASE_PATH');
    $base = $explicit !== false ? rtrim($explicit, '/') : rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/index.php')), '/.');
    if ($base === '/') $base = '';
    return $base . ($path === '' ? '' : '/' . ltrim($path, '/'));
}

function json_response(mixed $payload, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_PRESERVE_ZERO_FRACTION);
    exit;
}

function request_data(): array {
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($type, 'application/json')) {
        $json = json_decode(file_get_contents('php://input'), true);
        return is_array($json) ? $json : [];
    }
    if (in_array($_SERVER['REQUEST_METHOD'] ?? '', ['PUT', 'PATCH'], true)) {
        parse_str(file_get_contents('php://input'), $form);
        return $form;
    }
    return $_POST;
}

function render_view(string $name): void {
    $root = dirname(__DIR__) . '/Views/';
    $file = realpath($root . $name . '.php');
    if (!$file || !str_starts_with($file, realpath($root) . DIRECTORY_SEPARATOR)) {
        http_response_code(404);
        echo 'Página no encontrada';
        return;
    }
    header('Content-Type: text/html; charset=utf-8');
    require $file;
}

function redirect_to(string $path): never {
    header('Location: ' . base_url($path), true, 302);
    exit;
}
