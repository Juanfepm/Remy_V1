# REMY · Micro de correo

Manda el correo de confirmación a quien reserva. Está en Python porque el envío
ya estaba resuelto así en el proyecto (`smtplib` + `MIMEMultipart` sobre SMTP
con STARTTLS), y sigue la misma forma que los otros servicios (`services/eventos`,
`services/reservas_dia`, ...): Flask + Flask-RESTful, `conexion.py` con la
configuración y `app.py` con el Resource.

## Qué confirma

| tipo | cuándo | quién lo llama |
|---|---|---|
| `menu_dia` | alguien reserva el menú del día | `registrarReserva.php` |
| `evento` | alguien reserva un evento (20 a 40 personas) | `crear_evento.php` |
| `asistencia` | alguien confirma su asistencia a un mini evento | `confirmar_asistencia.php` |

## Puesta en marcha

```bash
cd C:\xampp\htdocs\Remy_V1\app\modulo_reservas\services\correo
pip install -r requirements.txt
```

Las credenciales **no van en el código**: se guardan en `.env`, excluido de
Git, y `conexion.py` las lee del entorno sin valores por defecto. Si faltan, el
micro arranca igual pero responde `"configurado": false` y no intenta enviar
nada.

La forma cómoda es crear `.env` desde la plantilla y completar las credenciales:

```bash
cp .env.ejemplo .env
cp arrancar.sh.ejemplo arrancar.sh
chmod +x arrancar.sh
./arrancar.sh
```

No compartas ni subas `.env`; el lanzador lo carga antes de iniciar el servicio.

A mano, sin la plantilla:

```bash
export REMY_CORREO_REMITENTE=elcorreo@gmail.com
export REMY_CORREO_PASSWORD=laContraseñaDeAplicacion
./.venv/bin/python app.py
```

Queda escuchando en `http://localhost:5090`.

Para comprobar que quedó bien configurado:

```bash
curl http://localhost:5090/correo
```

Debe responder `"configurado": true`. Si responde `false`, faltan las
variables de entorno.

### Otras variables

| Variable | Por defecto | Para qué |
|---|---|---|
| `REMY_SMTP_HOST` | `smtp.gmail.com` | servidor de salida |
| `REMY_SMTP_PORT` | `587` | puerto STARTTLS |
| `REMY_CORREO_PUERTO` | `5090` | puerto del micro |

## Cómo lo llaman los .php

`notificar_correo.php` es el puente. Siempre se llama **después** de guardar,
con un tiempo de espera corto, y su resultado viaja aparte en la respuesta
(`correoEnviado` / `correoDetalle`). Si este servicio está apagado, la reserva
se guarda igual y la pantalla avisa que el correo no salió; nunca se pierde una
reserva por un problema de correo.

```
POST /correo
{
  "tipo": "menu_dia",
  "correo": "alguien@soy.sena.edu.co",
  "datos": { "reserva": 12, "menu": "Menú Ejecutivo", "cantidad": 2,
             "fecha": "2026-09-08", "total": 70000 }
}
```

## Archivos

```
conexion.py   configuración (SMTP y credenciales del entorno)
correo.py     el modelo: envia_mensaje() y los textos de cada tipo
app.py        el Resource de Flask-RESTful y el arranque
```
