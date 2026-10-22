<?php
declare(strict_types=1);

require dirname(__DIR__) . '/app/Core/bootstrap.php';
$vendor = dirname(__DIR__) . '/vendor/autoload.php';
if (is_file($vendor)) require $vendor;

$base = base_url('');
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if ($base !== '' && str_starts_with($path, $base . '/')) $path = substr($path, strlen($base));
elseif ($base !== '' && $path === $base) $path = '/';
$path = rawurldecode($path);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $active = env_value('REMY_ACTIVE_MODULE');
    $activePrefix = '/' . $active;
    $isActivePath = $active !== '' && ($path === $activePrefix || str_starts_with($path, $activePrefix . '/'));
    $isInventoryPath = $path === '/inventario' || str_starts_with($path, '/inventario/');
    $inventoryAvailable = $isInventoryPath && in_array($active, ['aprendices', 'platos', 'inventario'], true);
    $inventoryReturnPath = $active === 'inventario' && ($path === '/platos' || str_starts_with($path, '/platos/') || $path === '/aprendices/dashboard');
    if ($active !== '' && $path !== '/' && !$isActivePath && !$inventoryAvailable && !$inventoryReturnPath && !str_starts_with($path, '/static/') && !($active === 'reservas' && str_starts_with($path, '/modulo_reservas_php/'))) {
        http_response_code(404); exit;
    }
    if ($path === '/') {
        $home = match ($active) {
            'aprendices' => '/aprendices/login',
            'platos' => '/platos/',
            'inventario' => '/inventario/ingredientes',
            default => '/reservas/aplicacion/menu_dia.html',
        };
        redirect_to($home);
    }
    if ($path === '/inventario' || $path === '/inventario/') redirect_to('/inventario/ingredientes');
    if (str_starts_with($path, '/inventario/api/')) {
        \Remy\Modules\Inventario\Api::dispatch(substr($path, strlen('/inventario')), $method);
    }
    if ($path === '/inventario/ingredientes') { render_view('modulo_inventario/index'); exit; }
    if (str_starts_with($path, '/modulo_reservas_php/')) {
        \Remy\Modules\Reservas\Router::dispatch(substr($path, strlen('/modulo_reservas_php/')), $method);
    }
    if (str_starts_with($path, '/aprendices/api/')) {
        \Remy\Modules\Aprendices\Api::dispatch(substr($path, strlen('/aprendices/api')), $method);
    }
    if (str_starts_with($path, '/platos/api/') || $path === '/platos/buscar') {
        \Remy\Modules\Platos\Api::dispatch(substr($path, strlen('/platos')), $method);
    }
    if (preg_match('~^/platos/img_remy/([^/]+)$~', $path, $m)) {
        $filename = basename($m[1]);
        $file = dirname(__DIR__) . '/storage/uploads/platos/' . $filename;
        if (!is_file($file)) { http_response_code(404); exit; }
        header('Content-Type: image/png');
        readfile($file); exit;
    }
    if ($path === '/aprendices' || $path === '/aprendices/' || $path === '/aprendices/salir') redirect_to('/aprendices/login');
    $apprentices = [
        '/aprendices/login' => 'index', '/aprendices/liderazgo' => 'Liderazgo',
        '/aprendices/dashboard' => 'Panel_Instructor', '/aprendices/cargaMasiva' => 'carga_masiva/carga_masiva',
        '/aprendices/cargaIndividual' => 'usuario/carga_individual',
        '/aprendices/crear_instructor' => 'usuario/crear_instructor',
        '/aprendices/listaAprendices' => 'usuario/listaAprendices',
        '/aprendices/asignarLiderazgo' => 'asignar_liderazgo/asignar_liderazgo',
        '/aprendices/detalleEvento' => 'asignar_liderazgo/detalleEvento',
        '/aprendices/detalleAprendiz' => 'usuario/detalleAprendiz',
        '/aprendices/modificarAprendiz' => 'usuario/ModificarAprendiz',
    ];
    if (isset($apprentices[$path])) { render_view('modulo_aprendices/' . $apprentices[$path]); exit; }
    $dishes = [
        '/platos_menu' => 'platos/platos_menu',
        '/busqueda' => 'busqueda/busqueda', '/crear_plato' => 'platos/crear_plato',
        '/crear_menu' => 'menus/crear_menu',
    ];
    if ($path === '/platos' || $path === '/platos/') redirect_to('/platos/platos_menu');
    if (str_starts_with($path, '/platos/')) {
        $sub = substr($path, strlen('/platos'));
        if (isset($dishes[$sub])) { render_view('modulo_platos/' . $dishes[$sub]); exit; }
        if (preg_match('~^/(modificar_plato|detalle_plato|modificar_menu|detalle_menu)/[^/]+$~', $sub, $m)) {
            $folder = str_ends_with($m[1], '_menu') ? 'menus' : 'platos';
            render_view('modulo_platos/' . $folder . '/' . $m[1]); exit;
        }
    }
    if ($path === '/reservas/' || $path === '/reservas' || $path === '/reservas/aplicacion/index.html') redirect_to('/reservas/aplicacion/menu_dia.html');
    if (preg_match('~^/reservas/aplicacion/([a-zA-Z0-9_]+)\.html$~', $path, $m)) {
        render_view('modulo_reservas/aplicacion/' . $m[1]); exit;
    }
    http_response_code(404);
    echo 'Página no encontrada';
} catch (Throwable $e) {
    error_log((string) $e);
    if (str_contains($path, '/api/') || str_starts_with($path, '/modulo_reservas_php/')) json_response(['error' => 'Error interno del servidor'], 500);
    http_response_code(500);
    echo 'Error interno del servidor';
}
