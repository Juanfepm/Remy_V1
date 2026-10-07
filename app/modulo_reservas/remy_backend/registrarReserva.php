<?php
require_once 'conexion.php';
require_once 'correo_institucional.php';
require_once 'notificar_correo.php';

header('Content-Type: application/json; charset=utf-8');

$correo = normalizar_correo($_POST['correo'] ?? '');
$cantidad = filter_var($_POST['cantidad'] ?? null, FILTER_VALIDATE_INT);

if (!es_correo_institucional($correo)) {
	http_response_code(400);
	echo json_encode(['ok' => false, 'mensaje' => 'Usa un correo institucional válido.'], JSON_UNESCAPED_UNICODE);
	exit;
}

if ($cantidad === false || $cantidad < 1 || $cantidad > 10) {
	http_response_code(400);
	echo json_encode(['ok' => false, 'mensaje' => 'La cantidad debe estar entre 1 y 10 menús.'], JSON_UNESCAPED_UNICODE);
	exit;
}

$fecha = date('Y-m-d 00:00:00');
$conn->begin_transaction();

try {
	$stmt = $conn->prepare(
		'SELECT r.id_reserva, r.estado
		 FROM reservas_dia r
		 WHERE r.correo_fk = ? AND DATE(r.fecha_reserva) = ? AND r.estado <> "cancelada"
		 LIMIT 1'
	);
	$dia = substr($fecha, 0, 10);
	$stmt->bind_param('ss', $correo, $dia);
	$stmt->execute();
	$existente = $stmt->get_result()->fetch_assoc();
	$stmt->close();

	if ($existente) {
		$conn->rollback();
		http_response_code(409);
		echo json_encode([
			'ok' => false,
			'idReserva' => (int) $existente['id_reserva'],
			'mensaje' => 'Ya tienes una reserva para el menú de hoy.'
		], JSON_UNESCAPED_UNICODE);
		exit;
	}

	$stmt = $conn->prepare(
		'SELECT m.id_menu, m.nombre, m.precio
		 FROM menu m
		 LEFT JOIN programacion_dia p
		   ON p.id_menu = m.id_menu AND DATE(p.fecha_reserva) = ?
		 WHERE m.estado = "activo"
		 ORDER BY (p.id_menu IS NOT NULL) DESC, m.id_menu ASC
		 LIMIT 1'
	);
	$stmt->bind_param('s', $dia);
	$stmt->execute();
	$menu = $stmt->get_result()->fetch_assoc();
	$stmt->close();

	if (!$menu) {
		throw new RuntimeException('No hay un menú activo disponible.');
	}

	$stmt = $conn->prepare(
		'INSERT INTO cliente (correo_pk, fecha_registro) VALUES (?, NOW())
		 ON DUPLICATE KEY UPDATE correo_pk = correo_pk'
	);
	$stmt->bind_param('s', $correo);
	$stmt->execute();
	$stmt->close();

	$stmt = $conn->prepare(
		'INSERT INTO programacion_dia (fecha_reserva, id_menu)
		 VALUES (?, ?)
		 ON DUPLICATE KEY UPDATE id_menu = VALUES(id_menu)'
	);
	$stmt->bind_param('ss', $fecha, $menu['id_menu']);
	$stmt->execute();
	$stmt->close();

	$estado = 'pendiente';
	$stmt = $conn->prepare(
		'INSERT INTO reservas_dia (correo_fk, cantidad_menus, fecha_reserva, estado)
		 VALUES (?, ?, ?, ?)'
	);
	$stmt->bind_param('siss', $correo, $cantidad, $fecha, $estado);
	$stmt->execute();
	$idReserva = $conn->insert_id;
	$stmt->close();

	$conn->commit();

	$total = $cantidad * (int) $menu['precio'];
	$aviso = notificar_por_correo('menu_dia', $correo, [
		'reserva' => $idReserva,
		'menu' => $menu['nombre'],
		'cantidad' => $cantidad,
		'fecha' => $dia,
		'total' => $total
	]);

	echo json_encode([
		'ok' => true,
		'idReserva' => $idReserva,
		'cantidad' => $cantidad,
		'mensaje' => 'Reserva registrada correctamente.',
		'correoEnviado' => $aviso['enviado'],
		'correoDetalle' => $aviso['mensaje']
	], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
	$conn->rollback();
	http_response_code(500);
	echo json_encode(['ok' => false, 'mensaje' => $error->getMessage()], JSON_UNESCAPED_UNICODE);
}

$conn->close();
