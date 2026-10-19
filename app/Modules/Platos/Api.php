<?php
declare(strict_types=1);
namespace Remy\Modules\Platos;

use PDO;
use Remy\Core\Database as DB;

final class Api {
    public static function dispatch(string $path, string $method): never {
        if ($path === '/buscar' && $method === 'GET') \json_response(self::search(trim((string)($_GET['q'] ?? ''))));
        if ($path === '/api/ingredientes' && $method === 'GET') \json_response(DB::rows('SELECT id_ingrediente,nombre,unidad_minima FROM ingredientes ORDER BY nombre ASC'));
        if ($path === '/api/platos' && $method === 'GET') \json_response(DB::rows("SELECT * FROM platos ORDER BY CASE WHEN estado='Activo' THEN 0 ELSE 1 END"));
        if ($path === '/api/platos/insertar' && $method === 'POST') self::saveDish();
        if (preg_match('~^/api/platos/([^/]+)/ingredientes$~', $path, $m) && $method === 'GET') self::ingredients($m[1]);
        if (preg_match('~^/api/platos/([^/]+)(?:/modificar)?$~', $path, $m)) {
            if ($method === 'GET') \json_response(DB::row('SELECT * FROM platos WHERE id_plato=?', [$m[1]]));
            if ($method === 'DELETE') self::deleteDish($m[1]);
            if (in_array($method, ['POST','PUT'], true)) self::saveDish($m[1]);
        }
        if ($path === '/api/menus') {
            if ($method === 'GET') \json_response(self::menus());
            if ($method === 'POST') self::saveMenu();
        }
        if (preg_match('~^/api/menus/([^/]+)$~', $path, $m)) {
            if ($method === 'GET') \json_response(self::menus($m[1]));
            if ($method === 'PUT') self::saveMenu($m[1]);
        }
        \json_response(['error' => 'Ruta no encontrada'], 404);
    }

    private static function ingredients(string $id): never {
        $rows = DB::rows('SELECT i.id_ingrediente,i.nombre,i.stock,pi.cantidad,i.unidad_minima FROM plato_ingrediente pi INNER JOIN ingredientes i ON pi.id_ingrediente=i.id_ingrediente WHERE pi.id_plato=?', [$id]);
        \json_response(array_map(fn($r) => ['id_ingrediente' => $r['id_ingrediente'], 'nombre' => $r['nombre'] ?: 'Sin nombre', 'stock' => (float)$r['stock'], 'cantidad' => (float)$r['cantidad'], 'unidad' => $r['unidad_minima'] ?: ''], $rows));
    }

    private static function category(string $raw): int {
        if (ctype_digit($raw)) return (int)$raw;
        return ['entrada' => 1, 'plato fuerte' => 2, 'postre' => 3, 'bebida' => 4][strtolower($raw)] ?? 0;
    }

    private static function nextDishId(int $category): string {
        $prefix = [1 => 'PLEN', 2 => 'PLFU', 3 => 'PLPO', 4 => 'PLBE'][$category] ?? null;
        if (!$prefix) throw new \InvalidArgumentException('Categoría inválida.');
        $row = DB::row('SELECT id_plato FROM platos WHERE id_plato LIKE ? ORDER BY id_plato DESC LIMIT 1', [$prefix . '%']);
        return $prefix . str_pad((string)($row ? (int)substr($row['id_plato'], -3) + 1 : 1), 3, '0', STR_PAD_LEFT);
    }

    private static function recipe(array $data): array {
        $ids = $data['ingredientes'] ?? $data['ingredientes[]'] ?? [];
        $amounts = $data['cantidades'] ?? $data['cantidades[]'] ?? [];
        if (!is_array($ids)) $ids = [$ids];
        if (!is_array($amounts)) $amounts = [$amounts];
        $recipe = [];
        foreach ($ids as $i => $item) {
            $id = trim((string)(is_array($item) ? ($item['id_ingrediente'] ?? '') : $item));
            if ($id !== '') $recipe[] = [$id, (float)(is_array($item) ? ($item['cantidad'] ?? 1) : ($amounts[$i] ?? 1))];
        }
        return $recipe;
    }

    private static function image(?string $id): ?string {
        $file = $_FILES['imagen'] ?? null;
        if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) return null;
        if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 16 * 1024 * 1024) throw new \RuntimeException('Imagen inválida o demasiado grande.');
        $source = @imagecreatefromstring(file_get_contents($file['tmp_name']));
        if (!$source) throw new \RuntimeException('El archivo no contiene una imagen válida.');
        $name = $id . '.png';
        $destination = dirname(__DIR__, 3) . '/storage/uploads/platos/';
        if (!is_dir($destination)) mkdir($destination, 0775, true);
        $ok = imagepng($source, $destination . $name);
        imagedestroy($source);
        if (!$ok) throw new \RuntimeException('No fue posible guardar la imagen.');
        return $name;
    }

    private static function saveDish(?string $id = null): never {
        $data = \request_data();
        $name = trim((string)($data['nombre'] ?? ''));
        $category = self::category(trim((string)($data['categoria'] ?? '')));
        $description = trim((string)($data['descripcion'] ?? ''));
        if (!$name || !$category || !$description) \json_response(['status' => 'error', 'message' => $id ? 'Campos requeridos incompletos.' : 'Datos incompletos o categoría no válida.'], 400);
        $state = (string)($data['estado'] ?? 'Activo');
        $pdo = DB::connect();
        $existing = $id === null ? null : DB::row('SELECT categoria,img_plato FROM platos WHERE id_plato=?', [$id]);
        if ($id !== null && !$existing) \json_response(['status' => 'error', 'message' => "El plato '$id' no existe."], 404);
        $newId = $id === null || (int)$existing['categoria'] !== $category ? self::nextDishId($category) : $id;
        $oldImage = $existing['img_plato'] ?? '';
        try {
            $image = self::image($newId) ?? $oldImage;
            $pdo->beginTransaction();
            if ($id === null) {
                DB::exec('INSERT INTO platos (id_plato,nombre,categoria,descripcion,img_plato,estado,fecha_creacion) VALUES (?,?,?,?,?,?,CURDATE())', [$newId,$name,$category,$description,$image,$state]);
            } else {
                // Keep referential integrity when changing the dish category/id.
                $links = DB::rows('SELECT id_menu FROM contiene WHERE id_plato=?', [$id]);
                DB::exec('DELETE FROM contiene WHERE id_plato=?', [$id]);
                DB::exec('DELETE FROM plato_ingrediente WHERE id_plato=?', [$id]);
                DB::exec('UPDATE platos SET id_plato=?,nombre=?,categoria=?,descripcion=?,img_plato=?,estado=? WHERE id_plato=?', [$newId,$name,$category,$description,$image,$state,$id]);
                foreach ($links as $link) DB::exec('INSERT INTO contiene (id_menu,id_plato) VALUES (?,?)', [$link['id_menu'],$newId]);
            }
            foreach (self::recipe($data) as [$ingredient,$amount]) DB::exec('INSERT INTO plato_ingrediente (id_plato,id_ingrediente,cantidad) VALUES (?,?,?)', [$newId,$ingredient,$amount]);
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log($e->getMessage());
            \json_response(['status' => 'error', 'message' => 'No fue posible guardar el plato.'], 500);
        }
        \json_response($id === null
            ? ['status' => 'success', 'message' => 'Plato e imagen guardados exitosamente', 'id_plato_generado' => $newId, 'img_plato' => $image]
            : ['status' => 'success', 'message' => 'Plato modificado exitosamente', 'id_plato_final' => $newId, 'id_plato_anterior' => $id], $id === null ? 201 : 200);
    }

    private static function deleteDish(string $id): never {
        $pdo = DB::connect(); $pdo->beginTransaction();
        try {
            DB::exec('DELETE FROM plato_ingrediente WHERE id_plato=?', [$id]);
            DB::exec('DELETE FROM contiene WHERE id_plato=?', [$id]);
            DB::exec('DELETE FROM platos WHERE id_plato=?', [$id]);
            $pdo->commit();
        } catch (\Throwable $e) { $pdo->rollBack(); throw $e; }
        \json_response(['status' => 'success', 'message' => 'Plato eliminado correctamente']);
    }

    private static function menus(?string $id = null): mixed {
        $sql = 'SELECT m.*,p.id_plato AS plato_id,p.nombre AS plato_nombre,p.categoria AS plato_categoria,p.descripcion AS plato_descripcion,p.img_plato FROM menu m LEFT JOIN contiene c ON m.id_menu=c.id_menu LEFT JOIN platos p ON c.id_plato=p.id_plato';
        if ($id !== null) $sql .= ' WHERE m.id_menu=?';
        $result = [];
        foreach (DB::rows($sql, $id === null ? [] : [$id]) as $row) {
            $key = $row['id_menu'];
            if (!isset($result[$key])) $result[$key] = ['id_menu' => $key, 'nombre' => $row['nombre'], 'tiempos_menu' => (int)$row['tiempos_menu'], 'precio' => (int)$row['precio'], 'descripcion' => $row['descripcion'], 'estado' => $row['estado'], 'fecha_creacion' => $row['fecha_creacion'], 'platos' => []];
            if ($row['plato_id'] !== null) $result[$key]['platos'][] = ['id_plato' => $row['plato_id'], 'nombre' => $row['plato_nombre'], 'categoria' => (int)$row['plato_categoria'], 'descripcion' => $row['plato_descripcion'], 'img_plato' => $row['img_plato']];
        }
        return $id === null ? ($result ? array_values($result) : ['message' => '0 resultados']) : ($result[$id] ?? null);
    }

    private static function nextMenuId(): string {
        // Preserve the original module's MN + YYMMDD + global sequence format.
        $row = DB::row("SELECT id_menu FROM menu WHERE id_menu LIKE 'MN%' ORDER BY id_menu DESC LIMIT 1");
        $number = $row ? (int)substr($row['id_menu'], 9) + 1 : 0;
        return 'MN' . date('ymd') . '-' . str_pad((string)$number, 3, '0', STR_PAD_LEFT);
    }

    private static function saveMenu(?string $id = null): never {
        $input = \request_data();
        $menu = $input['menu'] ?? $input;
        $dishes = $input['platos'] ?? $menu['platos'] ?? [];
        $name = trim((string)($menu['nombre'] ?? ''));
        $description = trim((string)($menu['descripcion'] ?? ''));
        $price = (int)($menu['precio'] ?? 0);
        if ($name === '' || !is_array($dishes) || !$dishes || ($id !== null && ($description === '' || $price <= 0))) \json_response(['status' => 'error', 'message' => 'El menú requiere nombre, platos y datos válidos.']);
        $newId = $id ?? self::nextMenuId();
        $pdo = DB::connect(); $pdo->beginTransaction();
        try {
            if ($id === null) DB::exec('INSERT INTO menu (id_menu,nombre,tiempos_menu,precio,descripcion,estado,fecha_creacion) VALUES (?,?,?,?,?,?,CURDATE())', [$newId,$name,count($dishes),$price,$description,$menu['estado'] ?? 'Activo']);
            else {
                DB::exec('UPDATE menu SET nombre=?,tiempos_menu=?,precio=?,descripcion=?,estado=? WHERE id_menu=?', [$name,count($dishes),$price,$description,$menu['estado'] ?? 'Activo',$id]);
                DB::exec('DELETE FROM contiene WHERE id_menu=?', [$id]);
            }
            foreach ($dishes as $dish) { $dishId = is_array($dish) ? ($dish['id_plato'] ?? '') : $dish; if ($dishId) DB::exec('INSERT INTO contiene (id_menu,id_plato) VALUES (?,?)', [$newId,$dishId]); }
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack(); error_log($e->getMessage());
            \json_response(['status' => 'error', 'message' => 'No fue posible guardar el menú.']);
        }
        \json_response(['status' => 'success', 'message' => "Menú '$name' " . ($id ? 'actualizado' : 'guardado') . ' con éxito', $id ? 'id_menu' : 'id_menu_generado' => $newId, 'tiempos_menu' => count($dishes)]);
    }

    private static function search(string $text): array {
        $like = '%' . $text . '%';
        $sql = "SELECT p.id_plato AS id_registro,p.nombre,p.descripcion,p.img_plato AS img_registro,p.fecha_creacion,'Plato' AS tipo FROM platos p LEFT JOIN categorias_platos cp ON p.categoria=cp.id_categoria WHERE p.estado='Activo' AND (p.nombre LIKE ? OR cp.nombre LIKE ? OR 'Plato' LIKE ?) UNION ALL SELECT m.id_menu,m.nombre,m.descripcion,(SELECT p2.img_plato FROM contiene c JOIN platos p2 ON c.id_plato=p2.id_plato WHERE c.id_menu=m.id_menu AND p2.categoria=2 AND p2.estado='Activo' LIMIT 1),m.fecha_creacion,'Menú' FROM menu m WHERE m.estado='Activo' AND (m.nombre LIKE ? OR 'Menú' LIKE ?) UNION ALL SELECT id_ingrediente,nombre,CONCAT('El ingrediente cuenta con un stock actual de ',stock,' ',unidad_minima,'.'),NULL,NULL,'Ingrediente' FROM ingredientes WHERE nombre LIKE ? OR 'Ingrediente' LIKE ? ORDER BY nombre ASC";
        return DB::rows($sql, array_fill(0, 7, $like));
    }
}
