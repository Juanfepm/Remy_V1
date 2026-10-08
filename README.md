# REMY

Una sola aplicación Flask con los cuatro módulos. La API de reservas sigue
en PHP (`modulo_reservas_php/`).

| Módulo | URL | Código |
|---|---|---|
| Aprendices (usuarios, carga masiva, liderazgo, dashboard) | `/aprendices/` · API en `/aprendices/api/` | `app/modulo_aprendices` |
| Inventario (insumos, entradas, salidas) | `/inventario/` · API en `/inventario/api/` | `app/modulo_inventario` |
| Platos y menús | `/platos/` · API en `/platos/api/` | `app/modulo_platos` |
| Reservas (web) | `/reservas/` | `app/modulo_reservas` + API PHP en `modulo_reservas_php/` |

`/` redirige a la web pública de reservas.

## Estructura

```
run.py                 arranque local
passenger_wsgi.py      arranque en el servidor (WSGI)
.env.ejemplo           variables de entorno (copiar como .env)
app/
  __init__.py          create_app(): registra los cuatro blueprints
  config.py            configuración (lee .env / variables de entorno)
  db.py                conexión MySQL compartida
  templates/comun/     fragmentos compartidos (raiz.html)
  templates/<modulo>/  páginas de cada módulo
  static/<modulo>/     css, js e imágenes de cada módulo
  modulo_*/            blueprint y lógica de cada módulo
modulo_reservas_php/   API PHP de reservas
```

Ya no hay microservicios ni puertos sueltos: lo que antes eran el gateway
(5101), los servicios de aprendices (5103-5107) y los de platos/menús
(5084/5085) ahora son rutas de la misma app.

## Arranque local

```bash
python -m venv entorno
entorno\Scripts\activate          # Windows  (macOS/Linux: source entorno/bin/activate)
pip install -r requirements.txt
copy .env.ejemplo .env            # y completar los datos de la base
python run.py
```

Abrir `http://127.0.0.1:5000/`.

## Reglas para no romper el despliegue

La app se publica en una subcarpeta (`https://arcano.digital/remy`), así que
**ninguna ruta puede empezar por `/` a secas**:

* En los templates: `{{ url_for('static', filename='modulo_x/archivo.css') }}`
  para estáticos y `{{ url_for('modulo.vista') }}` para enlaces.
* En el JS: cada página incluye `{% include "comun/raiz.html" %}` al inicio
  del `<head>`, que define `RAIZ` (la subcarpeta, vacía en local) y
  `URL_API_RESERVAS`. Usar `RAIZ + '/platos/api/...'`, nunca `'/api/...'`.
* SQL: nombres de tabla en minúscula (`platos`, no `Platos`). En el servidor
  (Linux) MySQL distingue mayúsculas.
* La base de datos del servidor no se modifica: el código se adapta a ella.
* Roles: **1 = instructor, 2 = aprendiz** en todos los módulos. En Python se
  usan las constantes de `app/roles.py`; en el JS, `ROLES.instructor` y
  `ROLES.aprendiz` (los inyecta `comun/raiz.html`); en PHP, las constantes de
  `login.php`. Nunca escribir el número a mano.
* Credenciales sólo en `.env` o en variables de entorno, nunca en Git.

## Despliegue

1. Subir el proyecto (sin `entorno/`, `.env` ni `__pycache__/`).
2. En el servidor, crear el `.env` con los datos reales de la base
   (`REMY_DB_USER`, `REMY_DB_PASSWORD`, `REMY_DB_NAME`) y una
   `REMY_SECRET_KEY` propia.
3. Instalar dependencias: `pip install -r requirements.txt`.
4. Apuntar la aplicación Python del servidor a `passenger_wsgi.py`
   (objeto `application`) con la URL `/remy`.
5. Publicar `modulo_reservas_php/` en una ruta servida por PHP y poner esa
   URL en `REMY_URL_API_RESERVAS`.
