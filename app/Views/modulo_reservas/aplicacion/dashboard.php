<!DOCTYPE html>
<html lang="es">
<head>
    <script>const RAIZ = <?= json_encode(base_url(''), JSON_UNESCAPED_SLASHES) ?>; const URL_API_RESERVAS = <?= json_encode(base_url('/modulo_reservas_php/'), JSON_UNESCAPED_SLASHES) ?>; const ROLES = {instructor: 1, aprendiz: 2};</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel | REMY 1.0</title>
    <link rel="stylesheet" href="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/normalize.css'), ENT_QUOTES, 'UTF-8') ?>">
    <link rel="stylesheet" href="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/formato_rm_interno.css'), ENT_QUOTES, 'UTF-8') ?>">
    <script src="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/config.js'), ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/api.js'), ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/sesion.js'), ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/panel.js'), ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/dashboard.js'), ENT_QUOTES, 'UTF-8') ?>" defer></script>
</head>
<body>

    <main id="gran_padre_contenedor">

        
        <header id="cabezote_sesion" data-activo="inicio"></header>

        <section id="contenido_sesion">

            <div id="bienvenida_panel">
                <h2 class="letra-azul-dark">Hola, <span id="saludo_nombre"></span></h2>
                <p id="saludo_fecha"></p>
            </div>

            
            <div id="resumenes_superior">
                <div class="tarjeta_resumen">
                    <strong id="cifra_reservas">-</strong>
                    <span>Reservas de hoy</span>
                </div>
                <div class="tarjeta_resumen">
                    <strong id="cifra_menus">-</strong>
                    <span>Menús pedidos</span>
                </div>
                <div class="tarjeta_resumen">
                    <strong id="cifra_pendientes">-</strong>
                    <span>Por entregar</span>
                </div>
                <div class="tarjeta_resumen">
                    <strong id="cifra_eventos">-</strong>
                    <span>Eventos activos</span>
                </div>
            </div>

            
            <div id="modulos_panel"></div>

        </section>

    </main>

</body>
</html>
