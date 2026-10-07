# REMY · Proyecto Android unificado

Un solo proyecto Android que reúne los cuatro que antes vivían por separado en
`remy_android/juntado/`. Se conservó **la estructura del proyecto REMY**
(paquete `com.jmba.remy`, carpetas `conexion/`, `model/`, `navegation/`,
`view/`, `ui/theme/` y `MainActivity` con `NavigationSuiteScaffold`).

Los cuatro proyectos originales siguen intactos en `remy_android/juntado/`
por si hace falta consultarlos.

## De dónde viene cada cosa

| Proyecto original | Paquete original | Dónde quedó ahora |
|---|---|---|
| `REMY` | `com.jmba.remy` | `view/reservas/` + `navegation/NavigationReservas.kt` |
| `CrudCompose` | `com.sg.crudcompose` | `view/admin_evento/`, `view/cliente_evento/`, `view/experiencia/` + `navegation/NavegationEvento.kt` |
| `EventosReservas` | `com.sp.eventosreservas` | `view/operacion/` + `navegation/NavegationOperacion.kt` |
| `menu` | `com.jf.menu` | `view/menu/` |

## Estructura

```
com/jmba/remy/
├── MainActivity.kt                 · scaffold con las 6 pestañas
├── conexion/ConexionService.kt     · UNA sola interfaz Retrofit
├── model/                          · todos los modelos
├── navegation/                     · un NavHost por módulo
│   ├── NavigationReservas.kt
│   ├── NavegationEvento.kt
│   └── NavegationOperacion.kt
├── ui/theme/                       · REMYTheme (único tema)
└── view/
    ├── reservas/                   · flujo de reserva del cliente
    ├── menu/                       · menú del día, programación, agregar reserva
    ├── admin_evento/               · CRUD de eventos
    ├── cliente_evento/             · eventos vistos por el cliente
    ├── experiencia/                · CRUD de experiencias
    └── operacion/                  · reservas del día, aprendiz, eventos
```

## Pestañas de `MainActivity`

| Pestaña | Pantalla | Viene de |
|---|---|---|
| Menú del día | `MenuScreen` | menu |
| Reservas | `NavegationReservas` | REMY |
| Eventos | `NavegationEvento` | CrudCompose |
| Programación | `view/menu/ReservasScreen` | menu |
| Agregar | `AgregarReservaScreen` | menu |
| Operación | `NavegationOperacion` | EventosReservas |

Los tres proyectos que no eran REMY no tenían una pestaña propia: `menu` tenía
sus propias tres pestañas y los otros dos arrancaban directo en su pantalla.
Al unificar se conservaron todas como destinos del mismo scaffold, para no
perder ninguna pantalla ni cambiar la navegación interna de cada módulo.

## Renombres hechos para evitar choques de nombres

Cuatro proyectos tenían clases con el mismo nombre. Se conservó siempre el
nombre del proyecto REMY y se renombraron los demás:

| Original | Proyecto | Ahora |
|---|---|---|
| `ModelEvento` | CrudCompose | `ModelEventoAdmin` |
| `ModelEvento` | EventosReservas | `ModelEventoOperacion` |
| `ModelEvento` | menu | `ModelEventoDia` |
| `ModelExperiencia` | CrudCompose | `ModelExperienciaAdmin` |
| `ModelMenu` | menu | `ModelMenuDia` |
| `actualizarEvento()` | EventosReservas | `actualizarEventoOperacion()` |
| `R.drawable.ic_atras` | CrudCompose / EventosReservas / menu | `ic_atras_admin` / `ic_atras_operacion` / `ic_atras_menu` |
| `R.string.titulo` | EventosReservas | `titulo_aprendiz` |
| `R.string.total` | EventosReservas | `total_operacion` |
| `CrudComposeTheme`, `EventosReservasTheme`, `MenuTheme` | - | `REMYTheme` |

Las pantallas y ViewModels con nombre repetido (`ReservasScreen`,
`ReservasViewModel`, `EventoViewModel`, `ReservaEventoScreen`…) **no** se
renombraron: quedaron en paquetes distintos, que ya los distingue.

## Otros ajustes

* `minSdk` baja de 35 a 24 (era el de los otros tres proyectos).
* Se añaden al `build.gradle.kts` las dependencias que traían los otros
  proyectos: `lifecycle-viewmodel-compose`, `lifecycle-runtime-compose` y
  `compose.material` (para `pullRefresh`).
* `AndroidManifest.xml` añade `usesCleartextTraffic="true"` (lo tenían los
  otros tres) además del `network_security_config` que ya traía REMY.
* Los colores propios del módulo de Operación (`AzulOscuro`, `NaranjaBoton`…)
  se movieron a `ui/theme/Color.kt`.

## Backend

Las cuatro URLs distintas se unificaron en una sola, en `ConexionService`:

```kotlin
var url = "http://10.0.2.2/remy_backend/"      // emulador
val urlImagenes        = url + "img_menu/"      // fotos de menús/platos
val urlImgExperiencias = url + "img_exp/"       // fotos de experiencias
```

Desde un celular físico hay que cambiar `10.0.2.2` por la IP del PC.
El backend y la base están en `C:/xampp/htdocs/remy_backend/` (ver su README).

## Corrección aplicada

`DetalleReservaEventoViewModel.cancelar()` llamaba a `actualizarEstadoReserva()`,
que apunta a `actualizar_estado_reserva.php` y actualiza la tabla `reservas_dia`
buscando por `id_reserva` - pero le llegaba un **id de evento**, así que la
cancelación nunca surtía efecto (0 filas afectadas). Ahora usa el endpoint
`cancelar_evento.php`, que sí actualiza `eventos.estado`.

* `ConexionService` gana `cancelarEvento(id_evento, estado)`.
* El estado que se guarda pasa a ser `"cancelado"` en minúscula, igual que el
  resto de la base y que el filtro de `consulta_cupo.php`.
* `actualizarEstadoReserva()` se mantiene: lo sigue usando
  `ReservasAprendizViewModel`, donde sí corresponde (reservas del día).

Verificado contra el backend: el evento queda en `cancelado`, desaparece de
`listar_eventos.php` (que filtra `estado = 'activo'`) y su día vuelve a quedar
disponible en `consulta_cupo.php`.

## Textos y soporte de idiomas

Ningún texto visible queda escrito en el código: los ~180 literales que traían
los cuatro proyectos se movieron a `res/values/strings.xml` (227 cadenas) y
`res/values/plurals.xml` (5 plurales). Para traducir la app solo hay que crear
`res/values-en/strings.xml` (o el idioma que sea) y copiar allí las claves.

Reglas que se siguieron:

* **Valores vs. etiquetas.** Los textos que además se comparan contra datos del
  backend (filtros `Café` / `Vino` / `Queso`, jornadas `Mañana` / `Tarde` /
  `Noche`, estados `entregada` / `pendiente`, franjas horarias) siguen siendo
  literales en el código, porque la base guarda esas palabras. Lo que se
  traduce es la etiqueta que ve el usuario: en `EventoScreen` hay tablas
  `OPCIONES_TIPO`, `OPCIONES_FRANJA` y `OPCIONES_CUPOS` con pares
  *valor → recurso*, y `etiquetaFiltro()` resuelve la etiqueta.
* **Cantidades.** Lo que antes se armaba a mano (`"menú" + if (n > 1) "s"`)
  ahora usa `<plurals>` y `pluralStringResource()`, para que cada idioma aplique
  sus propias reglas.
* **Formatos con argumentos.** Precios, totales y detalles usan `%1$s` / `%1$d`
  en lugar de interpolación, para que el orden de las palabras se pueda cambiar
  al traducir (por ejemplo `formato_precio`, `op_detalle_total`).
* **Fechas.** Los patrones que llevaban palabras en español (`dd 'de' MMMM
  yyyy`) pasaron a ser recursos (`formato_fecha_larga`, `formato_fecha_completa`)
  y el `Locale` fijo `es-CO` / `es-ES` se cambió por `Locale.getDefault()`, para
  que los nombres de mes sigan el idioma del dispositivo.
* **Textos de error.** Los que salen de un ViewModel se resuelven con
  `context.getString(...)`; los ViewModels reciben el `Context` de forma
  transitoria, igual que ya lo hacía el módulo de Menú del día.

Lo que **no** se llevó a recursos, a propósito: mensajes de `Log`, nombres de
rutas de navegación, claves JSON, nombres de archivos de imagen y patrones
puramente numéricos (`yyyy-MM-dd`, `h:mm`, `%,d`).
