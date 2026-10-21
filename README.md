# REMY en PHP

Aplicación modular con **Aprendices**, **Platos y menús** y **Reservas**. Las rutas de **Inventario** devuelven contenido vacío (HTTP 204). La base de datos MySQL existente se conserva. PHP sirve páginas y API desde `public/index.php`; las vistas y consultas permanecen fuera del directorio público.

## Conexion compartida

`app/Core/Database.php` centraliza la configuracion y conexion MySQL. Aprendices y Platos usan su conexion PDO; los endpoints heredados de Reservas usan el conector MySQLi del mismo archivo. Los modulos no mantienen archivos locales de credenciales o conexion.

## Estructura

```
app/Core/                      Configuración, PDO, JWT y respuestas
app/Modules/Aprendices/        Usuarios, Excel, eventos, liderazgo y dashboard
app/Modules/Platos/            Platos, recetas, menús y búsqueda
app/Modules/Reservas/          API PHP existente, sesión y confirmaciones por correo
app/Views/                     Plantillas convertidas de Jinja a PHP
public/index.php               Enrutador y punto de entrada
public/static/                 CSS, JS, fuentes e imágenes del navegador
public/modulo_reservas_php/assets/   Fotos de menús y experiencias
database/                      Esquema y migración heredados
storage/uploads/platos/        Fotos cargadas desde el editor
activadores/                   Un iniciador local por módulo funcional
```

## Instalación local

Sigue estos pasos desde la carpeta del proyecto (`C:\xampp\htdocs\Remy_Web`).

### 1. Inicia los servicios

En XAMPP, inicia **MySQL**. Comprueba que PHP sea la versión **8.2 o posterior** y que tenga activas las extensiones `pdo_mysql`, `mysqli`, `gd`, `mbstring` y `zip`.

También necesitas tener [Composer](https://getcomposer.org/) instalado.

### 2. Prepara la base de datos

La aplicación usa una base MySQL llamada `remy` por defecto. Puedes conectarla a la base existente del proyecto o crear una nueva. Antes de importar SQL, lee [database/README.md](database/README.md): sus archivos no se deben ejecutar a ciegas sobre una base que ya tenga datos.

### 3. Instala las dependencias de PHP

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
composer install
```

Composer instalará las librerías que necesita la aplicación y creará la carpeta `vendor/`.

### 4. Configura el acceso a MySQL

En esa misma ventana de PowerShell, define los datos de tu usuario MySQL y una clave privada para los tokens:

```powershell
$env:REMY_DB_HOST = "localhost"
$env:REMY_DB_PORT = "3306"
$env:REMY_DB_NAME = "remy"
$env:REMY_DB_USER = "tu_usuario_mysql"
$env:REMY_DB_PASSWORD = "tu_contraseña_mysql"
$env:REMY_SECRET_KEY = "escribe_aqui_una_clave_privada_larga"
```

Reemplaza `tu_usuario_mysql` y `tu_contraseña_mysql` por las credenciales reales. Si tu usuario no tiene contraseña, deja el valor así: `$env:REMY_DB_PASSWORD = ""`. Estas variables quedan disponibles en esa ventana; mantenla abierta para iniciar el servidor en el siguiente paso. El archivo `.env.example` sirve como referencia, pero la aplicación no lo carga automáticamente.

El correo SMTP es opcional. Para habilitarlo, configura también `REMY_CORREO_REMITENTE` y `REMY_CORREO_PASSWORD`. Sin esas variables, las reservas se guardan, pero no se envían correos de confirmación.

### 5. Inicia la aplicación

En la misma ventana de PowerShell, ejecuta:

```powershell
php -S 127.0.0.1:8000 -t public public/router.php
```

Abre [http://127.0.0.1:8000/](http://127.0.0.1:8000/) en el navegador. Deja la ventana abierta mientras uses la aplicación. Para detener el servidor, presiona `Ctrl+C`.

Si prefieres usar Apache de XAMPP, configura el sitio para que su directorio público apunte a `public/` y asegúrate de que Apache reciba las mismas variables de configuración.

## Activadores

Desde tres terminales independientes:

```
php activadores/aprendices.php     # http://127.0.0.1:8001/aprendices/
php activadores/platos.php         # http://127.0.0.1:8002/platos/
php activadores/reservas.php       # http://127.0.0.1:8003/reservas/
```

Cada archivo inicia, en un proceso PHP local, las páginas y operaciones del módulo correspondiente. Ya no hay varios puertos internos por servicio. Para navegar entre módulos usando los enlaces de la web, ejecutar la aplicación completa con Apache o el servidor unificado del paso 5.

## Compatibilidad del frontend

Se conservan `/aprendices/api/...`, `/platos/api/...`, `/platos/buscar`, `/reservas/aplicacion/*.html` y `/modulo_reservas_php/*.php`. Las vistas calculan `RAIZ` y la URL de la API de reservas según el montaje, de modo que JavaScript y backend usan el mismo origen. Los endpoints de reservas conservan sus nombres y respuestas; ahora residen en `app/Modules/Reservas/Endpoints` y pasan por el enrutador. Los archivos PHP de conexión no son accesibles como endpoints.

Aprendices mantiene JWT con vencimiento de 30 minutos y hashes bcrypt compatibles con los usuarios actuales. Reservas mantiene los dos roles del panel mediante sesión PHP y valida el rol en operaciones administrativas del servidor. Las rutas de inventario responden 204; el dashboard devuelve una lista vacía en `inventario_alerta`. Los ingredientes vinculados a recetas siguen en Platos, pues son necesarios para crear y consultar platos.

## Dependencias y límites de validación

`requirements.txt` enumera los componentes para el equipo; `composer.json` es el manifiesto instalable. PhpSpreadsheet procesa las cargas `.xls` y `.xlsx`; PHPMailer envía las confirmaciones SMTP desde PHP. No se incluye `vendor/` ni se almacena ninguna contraseña real.

Este paquete se preparó sin intérprete PHP, Composer ni servidor MySQL disponibles en el entorno de edición. Se verificaron referencias a recursos, estructura de rutas y sintaxis JavaScript, pero hay que ejecutar `composer install`, `php -l` sobre los archivos PHP y pruebas integradas con una copia de la base de datos antes de publicarlo.
