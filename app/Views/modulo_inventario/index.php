<?php
$origen = (string)($_GET['from'] ?? '');
[$rutaVolver, $textoVolver] = match ($origen) {
    'platos' => ['/platos/', 'Volver a Platos'],
    'aprendices' => ['/aprendices/dashboard', 'Panel Instructor'],
    default => ['/platos/', 'Volver a Platos'],
};
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <script>const RAIZ = <?= json_encode(base_url(''), JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) ?>; const RUTAS_INVENTARIO = {api: <?= json_encode(base_url('/inventario/api'), JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) ?>};</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Ingredientes e Inventario | REMY 1.0</title>

    <link rel="stylesheet" href="<?= htmlspecialchars(base_url('/static/modulo_inventario/ingredientes.css'), ENT_QUOTES, 'UTF-8') ?>">
    <script src="<?= htmlspecialchars(base_url('/static/modulo_inventario/ingredientes.js'), ENT_QUOTES, 'UTF-8') ?>" defer></script>
</head>
<body id="cuerpo_ingredientes">

    <!-- CABEZOTE INSTITUCIONAL REMY / SENA -->
    <header id="cabezote_modulo">
        <div class="contenedor-cabezote">
            <div id="cont_marcas">
                <figure id="marca_sena">
                    <img src="<?= htmlspecialchars(base_url('/static/img/simbolo_sena_verde.svg'), ENT_QUOTES, 'UTF-8') ?>" alt="SENA">
                </figure>
                <div id="linea_vert"></div>
                <figure id="marca_remy">
                    <img src="<?= htmlspecialchars(base_url('/static/img/remy_green.svg'), ENT_QUOTES, 'UTF-8') ?>" alt="REMY">
                </figure>
            </div>

            <div class="titulo-modulo">
                <h1>Módulo de Ingredientes</h1>
                <p>Inventario y Alertas Tempranas de Stock &bull; REMY 1.0 &bull; SENA CAB</p>
            </div>

            <div class="acciones-cabezote">
                <a href="<?= htmlspecialchars(base_url($rutaVolver), ENT_QUOTES, 'UTF-8') ?>" class="btn-cabezote" title="Volver al módulo de origen">
                    <svg viewBox="0 0 256 256" fill="currentColor">
                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/>
                    </svg>
                    <span><?= htmlspecialchars($textoVolver, ENT_QUOTES, 'UTF-8') ?></span>
                </a>
                <button type="button" id="btn_recargar" class="btn-cabezote" title="Recargar datos">
                    <svg viewBox="0 0 256 256" fill="currentColor">
                        <path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.6A79.54,79.54,0,0,0,128,208a80,80,0,1,0-78.72-96H80a8,8,0,0,1,0,16H32a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0V93.38A96,96,0,0,1,224,128Z"/>
                    </svg>
                    <span>Actualizar</span>
                </button>
            </div>
        </div>
    </header>

    <main id="contenedor_principal">

        <!-- DASHBOARD DE MÉTRICAS (KPIs) -->
        <section id="seccion_kpis" aria-label="Métricas de Inventario">
            <article class="tarjeta-kpi" id="kpi_total">
                <div class="icono-kpi fondo-azul letra-blanca">
                    <svg viewBox="0 0 490 490" fill="currentColor">
                        <path d="M477.6,48l-42.4,30.9v303.9H0v21h35.9c-2.7,5.2-4.2,11.2-4.2,17.4c0,21.2,17.3,38.5,38.5,38.5s38.4-17.3,38.4-38.5c0-6.3-1.5-12.2-4.2-17.4h236.8c-2.7,5.2-4.2,11.2-4.2,17.4c0,21.2,17.3,38.5,38.5,38.5s38.5-17.3,38.5-38.5c0-6.3-1.5-12.2-4.2-17.4h46.4V89.6L490,65L477.6,48z M87.6,421.3c0,9.6-7.8,17.4-17.4,17.4s-17.4-7.8-17.4-17.4s7.8-17.4,17.4-17.4S87.6,411.7,87.6,421.3z M393,421.3c0,9.6-7.8,17.4-17.4,17.4s-17.4-7.8-17.4-17.4s7.8-17.4,17.4-17.4S393,411.7,393,421.3z"/>
                    </svg>
                </div>
                <div class="cifras-kpi">
                    <span class="label-kpi">Total Productos</span>
                    <strong class="valor-kpi" id="val_kpi_total">0</strong>
                    <span class="subtexto-kpi">Catálogo general</span>
                </div>
            </article>

            <article class="tarjeta-kpi alerta-activa" id="kpi_alertas_tempranas">
                <div class="icono-kpi fondo-amarillo letra-azul-dark">
                    <svg viewBox="0 0 256 256" fill="currentColor">
                        <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"/>
                    </svg>
                </div>
                <div class="cifras-kpi">
                    <span class="label-kpi">Alertas Tempranas</span>
                    <strong class="valor-kpi letra-naranja" id="val_kpi_alertas">0</strong>
                    <span class="subtexto-kpi">&le; Stock Mínimo fijado</span>
                </div>
            </article>

            <article class="tarjeta-kpi" id="kpi_criticos">
                <div class="icono-kpi fondo-rojo letra-blanca">
                    <svg viewBox="0 0 256 256" fill="currentColor">
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"/>
                    </svg>
                </div>
                <div class="cifras-kpi">
                    <span class="label-kpi">Stock Crítico (0)</span>
                    <strong class="valor-kpi letra-roja" id="val_kpi_criticos">0</strong>
                    <span class="subtexto-kpi">Productos agotados</span>
                </div>
            </article>

            <article class="tarjeta-kpi" id="kpi_operatividad">
                <div class="icono-kpi fondo-verde letra-blanca">
                    <svg viewBox="0 0 256 256" fill="currentColor">
                        <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>
                    </svg>
                </div>
                <div class="cifras-kpi">
                    <span class="label-kpi">Estado Operativo</span>
                    <strong class="valor-kpi letra-verde" id="val_kpi_activos">0</strong>
                    <span class="subtexto-kpi"><span id="val_kpi_inactivos">0</span> inactivos</span>
                </div>
            </article>
        </section>

        <!-- BANNER REACTIVO DE ALERTA TEMPRANA -->
        <section id="banner_alertas_tempranas" class="banner-alerta oculto">
            <div class="icono-banner">
                <svg viewBox="0 0 256 256" fill="currentColor">
                    <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"/>
                </svg>
            </div>
            <div class="contenido-banner">
                <h3 id="titulo_banner_alerta">Alerta Temprana de Abastecimiento</h3>
                <p id="texto_banner_alerta">Existen productos que han alcanzado o descendido de su nivel de stock mínimo fijado.</p>
            </div>
            <div class="acciones-banner">
                <button type="button" id="btn_filtrar_alertas" class="btn-banner">Filtrar Productos en Alerta</button>
            </div>
        </section>

        <!-- BARRA DE CONTROLES: BÚSQUEDA, FILTROS Y NUEVO PRODUCTO -->
        <section id="barra_controles">
            <div class="grupo-busqueda">
                <svg class="ico-buscar" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
                </svg>
                <input type="text" id="input_buscador" placeholder="Buscar por nombre o ID de ingrediente..." autocomplete="off">
                <button type="button" id="btn_limpiar_busqueda" class="btn-limpiar oculto" title="Limpiar búsqueda">&times;</button>
            </div>

            <div class="grupo-filtros">
                <div class="control-filtro">
                    <label for="filtro_categoria">Categoría:</label>
                    <select id="filtro_categoria" class="select-personalizado">
                        <option value="TODAS">Todas las categorías</option>
                    </select>
                </div>

                <div class="control-filtro">
                    <label for="filtro_alerta">Nivel de Stock:</label>
                    <select id="filtro_alerta" class="select-personalizado">
                        <option value="TODOS">Todos los niveles</option>
                        <option value="ALERTA_TEMPRANA">⚠️ Alerta Temprana (&le; Mínimo)</option>
                        <option value="CRITICO">🔴 Crítico (Agotado)</option>
                        <option value="OPTIMO">🟢 Stock Óptimo</option>
                    </select>
                </div>

                <div class="control-filtro">
                    <label for="filtro_estado">Estado:</label>
                    <select id="filtro_estado" class="select-personalizado">
                        <option value="TODOS">Todos los estados</option>
                        <option value="Activo">Solo Activos</option>
                        <option value="Inactivo">Solo Inactivos</option>
                    </select>
                </div>
            </div>

            <div class="grupo-botones-accion">
                <button type="button" id="btn_abrir_modal_crear" class="btn-capsula capsula-full fondo-verde letra-blanca">
                    <svg viewBox="0 0 256 256" fill="currentColor">
                        <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
                    </svg>
                    <span>Nuevo Ingrediente</span>
                </button>
            </div>
        </section>

        <!-- CONTENEDOR DE LA TABLA Y LISTADO -->
        <section id="seccion_listado">
            <div class="cabecera-listado">
                <h2 id="titulo_listado">Catálogo de Ingredientes</h2>
                <span id="contador_mostrados" class="badge-conteo">Cargando...</span>
            </div>

            <div class="tabla-responsiva">
                <table id="tabla_ingredientes">
                    <thead>
                        <tr>
                            <th class="col-id">ID</th>
                            <th class="col-nombre">Ingrediente / Producto</th>
                            <th class="col-categoria">Categoría</th>
                            <th class="col-stock">Stock Actual</th>
                            <th class="col-stock-min">Stock Mínimo</th>
                            <th class="col-alerta">Nivel / Alerta Temprana</th>
                            <th class="col-und-min">Und. Mín</th>
                            <th class="col-estado">Estado</th>
                            <th class="col-acciones">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tbody_ingredientes">
                        <!-- Renderizado reactivo desde ingredientes.js -->
                    </tbody>
                </table>
            </div>

            <!-- VISTA VACÍA CUANDO NO HAY RESULTADOS -->
            <div id="vista_vacia" class="vista-vacia oculto">
                <svg viewBox="0 0 256 256" fill="currentColor">
                    <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V144H180.69a31.81,31.81,0,0,0-22.63,9.37L142.69,169a16,16,0,0,1-21.38,0l-15.38-15.6A31.81,31.81,0,0,0,83.31,144H40V56ZM40,200V160H83.31a15.86,15.86,0,0,1,11.32,4.69l15.37,15.6a32,32,0,0,0,42.76,0l15.37-15.6A15.86,15.86,0,0,1,172.69,160H216v40Z"/>
                </svg>
                <h3>No se encontraron ingredientes</h3>
                <p>No hay productos que coincidan con los criterios de búsqueda o filtros aplicados.</p>
                <button type="button" id="btn_restablecer_filtros" class="btn-capsula capsula-full fondo-azul letra-blanca">Restablecer filtros</button>
            </div>
        </section>

    </main>

    <!-- MODAL DE CREACIÓN / EDICIÓN DE INGREDIENTE -->
    <dialog id="modal_ingrediente" class="modal-dialog">
        <div class="modal-tarjeta">
            <header class="modal-header">
                <div class="modal-titulo-icono">
                    <div class="icono-modal-cab fondo-verde letra-blanca">
                        <svg viewBox="0 0 256 256" fill="currentColor">
                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
                        </svg>
                    </div>
                    <div>
                        <h2 id="modal_titulo">Registrar Ingrediente</h2>
                        <p id="modal_subtitulo">Ingresa los datos del producto e inventario para el restaurante</p>
                    </div>
                </div>
                <button type="button" class="btn-cerrar-modal" id="btn_cerrar_modal" aria-label="Cerrar modal">&times;</button>
            </header>

            <form id="formulario_ingrediente" autocomplete="off">
                <div class="modal-cuerpo">
                    <div class="grid-formulario">

                        <div class="campo-form col-4">
                            <label for="campo_id">ID Ingrediente <span class="obligatorio">*</span></label>
                            <input type="text" id="campo_id" name="id_ingrediente" maxlength="16" required placeholder="Elige una categoría" pattern="^[0-9A-Za-z]{1,16}$" title="Código único de hasta 16 caracteres">
                            <span class="pista-campo">Máx 3 caracteres</span>
                        </div>

                        <div class="campo-form col-8">
                            <label for="campo_categoria">Categoría <span class="obligatorio">*</span></label>
                            <select id="campo_categoria" name="categoria" required>
                                <option value="" disabled selected>Selecciona categoría...</option>
                            </select>
                            <span class="pista-campo">Según catálogo oficial</span>
                        </div>

                        <div class="campo-form col-12">
                            <label for="campo_nombre">Nombre del Producto <span class="obligatorio">*</span></label>
                            <input type="text" id="campo_nombre" name="nombre" maxlength="20" required placeholder="Ej: Pechuga de Pollo">
                            <span class="pista-campo"><span id="contador_chars_nombre">0</span>/20 caracteres permitidos</span>
                        </div>

                        <div class="campo-form col-4">
                            <label for="campo_stock">Stock Actual <span class="obligatorio">*</span></label>
                            <input type="number" id="campo_stock" name="stock" step="0.001" min="0" required placeholder="0.000">
                            <span class="pista-campo">Cantidad física actual</span>
                        </div>

                        <div class="campo-form col-4">
                            <label for="campo_unidad">Unidad <span class="obligatorio">*</span></label>
                            <input type="text" id="campo_unidad" name="unidad" maxlength="3" required placeholder="Kg" list="lista_unidades">
                            <datalist id="lista_unidades">
                                <option value="Kg">Kilogramos (Kg)</option>
                                <option value="L">Litros (L)</option>
                                <option value="Und">Unidades (Und)</option>
                                <option value="Gr">Gramos (Gr)</option>
                                <option value="Ml">Mililitros (Ml)</option>
                            </datalist>
                            <span class="pista-campo">Máx 3 carac. (Kg, L, Und)</span>
                        </div>

                        <div class="campo-form col-4">
                            <label for="campo_unidad_minima">Unidad Mínima</label>
                            <input type="text" id="campo_unidad_minima" name="unidad_minima" maxlength="3" placeholder="Gr" list="lista_unidades_min">
                            <datalist id="lista_unidades_min">
                                <option value="Gr">Gramos (Gr)</option>
                                <option value="Ml">Mililitros (Ml)</option>
                                <option value="Und">Unidad (Und)</option>
                            </datalist>
                            <span class="pista-campo">Para recetas de cocina</span>
                        </div>

                        <div class="campo-form col-6">
                            <label for="campo_stock_minimo">Stock Mínimo (Alerta Temprana) <span class="obligatorio">*</span></label>
                            <input type="number" id="campo_stock_minimo" name="stock_minimo" min="0" step="1" required placeholder="10">
                            <span class="pista-campo destacado">Dispara la alerta al descender a este valor</span>
                        </div>

                        <div class="campo-form col-6">
                            <label for="campo_estado">Estado Operativo</label>
                            <select id="campo_estado" name="estado">
                                <option value="Activo">Activo (Disponible en recetas)</option>
                                <option value="Inactivo">Inactivo (Desactivado / No visible)</option>
                            </select>
                            <span class="pista-campo">Control de activación</span>
                        </div>

                        <div class="campo-form col-12">
                            <label for="campo_descripcion">Descripción / Observaciones</label>
                            <textarea id="campo_descripcion" name="descripcion" rows="3" placeholder="Detalles de conservación, especificaciones del insumo, proveedor frecuente..."></textarea>
                        </div>

                    </div>
                </div>

                <footer class="modal-footer">
                    <button type="button" class="btn-secundario" id="btn_cancelar_modal">Cancelar</button>
                    <button type="submit" class="btn-capsula capsula-full fondo-verde letra-blanca" id="btn_guardar_ingrediente">
                        <span>Guardar Ingrediente</span>
                    </button>
                </footer>
            </form>
        </div>
    </dialog>

    <!-- MODAL DE CONFIRMACIÓN PARA DESACTIVAR / ACTIVAR -->
    <dialog id="modal_confirmacion" class="modal-dialog">
        <div class="modal-tarjeta modal-tarjeta-sm">
            <header class="modal-header">
                <h3 id="conf_titulo">Cambiar Estado del Producto</h3>
                <button type="button" class="btn-cerrar-modal" id="btn_cerrar_conf">&times;</button>
            </header>
            <div class="modal-cuerpo">
                <p id="conf_mensaje">¿Estás seguro de cambiar el estado de este ingrediente?</p>
            </div>
            <footer class="modal-footer">
                <button type="button" class="btn-secundario" id="btn_cancelar_conf">Cancelar</button>
                <button type="button" class="btn-capsula capsula-full" id="btn_aceptar_conf">Confirmar</button>
            </footer>
        </div>
    </dialog>

    <!-- TABLERO TOAST DE NOTIFICACIONES FLOTANTES -->
    <div id="contenedor_toasts" aria-live="polite"></div>

</body>
</html>

