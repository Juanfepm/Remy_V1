<?php
declare(strict_types=1);
namespace Remy\Modules\Inventario;

use Remy\Core\Database as DB;

final class Api {
    public static function dispatch(string $path, string $method): never {
        try {
            if ($path === '/api/ingredientes' && $method === 'GET') self::listIngredients();
            if ($path === '/api/categorias' && $method === 'GET') self::listCategories();
            if ($path === '/api/siguiente-id' && $method === 'GET') self::nextId();
            if ($path === '/api/ingredientes' && $method === 'POST') self::createIngredient();
            if ($path === '/api/ingredientes/actualizar' && $method === 'POST') self::updateIngredient();
            if ($path === '/api/ingredientes/estado' && $method === 'POST') self::changeState();
            \json_response(['respuesta' => 'NO', 'mensaje' => 'Ruta no encontrada'], 404);
        } catch (\Throwable $e) {
            error_log((string)$e);
            \json_response(['respuesta' => 'ERROR', 'mensaje' => 'No se pudo completar la operación. Revisa la conexión y el esquema de inventario.'], 500);
        }
    }

    private static function listIngredients(): never {
        $rows = DB::rows("SELECT i.id_ingrediente, i.categoria,
                COALESCE(c.nombre, 'Sin categoría') AS nombre_categoria,
                COALESCE(i.nombre, '') AS nombre,
                CAST(COALESCE(i.stock, 0) AS DECIMAL(12,3)) AS stock,
                COALESCE(i.unidad, 'Und') AS unidad,
                LOWER(COALESCE(i.unidad_minima, 'und')) AS unidad_minima,
                COALESCE(i.descripcion, '') AS descripcion,
                CAST(COALESCE(i.stock_minimo, 0) AS UNSIGNED) AS stock_minimo,
                COALESCE(i.estado, 'Activo') AS estado
            FROM ingredientes i
            LEFT JOIN categoria_ingredientes c ON c.id_categoria = i.categoria
            ORDER BY i.id_ingrediente ASC");

        $metrics = [
            'total_productos' => count($rows), 'total_activos' => 0, 'total_inactivos' => 0,
            'total_alertas_tempranas' => 0, 'total_criticos' => 0, 'total_optimos' => 0,
        ];
        foreach ($rows as &$row) {
            // Los registros nuevos guardan stock en unidad principal. Los
            // antiguos que ya tienen 1000 o más gr/ml se normalizan al leerlos.
            $stockInMinimumUnits = self::stockInMinimumUnits($row);
            $stock = self::stockInMainUnits($row);
            $row['stock'] = round($stock, 3);
            $row['stock_unidad_minima'] = round($stockInMinimumUnits, 3);
            $minimumInStockUnits = self::minimumInStockUnits($row);
            $active = $row['estado'] === 'Activo';
            if ($stock <= 0) {
                $row['nivel_alerta'] = 'CRITICO';
                if ($active) $metrics['total_criticos']++;
            } elseif ($stock <= $minimumInStockUnits) {
                $row['nivel_alerta'] = 'ALERTA_TEMPRANA';
                if ($active) $metrics['total_alertas_tempranas']++;
            } else {
                $row['nivel_alerta'] = 'OPTIMO';
                if ($active) $metrics['total_optimos']++;
            }
            $row['porcentaje_stock'] = $minimumInStockUnits > 0 ? round(($stock / $minimumInStockUnits) * 100, 1) : 100.0;
            $metrics[$active ? 'total_activos' : 'total_inactivos']++;
        }
        unset($row);

        \json_response(['respuesta' => 'SI', 'metricas' => $metrics, 'datos' => $rows]);
    }

    private static function stockConversionFactor(array $ingredient): int {
        $unit = strtolower(trim((string)($ingredient['unidad'] ?? '')));
        $minimumUnit = strtolower(trim((string)($ingredient['unidad_minima'] ?? '')));
        return (($unit === 'kg' && $minimumUnit === 'gr') || ($unit === 'l' && $minimumUnit === 'ml')) ? 1000 : 1;
    }

    private static function stockInMainUnits(array $ingredient): float {
        $stock = (float)($ingredient['stock'] ?? 0);
        $factor = self::stockConversionFactor($ingredient);
        return $factor === 1000 && abs($stock) >= $factor ? $stock / $factor : $stock;
    }

    private static function stockInMinimumUnits(array $ingredient): float {
        $stock = (float)($ingredient['stock'] ?? 0);
        $factor = self::stockConversionFactor($ingredient);
        if ($factor !== 1000) return $stock;
        return abs($stock) >= $factor ? $stock : $stock * $factor;
    }

    private static function minimumInStockUnits(array $ingredient): float {
        $minimum = (float)($ingredient['stock_minimo'] ?? 0);
        $unit = strtolower(trim((string)($ingredient['unidad'] ?? '')));
        $minimumUnit = strtolower(trim((string)($ingredient['unidad_minima'] ?? '')));

        if (($unit === 'kg' && $minimumUnit === 'gr') || ($unit === 'l' && $minimumUnit === 'ml')) {
            return $minimum / 1000;
        }

        return $minimum;
    }

    private static function listCategories(): never {
        \json_response(['respuesta' => 'SI', 'datos' => DB::rows('SELECT id_categoria, nombre FROM categoria_ingredientes ORDER BY id_categoria ASC')]);
    }

    private static function nextId(): never {
        $category = trim((string)($_GET['categoria'] ?? ''));
        $nextId = $category === '' ? '001' : self::nextCategoryId($category);
        \json_response(['respuesta' => 'SI', 'siguiente_id' => $nextId]);
    }

    private static function nextCategoryId(string $category): string {
        $row = DB::row('SELECT nombre FROM categoria_ingredientes WHERE id_categoria = ?', [$category]);
        if (!$row) \json_response(['respuesta' => 'NO', 'mensaje' => 'Categoría no encontrada.'], 400);

        $knownPrefix = DB::row("SELECT LEFT(id_ingrediente, 3) AS prefijo
            FROM ingredientes
            WHERE categoria = ? AND id_ingrediente REGEXP '^[A-Za-z]{3}[0-9]+$'
            GROUP BY LEFT(id_ingrediente, 3)
            ORDER BY COUNT(*) DESC, prefijo ASC
            LIMIT 1", [$category]);
        $prefix = (string)($knownPrefix['prefijo'] ?? '');
        if ($prefix === '') {
            $transliterated = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', (string)$row['nombre']);
            $letters = preg_replace('/[^A-Za-z]/', '', $transliterated !== false ? $transliterated : (string)$row['nombre']);
            $prefix = strtoupper(substr($letters, 0, 3));
            if (strlen($prefix) < 3) $prefix = str_pad($prefix, 3, 'X');
        }

        $max = (int)(DB::row("SELECT MAX(CAST(SUBSTRING(id_ingrediente, 4) AS UNSIGNED)) AS max_id
            FROM ingredientes
            WHERE categoria = ? AND LEFT(id_ingrediente, 3) = ?
              AND SUBSTRING(id_ingrediente, 4) REGEXP '^[0-9]+$'", [$category, $prefix])['max_id'] ?? 0);
        return $prefix . str_pad((string)($max + 1), 3, '0', STR_PAD_LEFT);
    }

    private static function createIngredient(): never {
        $data = self::validatedPayload();
        $id = trim((string)($data['id_ingrediente'] ?? ''));
        if ($id === '') $id = self::nextCategoryId($data['categoria']);
        if (mb_strlen($id) > 16) \json_response(['respuesta' => 'NO', 'mensaje' => 'El ID admite máximo 16 caracteres.'], 400);
        if (self::ingredientNameExists($data['nombre'])) {
            \json_response(['respuesta' => 'DUPLICADO_NOMBRE', 'mensaje' => 'Ya existe otro ingrediente con ese nombre.'], 409);
        }

        try {
            DB::exec('INSERT INTO ingredientes (id_ingrediente, categoria, nombre, stock, unidad, unidad_minima, descripcion, stock_minimo, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                $id, $data['categoria'], $data['nombre'], $data['stock'], $data['unidad'],
                $data['unidad_minima'], $data['descripcion'], $data['stock_minimo'], $data['estado'],
            ]);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') \json_response(['respuesta' => 'DUPLICADO', 'mensaje' => "Ya existe un ingrediente con el ID {$id}."], 409);
            throw $e;
        }

        \json_response(['respuesta' => 'SI', 'mensaje' => 'Ingrediente registrado exitosamente.', 'id_ingrediente' => $id], 201);
    }

    private static function updateIngredient(): never {
        $data = self::validatedPayload();
        $id = trim((string)($data['id_ingrediente'] ?? ''));
        if ($id === '' || mb_strlen($id) > 16) \json_response(['respuesta' => 'NO', 'mensaje' => 'El ID del ingrediente no es válido.'], 400);
        $current = DB::row('SELECT id_ingrediente FROM ingredientes WHERE id_ingrediente = ?', [$id]);
        if (!$current) {
            \json_response(['respuesta' => 'NO', 'mensaje' => 'Ingrediente no encontrado.'], 404);
        }
        $nameUnchanged = DB::row('SELECT id_ingrediente FROM ingredientes WHERE id_ingrediente = ? AND TRIM(nombre) = TRIM(?)', [$id, $data['nombre']]) !== null;
        if (!$nameUnchanged && self::ingredientNameExists($data['nombre'], $id)) {
            \json_response(['respuesta' => 'DUPLICADO_NOMBRE', 'mensaje' => 'Ya existe otro ingrediente con ese nombre.'], 409);
        }

        DB::exec('UPDATE ingredientes SET categoria=?, nombre=?, stock=?, unidad=?, unidad_minima=?, descripcion=?, stock_minimo=?, estado=? WHERE id_ingrediente=?', [
            $data['categoria'], $data['nombre'], $data['stock'], $data['unidad'], $data['unidad_minima'],
            $data['descripcion'], $data['stock_minimo'], $data['estado'], $id,
        ]);
        \json_response(['respuesta' => 'SI', 'mensaje' => 'Ingrediente actualizado correctamente.']);
    }

    private static function changeState(): never {
        $data = \request_data();
        $id = trim((string)($data['id_ingrediente'] ?? ''));
        $state = trim((string)($data['nuevo_estado'] ?? ''));
        if ($id === '' || !in_array($state, ['Activo', 'Inactivo'], true)) {
            \json_response(['respuesta' => 'NO', 'mensaje' => 'Indica un ID y un estado válido.'], 400);
        }
        if (!DB::row('SELECT id_ingrediente FROM ingredientes WHERE id_ingrediente = ?', [$id])) {
            \json_response(['respuesta' => 'NO', 'mensaje' => 'Ingrediente no encontrado.'], 404);
        }
        DB::exec('UPDATE ingredientes SET estado=? WHERE id_ingrediente=?', [$state, $id]);
        \json_response(['respuesta' => 'SI', 'mensaje' => "El producto ha sido marcado como {$state}.", 'nuevo_estado' => $state]);
    }

    private static function validatedPayload(): array {
        $data = \request_data();
        $category = trim((string)($data['categoria'] ?? ''));
        $name = trim((string)($data['nombre'] ?? ''));
        $unit = trim((string)($data['unidad'] ?? ''));
        $minimumUnit = ['Kg' => 'gr', 'L' => 'ml', 'Und' => 'und'][$unit] ?? null;
        $stock = filter_var($data['stock'] ?? 0, FILTER_VALIDATE_FLOAT);
        $minimum = filter_var($data['stock_minimo'] ?? 0, FILTER_VALIDATE_INT);
        $state = trim((string)($data['estado'] ?? 'Activo'));
        if ($category === '' || $name === '' || $stock === false || $stock < 0 || $minimum === false || $minimum < 0) {
            \json_response(['respuesta' => 'NO', 'mensaje' => 'Nombre, categoría y cantidades válidas son obligatorios.'], 400);
        }
        if (!in_array($state, ['Activo', 'Inactivo'], true)) $state = 'Activo';
        if (mb_strlen($name) > 32) \json_response(['respuesta' => 'NO', 'mensaje' => 'El nombre admite máximo 32 caracteres.'], 400);
        if ($minimumUnit === null) \json_response(['respuesta' => 'NO', 'mensaje' => 'Selecciona una unidad válida: Kg, L o Und.'], 400);
        if (!DB::row('SELECT id_categoria FROM categoria_ingredientes WHERE id_categoria = ?', [$category])) {
            \json_response(['respuesta' => 'NO', 'mensaje' => 'Selecciona una categoría existente.'], 400);
        }
        return [
            'id_ingrediente' => trim((string)($data['id_ingrediente'] ?? '')),
            'categoria' => $category,
            'nombre' => $name,
            'stock' => (float)$stock,
            'unidad' => $unit,
            'unidad_minima' => $minimumUnit,
            'descripcion' => trim((string)($data['descripcion'] ?? '')),
            'stock_minimo' => (int)$minimum,
            'estado' => $state,
        ];
    }

    private static function ingredientNameExists(string $name, ?string $excludeId = null): bool {
        $sql = 'SELECT id_ingrediente FROM ingredientes WHERE TRIM(nombre) = TRIM(?)';
        $params = [$name];
        if ($excludeId !== null) {
            $sql .= ' AND id_ingrediente <> ?';
            $params[] = $excludeId;
        }
        $sql .= ' LIMIT 1';
        return DB::row($sql, $params) !== null;
    }
}
