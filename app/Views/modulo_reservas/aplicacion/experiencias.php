<!DOCTYPE html>
<html lang="es">
<head>
    <script>const RAIZ = <?= json_encode(base_url(''), JSON_UNESCAPED_SLASHES) ?>; const URL_API_RESERVAS = <?= json_encode(base_url('/modulo_reservas_php/'), JSON_UNESCAPED_SLASHES) ?>; const ROLES = {instructor: 1, aprendiz: 2};</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Experiencias | REMY 1.0</title>
    <link rel="stylesheet" href="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/normalize.css'), ENT_QUOTES, 'UTF-8') ?>">
    <link rel="stylesheet" href="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/formato_rm_clientes.css'), ENT_QUOTES, 'UTF-8') ?>">
    <script src="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/config.js'), ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/api.js'), ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/plantillas.js'), ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/experiencias.js'), ENT_QUOTES, 'UTF-8') ?>" defer></script>
</head>
<body id="cuerpo_eventos">

    <header id="cabezote_titulo" class="fondo-azul" data-titulo="Experiencias" data-atras="eventos.html"></header>

    <main id="contenido_eventos">

        <div class="cont-busqueda">
            <input type="text" id="buscar_experiencia" class="input-busqueda" placeholder="Buscar experiencia...">
            <svg class="icono-filtro" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
        </div>

        <div class="seccion-hoy-titulo">
            <span class="punto-v"></span>
            Nuestras experiencias
        </div>

        <p id="aviso_experiencias" class="aviso aviso-cargando">Cargando experiencias...</p>

        
        <div id="lista_experiencias_pub" class="carrusel"></div>

    </main>

    <nav id="tabs_inferior" data-activo="eventos"></nav>

</body>
</html>
