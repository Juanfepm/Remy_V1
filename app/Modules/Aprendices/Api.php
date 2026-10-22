<?php
declare(strict_types=1);
namespace Remy\Modules\Aprendices;

use Remy\Core\Database as DB;
use Remy\Core\Token;

final class Api {
    private const INSTRUCTOR = 1;
    private const APRENDIZ = 2;

    public static function dispatch(string $path, string $method): never {
        if ($path === '/login' && $method === 'POST') self::login();
        $user = Token::requireUser();
        \Remy\Core\Sesion::usuario(); // mantiene viva la sesión compartida mientras se usa el panel
        if ($path === '/verificar-sesion') \json_response(['mensaje' => 'Sesión válida', 'usuario' => $user]);
        if ($path === '/usuarios') {
            if ($method === 'GET') self::users();
            if ($method === 'POST') self::saveUser();
        }
        if (preg_match('~^/usuarios/([^/]+)$~', $path, $m)) {
            if ($method === 'GET') self::user($m[1]);
            if ($method === 'PUT') self::saveUser($m[1]);
            if ($method === 'DELETE') self::deleteUser($m[1]);
        }
        if ($path === '/programas/cargar-masiva' && $method === 'POST') self::upload();
        if ($path === '/aprendices' && $method === 'GET') self::learners();
        if ($path === '/eventos' && $method === 'GET') self::events();
        if (preg_match('~^/eventos/([^/]+)/lideres$~', $path, $m) && $method === 'PUT') self::leaders($m[1]);
        if (preg_match('~^/eventos/([^/]+)$~', $path, $m) && $method === 'GET') self::event($m[1]);
        if (preg_match('~^/(?:programa/)?dashboard/(eventos|lideres|menu-resumen|produccion|completo)$~', $path, $m) && $method === 'GET') self::dashboard($m[1]);
        \json_response(['error' => 'Ruta no encontrada'], 404);
    }

    private static function login(): never {
        $data = \request_data();
        if (!$data) \json_response(['status' => 'error', 'message' => 'No se recibieron datos en el cuerpo de la petición'], 400);
        $mail = trim((string)($data['correo'] ?? ''));
        $pass = (string)($data['contrasena'] ?? '');
        $row = DB::row("SELECT id_usuario, nombre, apellido, correo, rol_usuario, contrasena, ficha FROM usuarios WHERE correo = ? AND estado = 'activo'", [$mail]);
        if (!$row || !password_verify($pass, (string)$row['contrasena'])) {
            \json_response(['status' => 'error', 'message' => 'Las credenciales ingresadas son incorrectas'], 401);
        }
        // Login único: además del token de esta API, abre la sesión que usan
        // el panel de reservas, platos e inventario.
        \Remy\Core\Sesion::abrir($row);
        \json_response(['status' => 'success', 'mensaje' => 'Inicio de sesión exitoso - Bienvenido',
            'rol_usuario' => (int)$row['rol_usuario'],
            'token' => Token::issue(['correo' => $mail, 'rol_usuario' => (int)$row['rol_usuario']])]);
    }

    private static function expireLearners(): void {
        DB::exec("UPDATE usuarios SET estado='inactivo' WHERE rol_usuario=? AND estado='activo' AND fecha_fin_etapa_lectiva < CURDATE()", [self::APRENDIZ]);
    }

    private static function users(): never {
        self::expireLearners();
        $rows = DB::rows("SELECT id_usuario, nombre, apellido, ficha FROM usuarios WHERE rol_usuario=? AND estado='activo'", [self::APRENDIZ]);
        \json_response(array_map('array_values', $rows));
    }

    private static function user(string $id): never {
        self::expireLearners();
        $row = DB::row("SELECT nombre, apellido, celular, ficha, fecha_fin_etapa_lectiva FROM usuarios WHERE id_usuario=? AND estado='activo'", [$id]);
        if (!$row) \json_response(['mensaje' => 'Usuario no encontrado.'], 404);
        \json_response(['mensaje' => 'Usuario encontrado', 'data' => array_values($row)]);
    }

    private static function validateUser(array $data, ?string $id): array {
        $cedula = trim((string)($id ?? $data['cedula'] ?? ''));
        $nombre = trim((string)($data['nombres'] ?? ''));
        $apellido = trim((string)($data['apellidos'] ?? ''));
        $mail = strtolower(trim((string)($data['correo'] ?? '')));
        $phone = trim((string)($data['celular'] ?? ''));
        $ficha = trim((string)($data['ficha'] ?? ''));
        $fecha = trim((string)($data['fecha_fin_etapa_lectiva'] ?? ''));
        if ($id === null && !preg_match('/^[1-9][0-9]{6,9}$/', $cedula)) \json_response(['mensaje' => 'La cédula debe contener entre 7 y 10 dígitos numéricos y no iniciar con cero.'], 400);
        if ($nombre === '' || $apellido === '') \json_response(['mensaje' => 'El nombre y apellido son obligatorios.'], 400);
        if (!preg_match('/^3[0-9]{9}$/', $phone)) \json_response(['mensaje' => 'El celular debe tener 10 dígitos e iniciar con 3.'], 400);
        if (str_ends_with($mail, '@soy.sena.edu.co')) {
            if (!preg_match('/^[1-9][0-9]{6,7}$/', $ficha) || $fecha === '') \json_response(['mensaje' => 'El aprendiz requiere ficha de 7 u 8 dígitos y fecha de finalización.'], 400);
            $role = self::APRENDIZ;
        } elseif (str_ends_with($mail, '@sena.edu.co')) {
            $role = self::INSTRUCTOR; $ficha = ''; $fecha = '';
        } else \json_response(['mensaje' => 'El correo debe ser institucional SENA.'], 400);
        return [$cedula, $nombre, $apellido, $mail, $phone, $ficha ?: null, $fecha ?: null, $role];
    }

    private static function saveUser(?string $id = null): never {
        $data = \request_data();
        if (!$data) \json_response(['mensaje' => 'No se recibieron datos válidos.'], 400);
        if ($id !== null) {
            $existingUser = DB::row("SELECT correo,celular FROM usuarios WHERE id_usuario=? AND estado='activo'", [$id]);
            if (!$existingUser) \json_response(['mensaje' => 'El usuario no existe.'], 404);
            $data['correo'] = $existingUser['correo'];
            $data['celular'] = $data['contrasena'] ?? $data['celular'] ?? $existingUser['celular'];
        }
        [$cedula, $nombre, $apellido, $mail, $phone, $ficha, $fecha, $role] = self::validateUser($data, $id);
        if ($id === null && DB::row('SELECT id_usuario FROM usuarios WHERE id_usuario=?', [$cedula])) \json_response(['mensaje' => "El usuario con cédula $cedula ya está registrado."], 409);
        if ($id !== null && !DB::row("SELECT id_usuario FROM usuarios WHERE id_usuario=? AND estado='activo'", [$id])) \json_response(['mensaje' => 'El usuario no existe.'], 404);
        $hash = password_hash($phone, PASSWORD_BCRYPT);
        if ($id === null) {
            DB::exec("INSERT INTO usuarios (id_usuario,nombre,apellido,correo,contrasena,celular,fecha_fin_etapa_lectiva,ficha,rol_usuario,estado,fecha_creacion) VALUES (?,?,?,?,?,?,?,?,?,'activo',NOW())", [$cedula,$nombre,$apellido,$mail,$hash,$phone,$fecha,$ficha,$role]);
            \json_response(['mensaje' => 'Usuario creado con éxito.'], 201);
        }
        DB::exec('UPDATE usuarios SET nombre=?, apellido=?, contrasena=?, celular=?, ficha=?, fecha_fin_etapa_lectiva=? WHERE id_usuario=?', [$nombre,$apellido,$hash,$phone,$ficha,$fecha,$id]);
        \json_response(['mensaje' => 'Usuario modificado con éxito.']);
    }

    private static function deleteUser(string $id): never {
        if (!DB::row("SELECT id_usuario FROM usuarios WHERE id_usuario=? AND estado='activo'", [$id])) \json_response(['mensaje' => 'El usuario no existe.'], 404);
        DB::exec("UPDATE usuarios SET estado='inactivo' WHERE id_usuario=?", [$id]);
        \json_response(['mensaje' => 'Usuario eliminado con éxito.']);
    }

    private static function expireEvents(): void {
        DB::exec("UPDATE eventos SET estado='inactivo' WHERE fecha_fin < NOW() AND estado='activo'");
    }

    private static function eventRows(?string $id = null, bool $withoutLeaders = false): array {
        self::expireEvents();
        $sql = "SELECT e.id_evento,e.nombre_evento,e.estado,e.correo_fk,e.franja_horaria,e.fecha_inicio,e.fecha_fin,e.numero_personas,e.experiencia,e.id_menu_fk,e.fecha_creacion,e.fecha_modificacion,e.usuario_modificacion, COALESCE(CONCAT(c.nombre,' ',c.apellido),'Sin asignar') AS lider_cocina, COALESCE(CONCAT(s.nombre,' ',s.apellido),'Sin asignar') AS lider_servicio,e.costo_total";
        if ($id !== null) $sql .= ",COALESCE(m.nombre,'Sin asignar') AS nombre_menu,COALESCE(m.tiempos_menu,'N/A') AS tiempos_menu,COALESCE(m.descripcion,'Sin descripción') AS descripcion_menu";
        $sql .= ' FROM eventos e LEFT JOIN usuarios c ON e.lider_cocina=c.id_usuario LEFT JOIN usuarios s ON e.lider_servicio=s.id_usuario';
        if ($id !== null) $sql .= ' LEFT JOIN menu m ON e.id_menu_fk=m.id_menu';
        $sql .= " WHERE e.estado='activo'";
        if ($withoutLeaders) $sql .= " AND (e.lider_cocina IS NULL OR e.lider_cocina='' OR e.lider_cocina='0') AND (e.lider_servicio IS NULL OR e.lider_servicio='' OR e.lider_servicio='0')";
        if ($id !== null) $sql .= ' AND e.id_evento=?';
        return array_map([self::class, 'formatEvent'], DB::rows($sql, $id === null ? [] : [$id]));
    }

    private static function formatEvent(array $row): array {
        foreach (['fecha_inicio','fecha_fin','fecha_creacion','fecha_modificacion'] as $key) {
            if (!empty($row[$key])) $row[$key] = date(str_contains($row[$key], ':') ? 'd/m/Y h:i A' : 'd/m/Y', strtotime($row[$key]));
        }
        return array_values($row);
    }

    private static function events(): never {
        $rows = self::eventRows(null, ($_GET['sin_lideres'] ?? '') === 'true');
        \json_response(['mensaje' => 'Eventos encontrados', 'cantidad' => count($rows), 'data' => $rows]);
    }

    private static function event(string $id): never {
        $rows = self::eventRows($id);
        if (!$rows) \json_response(['mensaje' => 'Evento no encontrado'], 404);
        \json_response(['mensaje' => 'Evento encontrado', 'data' => $rows[0]]);
    }

    private static function learners(): never {
        $sql = "SELECT id_usuario,nombre,apellido,ficha FROM usuarios WHERE rol_usuario=? AND estado='activo'";
        $available = ($_GET['disponibles'] ?? '') === 'true';
        $params = [self::APRENDIZ];
        if ($available) $sql .= ' AND id_usuario NOT IN (SELECT lider_cocina FROM eventos WHERE lider_cocina IS NOT NULL UNION SELECT lider_servicio FROM eventos WHERE lider_servicio IS NOT NULL)';
        $ficha = trim((string)($_GET['ficha'] ?? ''));
        if ($available && $ficha !== '') { $sql .= ' AND ficha=?'; $params[] = $ficha; }
        $rows = DB::rows($sql, $params);
        $reset = $available && count($rows) < 2;
        if ($reset) $rows = DB::rows("SELECT id_usuario,nombre,apellido,ficha FROM usuarios WHERE rol_usuario=? AND estado='activo'" . ($ficha === '' ? '' : ' AND ficha=?'), $ficha === '' ? [self::APRENDIZ] : [self::APRENDIZ,$ficha]);
        \json_response(['mensaje' => $reset ? 'Se han asignado todos los aprendices. Ciclo reiniciado.' : ($available ? 'Aprendices disponibles encontrados' : 'Aprendices encontrados'), 'cantidad' => count($rows), 'data' => array_map('array_values', $rows)]);
    }

    private static function leaders(string $id): never {
        $data = \request_data();
        $c = (string)($data['lider_cocina'] ?? ''); $s = (string)($data['lider_servicio'] ?? '');
        if ($c === '' || $s === '' || $c === $s) \json_response(['mensaje' => 'Seleccione dos líderes diferentes.'], 400);
        if (!self::eventRows($id)) \json_response(['mensaje' => 'El evento no existe.'], 404);
        DB::exec('UPDATE eventos SET lider_cocina=?,lider_servicio=?,fecha_modificacion=NOW() WHERE id_evento=?', [$c,$s,$id]);
        \json_response(['mensaje' => 'Aprendices asignados correctamente.', 'id_evento' => $id, 'lider_cocina' => $c, 'lider_servicio' => $s]);
    }

    private static function dashboard(string $section): never {
        $events = fn() => array_map('array_values', DB::rows("SELECT id_evento,nombre_evento,fecha_inicio,fecha_fin FROM eventos WHERE estado='activo' ORDER BY fecha_inicio ASC LIMIT 5"));

        // El stock nuevo se guarda en Kg/L y el mínimo en gr/ml. Los registros
        // antiguos con valores ya expresados en gr/ml se conservan al leerlos.
        $unidadMinima = "LOWER(COALESCE(unidad_minima, 'und'))";
        $unidadConvertida = "((LOWER(COALESCE(unidad, 'Und')) = 'kg' AND {$unidadMinima} = 'gr') OR (LOWER(COALESCE(unidad, 'Und')) = 'l' AND {$unidadMinima} = 'ml'))";
        $stockBase = 'COALESCE(stock, 0)';
        $stockNormalizado = "CASE WHEN {$unidadConvertida} THEN CASE WHEN ABS({$stockBase}) >= 1000 THEN {$stockBase} ELSE {$stockBase} * 1000 END ELSE {$stockBase} END";
        $inventarioAlerta = fn() => array_map('array_values', DB::rows("SELECT nombre, {$stockNormalizado} AS stock, {$unidadMinima} AS unidad FROM ingredientes WHERE {$stockNormalizado} <= COALESCE(stock_minimo, 0) ORDER BY stock ASC"));
        
        $leaders = fn() => array_map('array_values', DB::rows("SELECT e.nombre_evento,e.fecha_inicio,e.numero_personas,CONCAT(u1.nombre,' ',u1.apellido) AS lider_cocina,CONCAT(u2.nombre,' ',u2.apellido) AS lider_servicio FROM eventos e LEFT JOIN usuarios u1 ON e.lider_cocina=u1.id_usuario LEFT JOIN usuarios u2 ON e.lider_servicio=u2.id_usuario WHERE e.estado='activo' ORDER BY e.fecha_inicio ASC LIMIT 5"));
        
        $menu = fn() => [
            'total_menus' => (int)(DB::row("SELECT COUNT(*) AS n FROM categorias_platos WHERE estado = 'Activo'")['n'] ?? 0),
            'total_platos' => (int)(DB::row("SELECT COUNT(*) AS n FROM platos WHERE estado = 'Activo'")['n'] ?? 0),
            'platos' => DB::rows("
                SELECT 
                    c.id_categoria,
                    c.nombre AS nombre_categoria,
                    c.estado,
                    COUNT(p.id_plato) AS cantidad_platos
                FROM categorias_platos c
                LEFT JOIN platos p ON c.id_categoria = p.categoria AND p.estado = 'Activo'
                WHERE c.estado = 'Activo'
                GROUP BY c.id_categoria, c.nombre, c.estado
                ORDER BY c.id_categoria ASC;
            ")
        ];

        $precioUnitarioMenu = 15000;

        $produccion = fn() => array_map('array_values', DB::rows("
            SELECT 
                DATE_FORMAT(t.fecha, '%Y-%m') AS mes_anio,
                SUM(t.ingreso_total) AS total_mes
            FROM (
                SELECT 
                    rd.Fecha_reserva AS fecha,
                    (rd.cantidad_menus * " . (int)$precioUnitarioMenu . ") AS ingreso_total
                FROM reservas_dia rd

                UNION ALL

                SELECT 
                    e.fecha_inicio AS fecha,
                    e.costo_total AS ingreso_total
                FROM eventos e
                WHERE e.costo_total IS NOT NULL
            ) t
            WHERE DATE_FORMAT(t.fecha, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
            GROUP BY mes_anio
        "));

        $data = match ($section) {
            'eventos' => $events(), 
            'lideres' => $leaders(), 
            'menu-resumen' => $menu(),
            'produccion' => $produccion(),
            'completo' => [
                'eventos' => $events(), 
                'lideres' => $leaders(), 
                'inventario_alerta' => $inventarioAlerta(), 
                'menu_resumen' => $menu(),
                'produccion' => $produccion()
            ],
        };
        
        \json_response(['status' => 'success', 'data' => $data]);
    }

    private static function upload(): never {
        $file = $_FILES['archivo'] ?? null;
        if (!$file || ($file['error'] ?? 1) !== UPLOAD_ERR_OK) \json_response(['error' => 'No se encontró el archivo'], 400);
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, ['xlsx','xls'], true)) \json_response(['error' => 'Debe seleccionar un archivo Excel (.xlsx o .xls)'], 400);
        if (!class_exists(\PhpOffice\PhpSpreadsheet\IOFactory::class)) \json_response(['error' => 'Instale las dependencias de Composer para importar Excel.'], 503);
        // Valores sin formato: las fechas llegan como número de serie de Excel
        // y los números largos (cédula, teléfono) no se redondean.
        $sheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file['tmp_name'])->getActiveSheet()->toArray(null, true, false, false);
        $headers = array_map(fn($v) => strtolower(trim((string)$v)), array_shift($sheet) ?? []);
        $required = ['cedula','nombres','apellidos','correo','telefono','ficha','fecha fin etapa lectiva'];
        $missing = array_values(array_diff($required, $headers));
        if ($missing) \json_response(['error' => 'El documento excel que quieres cargar no tiene todas las columnas requeridas.', 'detalle' => ['faltantes' => $missing, 'requeridas' => $required]], 400);
        $records = []; $errors = [];
        foreach ($sheet as $index => $row) {
            $row = array_pad($row, count($headers), '');
            $fecha = self::excelDate($row[array_search('fecha fin etapa lectiva', $headers, true)]);
            $r = array_combine($headers, array_map([self::class, 'cellText'], $row));
            $id = $r['cedula']; $phone = $r['telefono']; $mail = strtolower($r['correo']); $ficha = $r['ficha'];
            if (!preg_match('/^[1-9][0-9]{7,9}$/', $id) || !$r['nombres'] || !$r['apellidos'] || !str_ends_with($mail, '@soy.sena.edu.co') || !preg_match('/^3[0-9]{9}$/', $phone) || !preg_match('/^[1-9][0-9]{6,7}$/', $ficha) || !$fecha) {
                $errors[] = ['fila' => $index + 2, 'error' => 'Datos incompletos o inválidos. Revise cédula, nombres, correo, teléfono, ficha y fecha.']; continue;
            }
            if (DB::row('SELECT id_usuario FROM usuarios WHERE id_usuario=?', [$id])) { $errors[] = ['fila' => $index + 2, 'id_usuario' => $id, 'error' => "El usuario con cédula $id ya está registrado."]; continue; }
            DB::exec("INSERT INTO usuarios (id_usuario,nombre,apellido,correo,contrasena,celular,ficha,fecha_fin_etapa_lectiva,rol_usuario,estado,fecha_creacion) VALUES (?,?,?,?,?,?,?,?,?,'activo',NOW())", [$id,$r['nombres'],$r['apellidos'],$mail,password_hash($phone,PASSWORD_BCRYPT),$phone,$ficha,$fecha,self::APRENDIZ]);
            $records[] = ['id_usuario' => $id, 'nombre' => $r['nombres'] . ' ' . $r['apellidos'], 'correo' => $mail, 'ficha' => $ficha, 'fecha_fin' => $fecha];
        }
        $count = count($records);
        \json_response(['mensaje' => "Carga completada. Se registraron $count aprendices.", 'registros_creados' => $count, 'registros' => $records, 'errores' => count($errors), 'detalle_errores' => $errors], $count === 0 && $errors ? 400 : 200);
    }

    private static function cellText(mixed $value): string {
        if (is_float($value) && floor($value) === $value) return sprintf('%.0f', $value);
        return trim((string)($value ?? ''));
    }

    /** Fecha de Excel (número de serie), AAAA-MM-DD o DD/MM/AAAA -> AAAA-MM-DD; null si no es válida. */
    private static function excelDate(mixed $value): ?string {
        if (is_int($value) || is_float($value)) {
            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float)$value)->format('Y-m-d');
        }
        $text = trim((string)($value ?? ''));
        foreach (['Y-m-d', 'd/m/Y', 'j/n/Y', 'd-m-Y', 'Y/m/d'] as $format) {
            $date = \DateTime::createFromFormat('!' . $format, $text);
            if ($date && $date->format($format) === $text) return $date->format('Y-m-d');
        }
        return null;
    }
}
