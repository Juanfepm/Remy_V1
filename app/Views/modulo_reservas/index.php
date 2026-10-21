<!DOCTYPE html>
<html lang="es">
<head>
    <script>const RAIZ = <?= json_encode(base_url(''), JSON_UNESCAPED_SLASHES) ?>; const URL_API_RESERVAS = <?= json_encode(base_url('/modulo_reservas_php/'), JSON_UNESCAPED_SLASHES) ?>; const ROLES = {instructor: 1, aprendiz: 2};</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REMY 1.0</title>
    
    <meta http-equiv="refresh" content="0; url=aplicacion/menu_dia.html">
    <link rel="stylesheet" href="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/normalize.css'), ENT_QUOTES, 'UTF-8') ?>">
    <link rel="stylesheet" href="<?= htmlspecialchars(base_url('/static/modulo_reservas/rm_codigos/formato_rm_clientes.css'), ENT_QUOTES, 'UTF-8') ?>">
</head>
<body>
    <p class="aviso aviso-cargando">
        Abriendo REMY... Si no pasa nada,
        <a href="aplicacion/menu_dia.html" class="letra-verde" style="display:inline">entra al menú del día</a>.
    </p>
</body>
</html>
