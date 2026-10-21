SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `remy`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `remy`;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol`      tinyint(4)  NOT NULL,
  `nombre`      varchar(30) NOT NULL,
  `descripcion` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_roles_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario`     varchar(15)  NOT NULL,
  `nombre`         varchar(40)  DEFAULT NULL,
  `apellido`       varchar(40)  DEFAULT NULL,
  `correo`         varchar(64)  DEFAULT NULL,
  `rol_usuario`    tinyint(4)   DEFAULT NULL,
  `fecha_creacion` datetime     DEFAULT NULL,
  `contrasena`     varchar(255) DEFAULT NULL,
  `ficha`          varchar(8)   DEFAULT NULL,
  `estado`         varchar(10)  DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuarios_correo` (`correo`),
  KEY `fk_usuarios_rol` (`rol_usuario`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_usuario`) REFERENCES `roles` (`id_rol`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `responsable_cargo` (
  `id_usuario_fk` varchar(15) NOT NULL,
  `ficha`         varchar(8)  DEFAULT NULL,
  PRIMARY KEY (`id_usuario_fk`),
  CONSTRAINT `responsable_cargo_ibfk_1` FOREIGN KEY (`id_usuario_fk`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `cliente` (
  `correo_pk`      varchar(64) NOT NULL,
  `fecha_registro` datetime    DEFAULT NULL,
  PRIMARY KEY (`correo_pk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `categorias_platos` (
  `id_categoria` int(11)     NOT NULL AUTO_INCREMENT,
  `nombre`       varchar(50) NOT NULL,
  `estado`       varchar(10) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `platos` (
  `id_plato`       varchar(7)   NOT NULL,
  `nombre`         varchar(64)  NOT NULL,
  `categoria`      int(11)      NOT NULL,
  `descripcion`    text         DEFAULT NULL,
  `img_plato`      varchar(256) DEFAULT NULL,
  `fecha_creacion` date         DEFAULT NULL,
  `estado`         varchar(10)  DEFAULT NULL,
  PRIMARY KEY (`id_plato`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `fk_platos_categoria` (`categoria`),
  CONSTRAINT `fk_platos_categoria` FOREIGN KEY (`categoria`) REFERENCES `categorias_platos` (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `menu` (
  `id_menu`          varchar(12)  NOT NULL,
  `nombre`           varchar(64)  NOT NULL,
  `tiempos_menu`     tinyint(4)   DEFAULT NULL,
  `precio`           int(11)      DEFAULT NULL,
  `descripcion`      text         DEFAULT NULL,
  `estado`           varchar(10)  DEFAULT NULL,
  `fecha_creacion`   date         DEFAULT NULL,
  `img_plato_fuerte` varchar(256) DEFAULT NULL,
  `img_bebida`       varchar(256) DEFAULT NULL,
  `img_entrada`      varchar(256) DEFAULT NULL,
  `img_postre`       varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id_menu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `contiene` (
  `id_menu`  varchar(12) NOT NULL,
  `id_plato` varchar(7)  NOT NULL,
  PRIMARY KEY (`id_menu`, `id_plato`),
  KEY `fk_contiene_plato` (`id_plato`),
  CONSTRAINT `fk_contiene_menu`  FOREIGN KEY (`id_menu`)  REFERENCES `menu` (`id_menu`),
  CONSTRAINT `fk_contiene_plato` FOREIGN KEY (`id_plato`) REFERENCES `platos` (`id_plato`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `programacion_dia` (
  `fecha_reserva`  datetime    NOT NULL,
  `id_menu`        varchar(12) DEFAULT NULL,
  `lider_servicio` varchar(15) DEFAULT NULL,
  `lider_cocina`   varchar(15) DEFAULT NULL,
  PRIMARY KEY (`fecha_reserva`),
  KEY `lider_servicio` (`lider_servicio`),
  KEY `lider_cocina` (`lider_cocina`),
  KEY `fk_programacion_menu` (`id_menu`),
  CONSTRAINT `fk_programacion_menu`    FOREIGN KEY (`id_menu`)        REFERENCES `menu` (`id_menu`),
  CONSTRAINT `programacion_dia_ibfk_2` FOREIGN KEY (`lider_servicio`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `programacion_dia_ibfk_3` FOREIGN KEY (`lider_cocina`)   REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `reservas_dia` (
  `id_reserva`     int(11)     NOT NULL AUTO_INCREMENT,
  `correo_fk`      varchar(64) NOT NULL,
  `cantidad_menus` int(11)     DEFAULT NULL,
  `fecha_reserva`  datetime    DEFAULT NULL,
  `estado`         varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_reserva`),
  UNIQUE KEY `uq_reserva_correo_dia` (`correo_fk`, `fecha_reserva`),
  KEY `fecha_reserva` (`fecha_reserva`),
  CONSTRAINT `reservas_dia_ibfk_1` FOREIGN KEY (`correo_fk`)     REFERENCES `cliente` (`correo_pk`),
  CONSTRAINT `reservas_dia_ibfk_2` FOREIGN KEY (`fecha_reserva`) REFERENCES `programacion_dia` (`fecha_reserva`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `experiencias` (
  `id_experiencia`  varchar(12)  NOT NULL,
  `nombre`          varchar(64)  NOT NULL,
  `descripcion`     text         DEFAULT NULL,
  `precio`          int(11)      DEFAULT NULL,
  `img_experiencia` varchar(256) DEFAULT NULL,
  `estado`          varchar(10)  DEFAULT NULL,
  PRIMARY KEY (`id_experiencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `eventos` (
  `id_evento`            varchar(15)  NOT NULL,
  `estado`               varchar(10)  DEFAULT NULL,
  `correo_fk`            varchar(64)  NOT NULL,
  `franja_horaria`       varchar(20)  DEFAULT NULL,
  `fecha_inicio`         datetime     DEFAULT NULL,
  `fecha_fin`            datetime     DEFAULT NULL,
  `numero_personas`      int(11)      DEFAULT NULL,
  `experiencia`          varchar(64)  DEFAULT NULL,
  `descripcion`          text         DEFAULT NULL,
  `id_menu_fk`           varchar(12)  NOT NULL,
  `fecha_creacion`       datetime     DEFAULT NULL,
  `fecha_modificacion`   datetime     DEFAULT NULL,
  `usuario_modificacion` varchar(128) DEFAULT NULL,
  `lider_cocina`         varchar(15)  DEFAULT NULL,
  `lider_servicio`       varchar(15)  DEFAULT NULL,
  `costo_total`          int(11)      DEFAULT NULL,
  `tipo_servicio`        varchar(12)  NOT NULL,
  `asistentes`           int(11)      NOT NULL DEFAULT 0,
  `imagen`               varchar(256) DEFAULT 'cafe.jpg',
  PRIMARY KEY (`id_evento`),
  KEY `correo_fk` (`correo_fk`),
  KEY `id_menu_fk` (`id_menu_fk`),
  KEY `fk_eventos_lider_cocina` (`lider_cocina`),
  KEY `fk_eventos_lider_servicio` (`lider_servicio`),
  KEY `idx_eventos_fecha_inicio` (`fecha_inicio`),
  CONSTRAINT `eventos_ibfk_2`            FOREIGN KEY (`correo_fk`)      REFERENCES `cliente` (`correo_pk`),
  CONSTRAINT `fk_eventos_menu`           FOREIGN KEY (`id_menu_fk`)     REFERENCES `menu` (`id_menu`) ON UPDATE CASCADE,
  CONSTRAINT `fk_eventos_lider_cocina`   FOREIGN KEY (`lider_cocina`)   REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_eventos_lider_servicio` FOREIGN KEY (`lider_servicio`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
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

CREATE TABLE IF NOT EXISTS `categoria_ingredientes` (
  `id_categoria` varchar(12) NOT NULL,
  `nombre`       varchar(50) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `ingredientes` (
  `id_ingrediente` varchar(12) NOT NULL,
  `categoria`      varchar(12) NOT NULL,
  `nombre`         varchar(64) DEFAULT NULL,
  `stock`          int(11)     DEFAULT NULL,
  `unidad_minima`  varchar(10) DEFAULT NULL,
  `stock_minimo`   int(11)     DEFAULT NULL,
  PRIMARY KEY (`id_ingrediente`),
  KEY `categoria` (`categoria`),
  CONSTRAINT `ingredientes_ibfk_1` FOREIGN KEY (`categoria`) REFERENCES `categoria_ingredientes` (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `plato_ingrediente` (
  `id_plato`       varchar(7)  NOT NULL,
  `id_ingrediente` varchar(12) NOT NULL,
  `cantidad`       int(11)     DEFAULT NULL,
  PRIMARY KEY (`id_plato`, `id_ingrediente`),
  KEY `fk_platoingrediente_ingrediente` (`id_ingrediente`),
  CONSTRAINT `fk_platoingrediente_ingrediente` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id_ingrediente`),
  CONSTRAINT `plato_ingrediente_ibfk_1`        FOREIGN KEY (`id_plato`)       REFERENCES `platos` (`id_plato`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `proveedores` (
  `id_proveedor` varchar(12) NOT NULL,
  `nombre`       varchar(40) NOT NULL,
  `telefono`     varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `entradas` (
  `id_entrada`        int(11)     NOT NULL AUTO_INCREMENT,
  `id_ingrediente`    varchar(12) DEFAULT NULL,
  `fecha_vencimiento` date        DEFAULT NULL,
  `fecha_hora`        datetime    DEFAULT NULL,
  `cantidad`          int(11)     DEFAULT NULL,
  `estado`            varchar(50) DEFAULT NULL,
  `unidad_medida`     varchar(10) DEFAULT NULL,
  `id_proveedor`      varchar(12) DEFAULT NULL,
  `factura`           varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_entrada`),
  KEY `id_ingrediente` (`id_ingrediente`),
  KEY `id_proveedor` (`id_proveedor`),
  CONSTRAINT `entradas_ibfk_1` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id_ingrediente`),
  CONSTRAINT `entradas_ibfk_2` FOREIGN KEY (`id_proveedor`)   REFERENCES `proveedores` (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `salidas` (
  `id_salida`      int(11)     NOT NULL AUTO_INCREMENT,
  `id_ingrediente` varchar(12) DEFAULT NULL,
  `fecha_hora`     datetime    DEFAULT NULL,
  `cantidad`       int(11)     DEFAULT NULL,
  `motivo_salida`  varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id_salida`),
  KEY `id_ingrediente` (`id_ingrediente`),
  CONSTRAINT `salidas_ibfk_1` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id_ingrediente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `roles` (`id_rol`, `nombre`, `descripcion`) VALUES
  (1, 'instructor', 'Acceso completo al panel administrativo'),
  (2, 'aprendiz',   'Acceso al panel de operación del día')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`), `descripcion` = VALUES(`descripcion`);

INSERT INTO `categorias_platos` (`id_categoria`, `nombre`, `estado`) VALUES
  (1, 'Entrada', 'activo'),
  (2, 'Fuerte',  'activo'),
  (3, 'Postre',  'activo'),
  (4, 'Bebida',  'activo')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

INSERT IGNORE INTO `usuarios` VALUES
  ('1094912345','Jose','Trejos','instructor@sena.edu.co',1,'2026-09-08 15:36:53','$2y$10$39qPKz3oIjv0bqQTH1W8R.t0TKObCQk/ApRVUJ3PNbRzvQ7YQEhda','3114251','activo'),
  ('1094954321','Nelson','Cantero','aprendiz@soy.sena.edu.co',2,'2026-09-08 15:36:53','$2y$10$R50OsqX4beJ7jeJtv7l1x.xcgvTgluSEToMCi2rrPSxGG6z4yshyq','3114265','activo'),
  ('16161616','Usuario','DePrueba','usuario@gmail.com',1,'2026-06-23 15:40:02','$2a$12$GSl3grVQeAmu1gpCO4njxOjCChcpIiVWPErHX3M/N0qnB8C/NufAW',NULL,'activo');

INSERT IGNORE INTO `cliente` VALUES
  ('ana.garcia@gmail.com','2026-04-01 10:30:00'),
  ('carlos.lopez@gmail.com','2026-04-15 14:00:00'),
  ('guia.aprendiz@sena.edu.co','2026-09-05 15:22:32'),
  ('jose_mbetancourth@soy.sena.edu.co','2026-09-08 15:57:32'),
  ('juan.perez@soy.sena.edu.co','2026-09-05 15:22:32'),
  ('maria.torres@gmail.com','2026-05-02 09:15:00'),
  ('nelson_cantero@soy.sena.edu.co','2026-09-07 21:45:15'),
  ('santiago_trejosga@soy.sena.edu.co','2026-09-08 15:59:20');

INSERT IGNORE INTO `menu` VALUES
  ('MEN-000001','Menú Ejecutivo',3,35000,'Menú de tres tiempos ideal para almuerzos de negocios','activo','2026-01-10','plato.jpg','bebida.jpg','entrada.jpg','postre.jpg'),
  ('MEN-000002','Menú Gourmet',4,55000,'Experiencia de cuatro tiempos con ingredientes premium','activo','2026-02-05','plato.jpg','bebida.jpg','entrada.jpg','postre.jpg'),
  ('MEN-000003','Menú Familiar',4,45000,'Cuatro tiempos pensados para compartir en familia','activo','2026-03-12','plato.jpg','bebida.jpg','entrada.jpg','postre.jpg');

INSERT IGNORE INTO `platos` VALUES
  ('PLT-001','Ensalada César',1,'Lechuga romana, crutones, parmesano y aderezo césar','Ensalada César.png','2026-01-10','activo'),
  ('PLT-002','Pollo a la Plancha',2,'Pechuga de pollo a las finas hierbas con papas doradas','Pollo a la Plancha.png','2026-01-10','activo'),
  ('PLT-003','Tiramisú',3,'Postre italiano clásico con mascarpone y café',NULL,'2026-01-10','activo'),
  ('PLT-004','Bruschetta de Tomate',1,'Pan artesanal con tomate fresco, albahaca y ajo',NULL,'2026-02-05','activo'),
  ('PLT-005','Filete de Res',2,'Corte de res en término medio con vegetales salteados',NULL,'2026-02-05','activo'),
  ('PLT-006','Mousse de Chocolate',3,'Mousse belga con crema chantilly y frutos rojos',NULL,'2026-02-05','activo'),
  ('PLT-007','Limonada de Coco',4,'Limonada artesanal con leche de coco y menta fresca',NULL,'2026-02-05','activo'),
  ('PLT-008','Ceviche de Camarón',1,'Camarones frescos marinados en limón con aguacate',NULL,'2026-03-12','activo'),
  ('PLT-009','Salmón al Horno',2,'Filete de salmón con costra de hierbas y risotto',NULL,'2026-03-12','activo'),
  ('PLT-010','Flan de Caramelo',3,'Flan casero bañado en caramelo artesanal',NULL,'2026-03-12','activo'),
  ('PLT-011','Jugo de Maracuyá',4,'Jugo natural de maracuyá con panela y hielo',NULL,'2026-03-12','activo');

INSERT IGNORE INTO `contiene` VALUES
  ('MEN-000001','PLT-001'),('MEN-000001','PLT-002'),('MEN-000001','PLT-003'),
  ('MEN-000002','PLT-004'),('MEN-000002','PLT-005'),('MEN-000002','PLT-006'),('MEN-000002','PLT-007'),
  ('MEN-000003','PLT-008'),('MEN-000003','PLT-009'),('MEN-000003','PLT-010'),('MEN-000003','PLT-011');

INSERT IGNORE INTO `programacion_dia` VALUES
  ('2026-09-05 00:00:00','MEN-000001','16161616','16161616'),
  ('2026-09-06 00:00:00','MEN-000002','16161616','16161616'),
  ('2026-09-07 00:00:00','MEN-000003',NULL,NULL),
  ('2026-09-08 00:00:00','MEN-000003',NULL,NULL);

INSERT IGNORE INTO `reservas_dia` VALUES
  (1,'juan.perez@soy.sena.edu.co',2,'2026-09-05 00:00:00','entregada'),
  (2,'guia.aprendiz@sena.edu.co',1,'2026-09-05 00:00:00','entregada'),
  (3,'ana.garcia@gmail.com',4,'2026-09-05 00:00:00','entregada'),
  (4,'nelson_cantero@soy.sena.edu.co',3,'2026-09-07 00:00:00','activo'),
  (9,'jose_mbetancourth@soy.sena.edu.co',4,'2026-09-08 00:00:00','entregada'),
  (10,'nelson_cantero@soy.sena.edu.co',1,'2026-09-08 00:00:00','entregada');

INSERT IGNORE INTO `experiencias` VALUES
  ('EXP001','Cata de Café','Descubre aromas, sabores y la historia detras de cada taza. Una experiencia unica para los amantes del buen cafe.',12000,'cafe.jpg','activo'),
  ('EXP002','Cata de Vinos','Descubre aromas, sabores y maridajes en una seleccion especial de vinos guiada por nuestros expertos.',15000,'vino.jpg','activo'),
  ('EXP003','Cata de Quesos','Descubre aromas, sabores y maridajes en una seleccion especial de quesos guiada por nuestros expertos.',12000,'quesos.jpg','activo');

INSERT IGNORE INTO `eventos`
  (`id_evento`,`estado`,`correo_fk`,`franja_horaria`,`fecha_inicio`,`fecha_fin`,`numero_personas`,`experiencia`,`descripcion`,`id_menu_fk`,`fecha_creacion`,`fecha_modificacion`,`usuario_modificacion`,`lider_cocina`,`lider_servicio`,`costo_total`,`tipo_servicio`,`asistentes`,`imagen`)
VALUES
  ('EVT-001','cancelado','ana.garcia@gmail.com','12:00','2026-09-05 12:00:00',NULL,20,'Cata de cafes','Descubre aromas, sabores y la historia detras de cada taza. Una experiencia unica para los amantes del buen cafe.','MEN-000001',NULL,'2026-09-08 16:51:04',NULL,NULL,NULL,12000,'presencial',20,'cafe.jpg'),
  ('EVT-002','activo','carlos.lopez@gmail.com','17:00','2026-07-18 17:00:00',NULL,23,'Cata de vinos','Descubre aromas, sabores y maridajes en una seleccion especial de vinos guiada por nuestros expertos.','MEN-000002',NULL,'2026-09-05 10:45:28',NULL,NULL,NULL,1265000,'presencial',40,'vino.jpg'),
  ('EVT-003','activo','maria.torres@gmail.com','16:00','2026-08-05 16:00:00',NULL,67,'Cata de quesos','Descubre aromas, sabores y maridajes en una seleccion especial de quesos guiada por nuestros expertos.','MEN-000003',NULL,'2026-09-04 20:20:17',NULL,NULL,NULL,3015000,'domicilio',15,'quesos.jpg'),
  ('EVT-HOY-01','activo','ana.garcia@gmail.com','16:00','2026-07-02 16:00:00',NULL,28,'Cata de vinos','Disfruta de una selección exclusiva de cepas chilenas y argentinas en nuestra cava principal.','MEN-000001',NULL,NULL,NULL,NULL,NULL,15000,'presencial',18,'vino.jpg'),
  ('EVT-PROX-01','activo','carlos.lopez@gmail.com','10:00','2026-07-05 10:00:00',NULL,30,'Taller de Barismo','Aprende a preparar el espresso perfecto y técnicas de arte latte con expertos.','MEN-000002',NULL,NULL,NULL,NULL,NULL,28000,'presencial',12,'cafe.jpg'),
  ('EVT-PROX-02','activo','maria.torres@gmail.com','15:00','2026-07-09 15:00:00',NULL,20,'Postres de Autor','Clase magistral sobre repostería fina y emplatado de postres gourmet.','MEN-000003',NULL,NULL,NULL,NULL,NULL,32000,'presencial',5,'postre.jpg'),
  ('EVT-PROX-03','activo','ana.garcia@gmail.com','18:00','2026-07-17 18:00:00',NULL,25,'Noche de Quesos','Degustación de quesos artesanales acompañados de frutos secos y panes de la casa.','MEN-000001',NULL,NULL,NULL,NULL,NULL,25000,'domicilio',20,'quesos.jpg'),
  ('EVT-TEST-01','activo','juan.perez@soy.sena.edu.co','11:00','2026-09-07 11:00:00',NULL,30,'Cata de Cafe','Sesión de prueba para verificar la interfaz de detalles.','MEN-000001',NULL,NULL,NULL,NULL,NULL,12000,'presencial',0,'cafe.jpg'),
  ('EVT-TEST-02','activo','ana.garcia@gmail.com','14:00','2026-09-10 14:00:00',NULL,25,'Cata de Vinos','Evento de prueba para la lista de administración.','MEN-000002',NULL,NULL,NULL,NULL,NULL,15000,'presencial',10,'vino.jpg');

SET FOREIGN_KEY_CHECKS = 1;
