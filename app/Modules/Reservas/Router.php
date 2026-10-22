<?php
declare(strict_types=1);
namespace Remy\Modules\Reservas;

final class Router {
    private const ADMIN = [
        'actualizarEvento.php', 'actualizarExperiencia.php', 'actualizar_estado_reserva.php',
        'actualizar_evento.php', 'cancelar_evento.php', 'consultaEvento.php',
        'consultaExperiencia.php', 'eliminarEvento.php', 'eliminarExperiencia.php',
        'insertarEvento.php', 'insertarExperiencia.php', 'listar_evento_id.php',
        'listar_eventos.php', 'listar_reservas_aprendiz.php', 'listar_reservas_hoy.php',
    ];
    private const INSTRUCTOR = [
        'actualizarEvento.php', 'actualizarExperiencia.php', 'eliminarEvento.php',
        'actualizar_evento.php', 'eliminarExperiencia.php', 'insertarEvento.php', 'insertarExperiencia.php',
    ];

    public static function dispatch(string $path, string $method): never {
        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
        if ($path === 'logout.php') {
            \Remy\Core\Sesion::cerrar();
            \json_response(['ok' => true]);
        }
        if ($path === '' || $path === '/') \redirect_to('/reservas/');
        if (!preg_match('/^[A-Za-z0-9_]+\.php$/', $path)) \json_response(['error' => 'Ruta no encontrada'], 404);
        $target = __DIR__ . '/Endpoints/' . $path;
        if (!is_file($target) || in_array($path, ['notificar_correo.php','correo_institucional.php'], true)) \json_response(['error' => 'Ruta no encontrada'], 404);
        // Sesión única del panel (la abre /aprendices/login o login.php).
        if (in_array($path, self::ADMIN, true)) {
            \Remy\Core\Sesion::exigirApi();
            if (in_array($path, self::INSTRUCTOR, true) && !\Remy\Core\Sesion::esInstructor()) \json_response(['ok' => false, 'mensaje' => 'Sólo instructores.'], 403);
        }
        // The existing PHP endpoints use relative includes; keep their working directory private.
        chdir(dirname($target));
        require $target;
        exit;
    }
}
