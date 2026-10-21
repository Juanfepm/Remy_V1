# REMY en PHP

Aplicación modular con **Aprendices**, **Platos y menús** y **Reservas**. Las rutas de **Inventario** devuelven contenido vacío (HTTP 204). La base de datos MySQL existente se conserva. PHP sirve páginas y API desde `public/index.php`; las vistas y consultas permanecen fuera del directorio público.

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

1. Instalar **PHP 8.2 o posterior**, Composer, MySQL y las extensiones que aparecen en `requirements.txt`. En XAMPP, comprobar que esa versión y extensiones estén activas.
2. Desde la carpeta del proyecto, ejecutar `composer install`.
3. Definir `REMY_DB_USER`, `REMY_DB_PASSWORD`, `REMY_DB_NAME`, `REMY_SECRET_KEY` y, para correo, `REMY_CORREO_REMITENTE` y `REMY_CORREO_PASSWORD` como variables del proceso PHP o directivas privadas `SetEnv` de Apache. `.env.example` es una lista de variables, **no se carga automáticamente**. Si no hay correo SMTP, las reservas se guardan, pero la respuesta indica que el correo no se envió.
4. Configurar el DocumentRoot o alias de Apache a la carpeta `public/`, activar `mod_rewrite` y permitir `.htaccess`. El proyecto funciona bajo una subruta, por ejemplo `/remy/`, si el alias apunta a `public/`. La ruta raíz se detecta desde PHP; `REMY_BASE_PATH` puede fijarse si el servidor no la comunica correctamente.
5. Para desarrollo sin Apache, ejecutar `php -S 127.0.0.1:8000 -t public public/router.php` y abrir `http://127.0.0.1:8000/`.

**Base de datos:** revisar `database/README.md` antes de importar los archivos SQL. No ejecutar un script de creación encima de una base con datos existentes sin validación y respaldo.

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
