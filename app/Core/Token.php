<?php
declare(strict_types=1);
namespace Remy\Core;

final class Token {
    private static function encodePart(array $value): string {
        return rtrim(strtr(base64_encode(json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)), '+/', '-_'), '=');
    }

    public static function issue(array $claims): string {
        $claims['exp'] = time() + 1800;
        $body = self::encodePart(['alg' => 'HS256', 'typ' => 'JWT']) . '.' . self::encodePart($claims);
        $signature = hash_hmac('sha256', $body, self::secret(), true);
        return $body . '.' . rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
    }

    public static function verify(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        [$header, $claims, $signature] = $parts;
        $decodedHeader = json_decode(base64_decode(strtr($header, '-_', '+/')), true);
        if (($decodedHeader['alg'] ?? '') !== 'HS256') return null;
        $expected = rtrim(strtr(base64_encode(hash_hmac('sha256', "$header.$claims", self::secret(), true)), '+/', '-_'), '=');
        if (!hash_equals($expected, $signature)) return null;
        $payload = json_decode(base64_decode(strtr($claims, '-_', '+/')), true);
        return is_array($payload) && ($payload['exp'] ?? 0) > time() ? $payload : null;
    }

    public static function requireUser(): array {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $claims = str_starts_with($header, 'Bearer ') ? self::verify(substr($header, 7)) : null;
        if (!$claims) \json_response(['error' => 'Token ausente, inválido o expirado'], 401);
        header('X-Nuevo-Token: ' . self::issue(array_diff_key($claims, ['exp' => 1])));
        return $claims;
    }

    private static function secret(): string {
        $secret = \env_value('REMY_SECRET_KEY');
        if ($secret === '' || $secret === 'cambiar_esta_clave') throw new \RuntimeException('Configure REMY_SECRET_KEY.');
        return $secret;
    }
}
