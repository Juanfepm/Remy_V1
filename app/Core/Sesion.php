<?php
declare(strict_types=1);
namespace Remy\Core;

/**
 * Sesión única del panel (instructor y aprendiz).
 *
 * La abre el login (/aprendices/login) y la comparten todos los módulos:
 * páginas del panel, administración de reservas y las API de platos e
 * inventario. Aprendices, además, sigue usando su token JWT en su API.
 * Las páginas públicas de reservas no crean sesión para los visitantes.
 */
final class Sesion {
    private const NOMBRE = 'REMY_SESION';
    private const INSTRUCTOR = 1;
    private const APRENDIZ = 2;

    public static function iniciar(): void {
        if (session_status() === PHP_SESSION_ACTIVE) return;
        ini_set('session.gc_maxlifetime', '7200');
        session_name(self::NOMBRE);
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => \base_url('/'),
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        ]);
        if (!session_start()) throw new \RuntimeException('No se pudo iniciar la sesión PHP.');
    }

    /** Reanuda una sesión existente sin crear cookies para quien no ha iniciado sesión. */
    private static function reanudar(): bool {
        if (session_status() === PHP_SESSION_ACTIVE) return true;
        if (empty($_COOKIE[self::NOMBRE])) return false;
        self::iniciar();
        return true;
    }

    /** $usuario: fila de usuarios con id_usuario, nombre, apellido, correo, rol_usuario y ficha. */
    public static function abrir(array $usuario): void {
        self::iniciar();
        session_regenerate_id(true);
        $_SESSION['remy_usuario'] = (string)$usuario['id_usuario'];
        $_SESSION['remy_rol'] = (int)$usuario['rol_usuario'];
        $_SESSION['remy_nombre'] = trim(($usuario['nombre'] ?? '') . ' ' . ($usuario['apellido'] ?? ''));
        $_SESSION['remy_correo'] = (string)($usuario['correo'] ?? '');
        $_SESSION['remy_ficha'] = $usuario['ficha'] ?? null;
    }

    /** Usuario con sesión abierta, con la forma que usa el panel de reservas; null si no hay sesión. */
    public static function usuario(): ?array {
        if (!self::reanudar()) return null;
        $rol = (int)($_SESSION['remy_rol'] ?? 0);
        if (!in_array($rol, [self::INSTRUCTOR, self::APRENDIZ], true) || empty($_SESSION['remy_usuario'])) return null;
        return [
            'ok' => true,
            'idUsuario' => $_SESSION['remy_usuario'],
            'nombre' => $_SESSION['remy_nombre'] ?? '',
            'correo' => $_SESSION['remy_correo'] ?? '',
            'rol' => $rol,
            'rolNombre' => $rol === self::INSTRUCTOR ? 'instructor' : 'aprendiz',
            'ficha' => $_SESSION['remy_ficha'] ?? null,
        ];
    }

    public static function esInstructor(): bool {
        return (self::usuario()['rol'] ?? 0) === self::INSTRUCTOR;
    }

    public static function cerrar(): void {
        if (!self::reanudar()) return;
        $_SESSION = [];
        $cookie = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 3600,
            'path' => $cookie['path'],
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => $cookie['secure'],
        ]);
        session_destroy();
    }

    /** Para las API del panel: responde 401 si no hay sesión. */
    public static function exigirApi(): array {
        $usuario = self::usuario();
        if (!$usuario) \json_response(['ok' => false, 'mensaje' => 'Inicie sesión para continuar.'], 401);
        return $usuario;
    }
}
