<?php
declare(strict_types=1);
namespace Remy\Modules\Reservas;

use PHPMailer\PHPMailer\PHPMailer;

final class Correo {
    public static function confirmar(string $type, string $address, array $data): array {
        $titles = ['menu_dia' => 'Reserva del menú del día confirmada', 'evento' => 'Reserva de evento recibida', 'asistencia' => 'Asistencia confirmada'];
        $messages = ['menu_dia' => 'Tu reserva del menú del día quedó registrada.', 'evento' => 'Recibimos tu solicitud de evento. Queda pendiente de revisión.', 'asistencia' => 'Tu asistencia quedó confirmada. Te esperamos.'];
        if (!isset($titles[$type])) return ['enviado' => false, 'mensaje' => 'Tipo de confirmación desconocido'];
        if (!filter_var($address, FILTER_VALIDATE_EMAIL)) return ['enviado' => false, 'mensaje' => 'Correo inválido'];
        if (!class_exists(PHPMailer::class)) return ['enviado' => false, 'mensaje' => 'Instale las dependencias de Composer.'];
        $sender = \env_value('REMY_CORREO_REMITENTE');
        $password = \env_value('REMY_CORREO_PASSWORD');
        if ($sender === '' || $password === '') return ['enviado' => false, 'mensaje' => 'Faltan credenciales SMTP.'];
        $fields = match ($type) {
            'menu_dia' => ['Número de reserva' => $data['reserva'] ?? '-', 'Menú' => $data['menu'] ?? '-', 'Cantidad' => $data['cantidad'] ?? 1, 'Fecha' => $data['fecha'] ?? '-', 'Total' => '$' . ($data['total'] ?? 0)],
            'evento' => ['Número de evento' => $data['evento'] ?? '-', 'Experiencia' => $data['experiencia'] ?? '-', 'Fecha' => $data['fecha'] ?? '-', 'Franja' => $data['franja'] ?? '-', 'Personas' => $data['personas'] ?? '-', 'Total' => '$' . ($data['total'] ?? 0)],
            'asistencia' => ['Evento' => $data['experiencia'] ?? '-', 'Fecha' => $data['fecha'] ?? '-', 'Franja' => $data['franja'] ?? '-', 'Valor' => '$' . ($data['precio'] ?? 0) . ' por persona'],
        };
        $rows = '';
        foreach ($fields as $label => $value) $rows .= '<tr><td style="padding:10px;color:#667085">' . htmlspecialchars((string)$label) . '</td><td style="padding:10px;color:#123047;font-weight:bold">' . htmlspecialchars((string)$value) . '</td></tr>';
        $html = '<div style="font-family:Arial;color:#123047;max-width:560px;margin:auto"><div style="background:#00304d;color:#fff;padding:24px;border-bottom:5px solid #39a900"><b>REMY</b><br>SENA Centro Agropecuario de Buga</div><div style="padding:24px"><h1>' . htmlspecialchars($titles[$type]) . '</h1><p>' . htmlspecialchars($messages[$type]) . '</p><table>' . $rows . '</table><p>Gracias por elegir REMY.</p></div></div>';
        $plain = $titles[$type] . "\n\n" . $messages[$type] . "\n\n";
        foreach ($fields as $label => $value) $plain .= "$label: $value\n";
        try {
            $port = (int)\env_value('REMY_SMTP_PORT', '587');
            // ssl = conexión cifrada desde el inicio (puerto 465); starttls = 587.
            $security = strtolower(\env_value('REMY_SMTP_SEGURIDAD', $port === 465 ? 'ssl' : 'starttls'));
            $mailer = new PHPMailer(true);
            $mailer->isSMTP();
            $mailer->Host = \env_value('REMY_SMTP_HOST', 'smtp.gmail.com');
            $mailer->Port = $port;
            $mailer->SMTPAuth = true;
            $mailer->SMTPSecure = in_array($security, ['ssl', 'smtps'], true) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mailer->Username = $sender;
            $mailer->Password = $password;
            $mailer->Timeout = 10;
            $mailer->CharSet = 'UTF-8';
            $mailer->setFrom($sender, \env_value('REMY_CORREO_NOMBRE', 'REMY'));
            $replyTo = \env_value('REMY_CORREO_RESPUESTA');
            if ($replyTo !== '') $mailer->addReplyTo($replyTo);
            $mailer->addAddress($address);
            $mailer->Subject = 'REMY · ' . $titles[$type];
            $mailer->Body = $html;
            $mailer->AltBody = $plain;
            $mailer->isHTML(true);
            $mailer->send();
            return ['enviado' => true, 'mensaje' => 'Correo enviado.'];
        } catch (\Throwable $e) {
            error_log('Correo REMY: ' . $e->getMessage());
            return ['enviado' => false, 'mensaje' => 'No se pudo enviar el correo.'];
        }
    }
}
