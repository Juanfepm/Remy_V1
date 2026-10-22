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

/**
 * Valores de .env y configuracion.env en la raíz del proyecto (no se versionan).
 * En un hosting sólo FTP no hay panel para variables de entorno; el .htaccess
 * de la raíz impide descargar estos archivos. Si una clave está en los dos,
 * gana .env.
 */
function config_file_values(): array {
    static $values = null;
    if ($values !== null) return $values;
    $values = [];
    foreach (['.env', 'configuracion.env'] as $name) {
        $file = dirname(__DIR__, 2) . '/' . $name;
        if (!is_file($file) || !is_readable($file)) continue;
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) continue;
            [$key, $value] = array_map('trim', explode('=', $line, 2));
            if (strlen($value) >= 2 && ($value[0] === '"' || $value[0] === "'") && $value[-1] === $value[0]) $value = substr($value, 1, -1);
            if ($key !== '' && !array_key_exists($key, $values)) $values[$key] = $value;
        }
    }
    return $values;
}

/** Variables de entorno reales primero; si no existen, los archivos de configuración. */
function env_value(string $key, string $default = ''): string {
    $value = getenv($key);
    if ($value !== false) return $value;
    return config_file_values()[$key] ?? $default;
}

function base_url(string $path = ''): string {
    $explicit = env_value('REMY_BASE_PATH');
    $scriptName = parse_url((string) ($_SERVER['SCRIPT_NAME'] ?? '/index.php'), PHP_URL_PATH) ?: '/index.php';
    $entryPoint = strtolower(basename(str_replace('\\', '/', $scriptName)));
    $scriptDir = in_array($entryPoint, ['index.php', 'router.php'], true)
        ? dirname($scriptName)
        : '';
    $scriptDir = rtrim(str_replace('\\', '/', $scriptDir), '/.');
    // Si el .htaccess de la raíz del proyecto reenvía todo a public/, las URL
    // visibles no llevan "/public": la base es la carpeta del proyecto.
    if (str_ends_with($scriptDir, '/public')) {
        $uri = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
        if ($uri !== $scriptDir && !str_starts_with($uri, $scriptDir . '/')) $scriptDir = substr($scriptDir, 0, -strlen('/public'));
    }
    $base = $explicit !== '' ? rtrim($explicit, '/') : $scriptDir;
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
