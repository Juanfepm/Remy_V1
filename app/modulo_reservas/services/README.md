# REMY · Backend web de reservas

Las API PHP de reservas están en esta carpeta y comparten la base de datos
`remy`. La web consume estas API desde `app/static/modulo_reservas/rm_codigos`.
El micro de correo está en [`correo/`](correo/).

## Puesta en marcha

1. Arrancar **Apache** y **MySQL** desde XAMPP. Para que la URL de la web
   funcione sin cambios, ubicar el repositorio en `C:\xampp\htdocs\Remy_V1`.
2. Importar la base desde la raíz del repositorio:

```bash
"C:/xampp/mysql/bin/mysql.exe" -u root < C:/xampp/htdocs/Remy_V1/app/modulo_reservas/services/bd/remy.sql
```

   El script crea la base `remy`. Si la base ya existe, revisar
   [`bd/README.md`](bd/README.md) antes de ejecutar una migración.
3. La URL PHP que usa la web se configura en
   `app/static/modulo_reservas/rm_codigos/config.js`.
   El micro de correo se configura por separado en [`correo/README.md`](correo/README.md).

## Qué se unificó

| Antes | Ahora |
|---|---|
| `conexion.php` → base `remy_final_jm` | `conexion.php` → base `remy` |
| `dbremy.php` → base `remy` (usuario `backend`) | *(eliminado)* |
| `dbrm.php` → base `remy1` (puerto 3307) | *(eliminado)* |

`conexion.php` expone **las dos** variables que usaban los distintos .php:
`$conexion` (mysqli procedimental) y `$conn` (mysqli objeto). Son la misma
conexión, así que ningún archivo tuvo que reescribir sus consultas.

## Ajustes hechos al unificar

* **`remy.sql`** (reemplaza a `remy_final_jm.sql`, archivado en `legacy/`):
  * `menu` gana `img_plato_fuerte`, `img_bebida`, `img_entrada`, `img_postre`
    (columnas que solo existían en la base `remy1` y que usa el Menú del día).
  * `reservas_dia.id_reserva` pasa de `varchar(15)` a `int AUTO_INCREMENT`,
    porque `registrarReserva.php` no envía el id.
  * No se trae la tabla `tipos_servicio` de `remy1`: el nombre del servicio ya
    está en `eventos.tipo_servicio`.
* **`consultaeventos.php`**: consulta `eventos.tipo_servicio` en lugar de hacer
  JOIN con la desaparecida `tipos_servicio`. El JSON de salida no cambia.
* **`registrarReserva.php`**: programa el día con el `id_menu` activo real
  (`MEN-0000xx`) en vez del literal `'1'`, que no existe en la base unificada
  y rompía la llave foránea `programacion_dia.id_menu`.
* **`listar_reservas_hoy.php`**: `id_reserva` se devuelve como `idReserva`,
  que es el nombre que espera el cliente web.
* **`actualizar_estado_reserva.php`** y **`actualizar_evento.php`**: aceptan
  parámetros por query string además de por `$_POST` / cuerpo JSON.
* **`menu_dia.php`**: las imágenes se sirven desde `img_menu/` del propio
  backend en vez de una IP fija.
* **`cancelar_evento.php`**: mismo trato con los parámetros por query string.
  Además ahora devuelve 404 si el id de evento no existe, en vez de un 200 vacío.

## Carpetas de imágenes

* `img_menu/` - fotos de menús y platos.
* `img_exp/`  - fotos de experiencias.

---

## Cambios al conectar la web (septiembre 2026)

La web ubicada en `app/templates/modulo_reservas` consume estos mismos
servicios PHP. Los recursos del navegador están en
`app/static/modulo_reservas`.

### `registrarReserva.php` - reservas duplicadas

Era el bug de fondo: pulsar "Crear reserva" tres veces guardaba tres reservas
iguales. La causa era `date("Y-m-d H:i:s")`: cada clic escribía una fecha
distinta (por segundos), así que ni el `INSERT IGNORE` de `programacion_dia`
ni nada más veía el duplicado, y además se creaba una fila basura de
programación por cada intento.

Ahora:

* el día se normaliza a `00:00:00`, que es la llave que comparten
  `programacion_dia` (PK) y `reservas_dia` (FK);
* antes de insertar se busca si ese correo ya reservó hoy; si sí, responde
  **409** con el `idReserva` que ya existe en vez de crear otra;
* el `INSERT` pasó a sentencia preparada (antes concatenaba el correo);
* la respuesta es JSON (`{ok, idReserva, correo, cantMenus, fechaReserva,
  estado, mensaje}`) en lugar de texto suelto, para que el cliente pueda
  mostrar el número de reserva.

El correo es la PK de `cliente`, así que es la llave natural del negocio:
**un correo, una reserva por día**. Esa regla también quedó escrita en la base
(`bd/remy.sql`), por si dos peticiones entran a la vez.

### `login.php` *(nuevo)*

Inicio de sesión del panel administrativo. Valida contra `usuarios` con
`password_verify` y sólo deja entrar a `rol_usuario` **1 (instructor)** y
**2 (aprendiz)**. Devuelve `{ok, idUsuario, nombre, correo, rol, rolNombre,
ficha}`. Acepta formulario y JSON.

### `consulta_reserva_dia.php` *(nuevo)*

`?correo=` → dice si esa persona ya tiene reserva hoy. La web lo usa para
avisar antes de que el cliente pulse el botón; la validación de verdad sigue
estando en `registrarReserva.php` y en el índice único.

### `cabeceras.php` *(nuevo)*

Cabeceras CORS y respuesta al `OPTIONS` de sondeo. Se incluye desde
`conexion.php`, así que aplica a todos los micros sin tocarlos uno por uno.
### `crear_evento.php`

Guarda `imagen` según el nombre de la experiencia (`vino.jpg`, `quesos.jpg`,
`postre.jpg`, `cafe.jpg`), igual que `insertarEvento.php`. Antes se quedaba
con el `exp_cafe.jpg` que trae la base por defecto y que no existe en
`img_exp/`, así que la foto salía rota.

### `consulta_Menus.php`

`ImgMenu` ahora es `COALESCE(p.img_plato, m.img_plato_fuerte)`: varios platos
no tienen foto propia y la lista de menús salía sin imagen. El JSON no cambia
de forma.

### Índice único de reservas diarias

El índice `uq_reserva_correo_dia (correo_fk, fecha_reserva)` de
`bd/remy.sql` evita más de una reserva por correo y día. Para una base que ya
existe, consulta [`bd/README.md`](bd/README.md) antes de ejecutar la migración.
La base incluye un instructor y un aprendiz de prueba:

| Rol | Correo | Contraseña |
|---|---|---|
| Instructor | `instructor@sena.edu.co` | `3001234567` |
| Aprendiz | `aprendiz@soy.sena.edu.co` | `3007654321` |

La contraseña son los 10 dígitos del teléfono, que es lo que pide el
formulario de login. Se guardan con `password_hash` (bcrypt).

### `conexion.php` - zona horaria

PHP venía con la zona por defecto de XAMPP (`Europe/Berlin`), 7 horas por
delante de la hora local. Después de las 5 de la tarde `date("Y-m-d")` ya
devolvía el día siguiente y no coincidía con `CURDATE()` de MySQL: la reserva
del día se guardaba con fecha de mañana y `listar_reservas_hoy.php` devolvía
una lista vacía. Ahora `conexion.php` fija `America/Bogota`, así que PHP, MySQL
y el reloj del equipo hablan del mismo día.

---

## Micro de correo y asistencia a mini eventos

### `correo/` *(Python)*

Micro Flask que manda los correos de confirmación. Ver
[`correo/README.md`](correo/README.md). Confirma tres cosas:
la reserva del menú del día, la reserva de un evento y la asistencia a un mini
evento. Las credenciales SMTP se leen del entorno, no están en el código.

### `notificar_correo.php` *(nuevo)*

El puente entre los .php y ese micro. Se llama **siempre después de guardar**,
con un tiempo de espera de 1 segundo para conectar: si el servicio de correo
está apagado, la reserva ya quedó registrada y sólo se informa que el aviso no
salió, en los campos `correoEnviado` y `correoDetalle` de la respuesta. Nunca
se pierde una reserva por un problema de correo.

### `confirmar_asistencia.php` *(nuevo)*

En la pantalla pública de eventos, los "próximos eventos" son mini eventos
(experiencias bajo demanda): no hay que reservar el salón entero, basta con
apuntarse. Este micro registra a la persona, le suma uno a `eventos.asistentes`
y le manda el correo.

Reglas, las mismas del resto del sistema: correo institucional, un correo no se
apunta dos veces al mismo evento (índice único en `asistencias`, responde 409)
y no se pasa del cupo de `numero_personas`.

### `parche_asistencias.sql` *(nuevo)*

> Archivado en `legacy/`. Ya va incluido en `bd/remy.sql` y en
> `bd/migracion_integracion.sql`: no hace falta ejecutarlo.

Crea la tabla `asistencias` (`id_evento` + `correo_fk` únicos). Hacía falta
porque `eventos.asistentes` es sólo un contador: sin saber quién confirmó no se
puede evitar que la misma persona se apunte dos veces ni mandarle el correo.

```bash
"C:/xampp/mysql/bin/mysql.exe" -u root remy < parche_asistencias.sql
```
