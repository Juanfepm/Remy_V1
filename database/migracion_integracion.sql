SET NAMES utf8mb4;
USE `remy`;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol`      tinyint(4)  NOT NULL,
  `nombre`      varchar(30) NOT NULL,
  `descripcion` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_roles_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `asistencias` (
  `id_asistencia`  int(11)     NOT NULL AUTO_INCREMENT,
  `id_evento`      varchar(15) NOT NULL,
  `correo_fk`      varchar(64) NOT NULL,
  `fecha_registro` datetime    DEFAULT NULL,
  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `uq_asistencia_evento_correo` (`id_evento`, `correo_fk`),
  KEY `fk_asistencia_correo` (`correo_fk`),
  CONSTRAINT `fk_asistencia_correo` FOREIGN KEY (`correo_fk`) REFERENCES `cliente` (`correo_pk`),
  CONSTRAINT `fk_asistencia_evento` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `roles` (`id_rol`, `nombre`, `descripcion`) VALUES
  (1, 'instructor', 'Acceso completo al panel administrativo'),
  (2, 'aprendiz',   'Acceso al panel de operación del día')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`), `descripcion` = VALUES(`descripcion`);

INSERT IGNORE INTO `roles` (`id_rol`, `nombre`, `descripcion`)
SELECT DISTINCT u.rol_usuario, CONCAT('rol_', u.rol_usuario), 'Creado por migracion_integracion.sql'
FROM usuarios u
WHERE u.rol_usuario IS NOT NULL;

ALTER TABLE `usuarios`
  ADD UNIQUE KEY IF NOT EXISTS `uq_usuarios_correo` (`correo`),
  ADD KEY IF NOT EXISTS `fk_usuarios_rol` (`rol_usuario`);

ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_rol` FOREIGN KEY IF NOT EXISTS (`rol_usuario`) REFERENCES `roles` (`id_rol`) ON UPDATE CASCADE;

INSERT IGNORE INTO `usuarios` VALUES
  ('1094912345','Jose','Trejos','instructor@sena.edu.co',1,'2026-09-08 15:36:53','$2y$10$39qPKz3oIjv0bqQTH1W8R.t0TKObCQk/ApRVUJ3PNbRzvQ7YQEhda','3114251','activo'),
  ('1094954321','Nelson','Cantero','aprendiz@soy.sena.edu.co',2,'2026-09-08 15:36:53','$2y$10$R50OsqX4beJ7jeJtv7l1x.xcgvTgluSEToMCi2rrPSxGG6z4yshyq','3114265','activo');

ALTER TABLE `platos` DROP FOREIGN KEY IF EXISTS `platos_ibfk_1`;

INSERT IGNORE INTO programacion_dia (fecha_reserva, id_menu)
SELECT DISTINCT DATE(r.fecha_reserva),
       (SELECT id_menu FROM menu WHERE estado = 'activo' ORDER BY fecha_creacion DESC LIMIT 1)
FROM reservas_dia r
WHERE r.fecha_reserva IS NOT NULL;

UPDATE reservas_dia SET fecha_reserva = DATE(fecha_reserva)
WHERE TIME(fecha_reserva) <> '00:00:00';

DELETE r FROM reservas_dia r
JOIN (
    SELECT correo_fk, fecha_reserva, MIN(id_reserva) AS id_valido
    FROM reservas_dia
    GROUP BY correo_fk, fecha_reserva
    HAVING COUNT(*) > 1
) d
  ON  r.correo_fk     = d.correo_fk
  AND r.fecha_reserva = d.fecha_reserva
  AND r.id_reserva   <> d.id_valido;

DELETE p FROM programacion_dia p
LEFT JOIN reservas_dia r ON r.fecha_reserva = p.fecha_reserva
WHERE TIME(p.fecha_reserva) <> '00:00:00'
  AND r.id_reserva IS NULL;

ALTER TABLE `reservas_dia`
  ADD UNIQUE KEY IF NOT EXISTS `uq_reserva_correo_dia` (`correo_fk`, `fecha_reserva`);

ALTER TABLE `reservas_dia` DROP INDEX IF EXISTS `correo_fk`;

ALTER TABLE `eventos`
  MODIFY `franja_horaria` varchar(20)  DEFAULT NULL,
  MODIFY `experiencia`    varchar(64)  DEFAULT NULL,
  MODIFY `asistentes`     int(11)      NOT NULL DEFAULT 0,
  MODIFY `imagen`         varchar(256) DEFAULT 'cafe.jpg';

UPDATE eventos SET imagen = 'cafe.jpg' WHERE imagen = 'exp_cafe.jpg';
UPDATE eventos SET franja_horaria = TRIM(franja_horaria) WHERE CHAR_LENGTH(franja_horaria) <> CHAR_LENGTH(TRIM(franja_horaria));
UPDATE eventos SET experiencia    = TRIM(experiencia)    WHERE CHAR_LENGTH(experiencia)    <> CHAR_LENGTH(TRIM(experiencia));

UPDATE eventos e LEFT JOIN usuarios u ON u.id_usuario = e.lider_cocina
SET e.lider_cocina = NULL
WHERE e.lider_cocina IS NOT NULL AND u.id_usuario IS NULL;

UPDATE eventos e LEFT JOIN usuarios u ON u.id_usuario = e.lider_servicio
SET e.lider_servicio = NULL
WHERE e.lider_servicio IS NOT NULL AND u.id_usuario IS NULL;

ALTER TABLE `eventos`
  ADD KEY IF NOT EXISTS `fk_eventos_lider_cocina` (`lider_cocina`),
  ADD KEY IF NOT EXISTS `fk_eventos_lider_servicio` (`lider_servicio`),
  ADD KEY IF NOT EXISTS `idx_eventos_fecha_inicio` (`fecha_inicio`);

ALTER TABLE `eventos`
  ADD CONSTRAINT `fk_eventos_lider_cocina`   FOREIGN KEY IF NOT EXISTS (`lider_cocina`)   REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_eventos_lider_servicio` FOREIGN KEY IF NOT EXISTS (`lider_servicio`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE eventos SET experiencia = 'Taller de Barismo', franja_horaria = '10:00', fecha_inicio = '2026-07-05 10:00:00'
WHERE id_evento = 'EVT-PROX-01' AND experiencia = 'Taller de Bari';
UPDATE eventos SET experiencia = 'Postres de Autor',  franja_horaria = '15:00', fecha_inicio = '2026-07-09 15:00:00'
WHERE id_evento = 'EVT-PROX-02' AND experiencia = 'Postres de Aut';
UPDATE eventos SET experiencia = 'Noche de Quesos',   franja_horaria = '18:00', fecha_inicio = '2026-07-17 18:00:00'
WHERE id_evento = 'EVT-PROX-03' AND experiencia = 'Noche de Queso';
UPDATE eventos SET franja_horaria = '16:00', fecha_inicio = '2026-07-02 16:00:00'
WHERE id_evento = 'EVT-HOY-01'  AND franja_horaria = '4:00 -';
UPDATE eventos SET franja_horaria = '17:00' WHERE id_evento = 'EVT-002'     AND franja_horaria = '05:00';
UPDATE eventos SET franja_horaria = '16:00' WHERE id_evento = 'EVT-003'     AND franja_horaria = '04:00';
UPDATE eventos SET franja_horaria = '14:00' WHERE id_evento = 'EVT-TEST-02' AND franja_horaria = '02:00';
UPDATE eventos SET fecha_inicio = '2026-09-07 11:00:00' WHERE id_evento = 'EVT-TEST-01' AND fecha_inicio = '2026-09-07 15:22:34';
UPDATE eventos SET fecha_inicio = '2026-09-10 14:00:00' WHERE id_evento = 'EVT-TEST-02' AND fecha_inicio = '2026-09-10 15:22:34';

UPDATE eventos SET descripcion = 'Descubre aromas, sabores y maridajes en una seleccion especial de vinos guiada por nuestros expertos.'
WHERE id_evento = 'EVT-002' AND descripcion LIKE '%buen cafe.';
UPDATE eventos SET descripcion = 'Descubre aromas, sabores y maridajes en una seleccion especial de quesos guiada por nuestros expertos.'
WHERE id_evento = 'EVT-003' AND descripcion LIKE '%seleccion especial de vinos%';

ALTER TABLE `ingredientes`
  MODIFY `id_ingrediente` varchar(12) NOT NULL,
  MODIFY `nombre`         varchar(64) DEFAULT NULL,
  MODIFY `unidad_minima`  varchar(10) DEFAULT NULL;

ALTER TABLE `plato_ingrediente` MODIFY `id_ingrediente` varchar(12) NOT NULL;
ALTER TABLE `entradas`          MODIFY `id_ingrediente` varchar(12) DEFAULT NULL;
ALTER TABLE `salidas`           MODIFY `id_ingrediente` varchar(12) DEFAULT NULL;

SET FOREIGN_KEY_CHECKS = 1;
