# REMY · Web unificada

Un solo proyecto web de reservas, organizado con la estructura del repositorio:
las páginas están en `app/templates/modulo_reservas`, los recursos en
`app/static/modulo_reservas` y los servicios PHP en `app/modulo_reservas/services`.

## Puesta en marcha

### Web

Desde la raíz del repositorio, iniciar Flask:

```bash
python -m pip install -r app/modulo_reservas/requirements.txt
flask --app app.modulo_reservas.app run --port 5000
```

Abrir `http://127.0.0.1:5000/`. El panel administrativo está en
`http://127.0.0.1:5000/aplicacion/login.html`.

### Backend PHP y base de datos

Arrancar Apache y MySQL con XAMPP. Para que la URL predeterminada del backend
funcione, ubicar el repositorio como `C:\xampp\htdocs\Remy_V1` (o cambiar
`URL_BACKEND` en `app/static/modulo_reservas/rm_codigos/config.js` si se usa
otra ruta).

Para instalar la base desde cero:

```bash
"C:/xampp/mysql/bin/mysql.exe" -u root < C:/xampp/htdocs/Remy_V1/app/modulo_reservas/services/bd/remy.sql
```

Si la base `remy` ya existe, seguir las instrucciones de
[`services/bd/README.md`](services/bd/README.md) para ejecutar la migración
sin borrar los datos existentes. Los detalles de las API PHP están en
[`services/README.md`](services/README.md); el micro de correo tiene su propia
guía en [`services/correo/README.md`](services/correo/README.md).

### Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Instructor | `instructor@sena.edu.co` | `3001234567` |
| Aprendiz | `aprendiz@soy.sena.edu.co` | `3007654321` |

La contraseña son los 10 dígitos del teléfono, como pide el formulario.

## Las dos mitades del proyecto

### Públicas - el cliente no tiene cuenta

Reservan sin iniciar sesión. Comparten el cabezote azul y la barra de
pestañas de la interfaz de **eventos**, que en pantallas grandes se convierte
en barra lateral.

| Pantalla | Archivo | Micros |
|---|---|---|
| Menú del día | `aplicacion/menu_dia.html` | `menu_dia.php`, `registrarReserva.php`, `consulta_reserva_dia.php` |
| Reservas (paso 1 y 2) | `aplicacion/reservas.html` | `consulta_Menus.php`, `consultaExperiencias.php` |
| Datos de la reserva (paso 3) | `aplicacion/datos_reserva.html` | `consulta_cupo.php`, `crear_evento.php` |
| Eventos | `aplicacion/eventos.html` | `consultaEventosCliente.php`, `confirmar_asistencia.php` |
| Experiencias | `aplicacion/experiencias.html` | `consultaExperiencias.php` |

Hay tres cosas distintas que se pueden reservar, y conviene no confundirlas:

* **Menú del día** → `registrarReserva.php`. Un correo, una reserva por día.
* **Reservas** (menú + experiencia + fecha + personas) → `crear_evento.php`.
  Es la reserva de un evento completo: de 20 a 40 personas, mínimo 8 días de
  anticipación y un solo evento por día.
* **Mini eventos** → `confirmar_asistencia.php`. Son los "próximos eventos" del
  carrusel de la pantalla de eventos: experiencias bajo demanda a las que uno
  se apunta sin reservar el salón entero. Se toca la tarjeta, se escribe el
  correo y se confirma la asistencia. Un correo no se apunta dos veces al
  mismo evento.

Las **experiencias** de `experiencias.html` son otra cosa: son las catas que se
suman a la reserva de un evento, no mini eventos a los que uno asista.

Las tres reservas mandan un correo de confirmación a quien reservó, a través
del micro de Python `services/correo` del backend. Si ese micro está apagado la
reserva se guarda igual y la pantalla lo dice.

### Administrativas - detrás del login

Se entra por enlace directo a `aplicacion/login.html`. El login no está en el
nav del cliente a propósito. Después de entrar se muestra `dashboard.html`,
que es la misma pantalla para los dos roles y cambia según quién entró.

| Pantalla | Archivo | Quién | Micros |
|---|---|---|---|
| Login | `aplicacion/login.html` | - | `login.php` |
| Dashboard | `aplicacion/dashboard.html` | instructor y aprendiz | `listar_reservas_hoy.php`, `listar_eventos.php` |
| Reservas del día | `aplicacion/admin_reservas_dia.html` | instructor y aprendiz | `listar_reservas_hoy.php`, `actualizar_estado_reserva.php` |
| Agregar reserva | `aplicacion/admin_agregar_reserva.html` | instructor y aprendiz | `menu_dia.php`, `registrarReserva.php` |
| Reservas de eventos | `aplicacion/admin_reservas_eventos.html` | instructor y aprendiz | `consultaEvento.php`, `cancelar_evento.php` |
| **Eventos (CRUD)** | `aplicacion/admin_eventos.html` | sólo instructor | `consultaEvento.php`, `insertarEvento.php`, `actualizarEvento.php`, `eliminarEvento.php` |
| **Experiencias (CRUD)** | `aplicacion/admin_experiencias.html` | sólo instructor | `consultaExperiencia.php`, `insertarExperiencia.php`, `actualizarExperiencia.php`, `eliminarExperiencia.php` |

Sólo instructor (`rol_usuario` 1) y aprendiz (`rol_usuario` 2) pueden entrar;
lo decide `login.php`. El aprendiz ve las tarjetas del instructor apagadas, y
si escribe la URL a mano `exigirInstructor()` lo devuelve al dashboard.

## De dónde salió cada pantalla

| Origen | Qué se conservó |
|---|---|
| `remy_jose` | Es la base: hojas de estilo, login, flujo de reservas de tres pasos, calendario, layout del panel (era `instructor.html`, hoy `dashboard.html`) |
| `remy_trejos` | Diseño de eventos (cabezote, nav, tarjetas, carrusel) y el CRUD de eventos y experiencias |
| `remy_nelson` | Reservas del día del administrador (`reservas_dia` + `reservas_admin`, ahora una sola pantalla con el interruptor de entrega) y reservas de eventos con su ventana de cancelar |
| `remy_jojoa` | Menú del día y agregar reserva manual, con sus hojas `formato_menu.css` y `agregar_reserva.css` |

Los archivos viejos que ya no se usan (`aplicacion/instructor.html`,
`aplicacion/aprendiz.html`, `aplicacion/index.html`) quedaron como redirección
para que ningún enlace guardado se rompa.

## Los archivos de código

```
rm_codigos/
  config.js       URL del backend, roles, formato de pesos y fechas
  api.js          una función por cada micro; si cambia una ruta, se cambia aquí
  sesion.js       guarda al usuario en sessionStorage y protege las pantallas
  plantillas.js   cabezote y nav de las pantallas públicas
  panel.js        menú lateral del panel y el botón de tres puntos en móvil
  calendario.js   el calendario que ya existía, más la versión que se puede pulsar
  <pantalla>.js   la lógica de cada pantalla

  normalize.css
  formato_rm_clientes.css   pantallas públicas
  formato_rm_interno.css    login, dashboard y CRUD
  formato_menu.css          menú del día
  agregar_reserva.css       agregar reserva
```

`config.js` es lo único que hay que tocar para apuntar a otro servidor:

```js
const URL_BACKEND = 'http://localhost/Remy_V1/app/modulo_reservas/services/';
```

## Reservas repetidas

Era el problema principal: pulsar "Crear reserva" varias veces guardaba la
misma reserva varias veces. Quedó cerrado en tres puntos, del más cercano al
usuario al más lejano:

1. **En la pantalla** - mientras la petición está en el aire el botón queda
   deshabilitado (`enviando`), así que un doble clic no dispara dos peticiones.
2. **Al escribir el correo** - se consulta `consulta_reserva_dia.php` y se
   avisa antes de que la persona pulse.
3. **En el servidor** - `registrarReserva.php` responde **409** si el correo ya
   reservó hoy, y la base tiene el índice único
   `uq_reserva_correo_dia (correo_fk, fecha_reserva)` por si dos peticiones
   entran al mismo tiempo.

El mismo candado de un solo envío está en agregar reserva, en crear el evento
del cliente y en los dos CRUD.

## Responsive

Un solo criterio en todo el proyecto, el de la interfaz de eventos:

| Ancho | Qué pasa |
|---|---|
| móvil | una columna; barra azul con el título arriba, nav de pestañas abajo (público) y menú desplegable con el botón de tres puntos (panel) |
| 768px | la barra azul del título desaparece y el nav pasa a barra lateral azul de 200px, tanto en el cliente como en el panel; listados en dos columnas |
| 1020px | el contenido se ensancha |
| 1100px | listados en tres columnas |

La barra lateral es la misma en las dos mitades: 200px, fondo azul-dark,
icono más texto en cada opción y la opción activa en verde. En el panel el
nombre del usuario va al pie, donde el cliente tiene la firma de adso.

## Correos de confirmación

Los manda el micro de Python del backend (`services/correo`). Hay que
arrancarlo aparte y ponerle las credenciales del correo institucional:

```bat
cd C:\xampp\htdocs\Remy_V1\app\modulo_reservas\services\correo
pip install -r requirements.txt
set REMY_CORREO_REMITENTE=elcorreo@sena.edu.co
set REMY_CORREO_PASSWORD=laContraseñaDeEseCorreo
py app.py
```

Si no está corriendo, las reservas se siguen guardando: la pantalla avisa que
el correo de confirmación no salió, y nada más.
