import smtplib
from html import escape
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from conexion import *


class Correo:

    def envia_mensaje(self, email, asunto, cuerpo, cuerpo_html):
        remitente = REMITENTE
        destinatario = email

        mensaje = MIMEMultipart('related')
        mensaje['From'] = remitente
        mensaje['To'] = destinatario
        mensaje['Subject'] = asunto

        alternativas = MIMEMultipart('alternative')
        alternativas.attach(MIMEText(cuerpo, 'plain', 'utf-8'))
        alternativas.attach(MIMEText(cuerpo_html, 'html', 'utf-8'))
        mensaje.attach(alternativas)

        nombre_usuario = remitente
        password = PASSWORD

        try:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20)
            server.starttls()
            server.login(nombre_usuario, password)
            server.sendmail(remitente, destinatario, mensaje.as_string())
            server.quit()
            return True, ""
        except Exception as error:
            return False, str(error)

    def confirmar(self, tipo, email, datos):
        if not hay_credenciales():
            return False, falta_configuracion()

        armadores = {
            "menu_dia": self._texto_menu_dia,
            "evento": self._texto_evento,
            "asistencia": self._texto_asistencia
        }

        if tipo not in armadores:
            return False, "Tipo de confirmación desconocido: " + str(tipo)

        asunto, cuerpo = armadores[tipo](datos)
        cuerpo_html = self._plantilla_html(tipo, datos)
        return self.envia_mensaje(email, asunto, cuerpo, cuerpo_html)

    def _plantilla_html(self, tipo, datos):
        titulos = {
            'menu_dia': 'Reserva del menú del día confirmada',
            'evento': 'Reserva de evento recibida',
            'asistencia': 'Asistencia confirmada'
        }
        textos = {
            'menu_dia': 'Tu reserva del menú del día quedó registrada.',
            'evento': 'Recibimos tu solicitud de evento. Queda pendiente de revisión.',
            'asistencia': 'Tu asistencia quedó confirmada. Te esperamos.'
        }
        datos_html = {
            'menu_dia': [('Número de reserva', datos.get('reserva', '-')), ('Menú', datos.get('menu', 'Menú del día')), ('Cantidad', str(datos.get('cantidad', 1)) + ' menú(s)'), ('Fecha', datos.get('fecha', '-')), ('Total', '$' + str(datos.get('total', 0)))],
            'evento': [('Número de evento', datos.get('evento', '-')), ('Experiencia', datos.get('experiencia', '-')), ('Fecha', datos.get('fecha', '-')), ('Franja', datos.get('franja', '-')), ('Personas', datos.get('personas', '-')), ('Total', '$' + str(datos.get('total', 0)))],
            'asistencia': [('Evento', datos.get('experiencia', '-')), ('Fecha', datos.get('fecha', '-')), ('Franja', datos.get('franja', '-')), ('Valor', '$' + str(datos.get('precio', 0)) + ' por persona')]
        }
        filas = ''.join(
            '<tr><td style="padding:10px 0;color:#667085">{}</td><td style="padding:10px 0;text-align:right;color:#123047;font-weight:bold">{}</td></tr>'.format(escape(str(etiqueta)), escape(str(valor)))
            for etiqueta, valor in datos_html[tipo]
        )
        return (
            '<!doctype html><html><body style="margin:0;background:#f4f7f5;font-family:Arial,sans-serif;color:#123047">'
            '<div style="padding:24px 12px"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden">'
            '<div style="background:#00304d;padding:24px 28px;border-bottom:5px solid #39a900">'
            '<div style="color:#8bd100;font-size:25px;font-weight:bold;letter-spacing:2px">REMY</div>'
            '<div style="margin-top:8px;color:#fff;font-size:13px">SENA Centro Agropecuario de Buga</div></div>'
            '<div style="padding:28px"><div style="display:inline-block;padding:7px 12px;background:#e9f7df;color:#267a00;border-radius:20px;font-size:12px;font-weight:bold">CONFIRMACIÓN REMY</div>'
            '<h1 style="margin:18px 0 10px;font-size:25px">{}</h1><p style="color:#475467;font-size:16px;line-height:1.5">{}</p>'
            '<table width="100%" style="border-collapse:collapse;border-top:1px solid #e4e9e5;border-bottom:1px solid #e4e9e5">{}</table>'
            '<p style="margin-top:24px;color:#667085;font-size:14px;line-height:1.5">Gracias por elegir REMY. Este mensaje fue generado automáticamente.</p></div>'
            '</div></div></body></html>'
        ).format(escape(titulos[tipo]), escape(textos[tipo]), filas)


    def _texto_menu_dia(self, datos):
        asunto = "REMY · Reserva del menú del día confirmada"
        cuerpo = (
            "Hola,\n\n"
            "Tu reserva del menú del día quedó registrada.\n\n"
            "  Número de reserva : {reserva}\n"
            "  Menú              : {menu}\n"
            "  Cantidad          : {cantidad} menú(s)\n"
            "  Fecha             : {fecha}\n"
            "  Total             : ${total}\n\n"
            "Recuerda que sólo puedes tener una reserva por día. Preséntate en "
            "el punto de servicio en el horario del menú.\n\n"
            "REMY · SENA Centro Agropecuario de Buga"
        ).format(
            reserva=datos.get("reserva", "-"),
            menu=datos.get("menu", "Menú del día"),
            cantidad=datos.get("cantidad", 1),
            fecha=datos.get("fecha", "-"),
            total=datos.get("total", 0)
        )
        return asunto, cuerpo

    def _texto_evento(self, datos):
        asunto = "REMY · Reserva de evento recibida"
        cuerpo = (
            "Hola,\n\n"
            "Recibimos tu solicitud de evento. Queda en estado PENDIENTE "
            "mientras el instructor la revisa.\n\n"
            "  Número de evento : {evento}\n"
            "  Experiencia      : {experiencia}\n"
            "  Fecha            : {fecha}\n"
            "  Franja           : {franja}\n"
            "  Personas         : {personas}\n"
            "  Total            : ${total}\n\n"
            "Te avisamos por este mismo correo cuando quede confirmado.\n\n"
            "REMY · SENA Centro Agropecuario de Buga"
        ).format(
            evento=datos.get("evento", "-"),
            experiencia=datos.get("experiencia", "-"),
            fecha=datos.get("fecha", "-"),
            franja=datos.get("franja", "-"),
            personas=datos.get("personas", "-"),
            total=datos.get("total", 0)
        )
        return asunto, cuerpo

    def _texto_asistencia(self, datos):
        asunto = "REMY · Asistencia confirmada"
        cuerpo = (
            "Hola,\n\n"
            "Tu asistencia quedó confirmada.\n\n"
            "  Evento   : {experiencia}\n"
            "  Fecha    : {fecha}\n"
            "  Franja   : {franja}\n"
            "  Valor    : ${precio} por persona\n\n"
            "Te esperamos. Si no puedes asistir, avísanos para liberar el cupo.\n\n"
            "REMY · SENA Centro Agropecuario de Buga"
        ).format(
            experiencia=datos.get("experiencia", "-"),
            fecha=datos.get("fecha", "-"),
            franja=datos.get("franja", "-"),
            precio=datos.get("precio", 0)
        )
        return asunto, cuerpo


mi_correo = Correo()
