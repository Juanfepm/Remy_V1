<?php
declare(strict_types=1);
namespace Remy\Core;

use PDO;

final class Database {
    public static function connect(): PDO {
        static $pdo;
        if ($pdo instanceof PDO) return $pdo;
        [$host, $port, $name, $user, $pass] = self::configuration();
        $pdo = new PDO("mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec("SET time_zone = '-05:00'");
        return $pdo;
    }

    /** Shared MySQLi connection for the legacy Reservations endpoints. */
    public static function connectMysqli(): \mysqli {
        static $connection;
        if ($connection instanceof \mysqli) return $connection;

        [$host, $port, $name, $user, $pass] = self::configuration();
        // Los endpoints de Reservas revisan errno/->error después de cada
        // consulta (p. ej. 1062 = duplicado -> 409). Desde PHP 8.1 mysqli lanza
        // excepciones por defecto y esas ramas nunca se ejecutaban.
        mysqli_report(MYSQLI_REPORT_OFF);
        $connection = new \mysqli($host, $user, $pass, $name, $port);
        if ($connection->connect_errno) {
            throw new \RuntimeException('No se pudo conectar a MySQL: ' . $connection->connect_error);
        }
        $connection->set_charset('utf8mb4');
        $connection->query("SET time_zone = '-05:00'");
        return $connection;
    }

    private static function configuration(): array {
        $host = \env_value('REMY_DB_HOST', 'localhost');
        $port = (int) \env_value('REMY_DB_PORT', '3306');
        $name = \env_value('REMY_DB_NAME', 'remy');
        $user = \env_value('REMY_DB_USER');
        $pass = \env_value('REMY_DB_PASSWORD');
        if ($user === '') throw new \RuntimeException('Configure REMY_DB_USER.');
        return [$host, $port, $name, $user, $pass];
    }

    public static function rows(string $sql, array $params = []): array {
        $stmt = self::connect()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function row(string $sql, array $params = []): ?array {
        $stmt = self::connect()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch() ?: null;
    }

    public static function exec(string $sql, array $params = []): int {
        $stmt = self::connect()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }
}
