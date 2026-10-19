<?php
declare(strict_types=1);
namespace Remy\Core;

use PDO;

final class Database {
    public static function connect(): PDO {
        static $pdo;
        if ($pdo instanceof PDO) return $pdo;
        $host = \env_value('REMY_DB_HOST', 'localhost');
        $port = \env_value('REMY_DB_PORT', '3306');
        $name = \env_value('REMY_DB_NAME', 'remy');
        $user = \env_value('REMY_DB_USER');
        $pass = \env_value('REMY_DB_PASSWORD');
        if ($user === '') throw new \RuntimeException('Configure REMY_DB_USER.');
        $pdo = new PDO("mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec("SET time_zone = '-05:00'");
        return $pdo;
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
