/**
 * ==========================================================================
 * MÓDULO DE INGREDIENTES E INVENTARIO - REMY 1.0 (SENA CAB - ADSO)
 * Lógica Frontend Reactiva en Vanilla JavaScript ES6+
 * Estándar: vFR8-3 / vFR8-4 • Paradigma Funcional-Reactivo
 * ==========================================================================
 */

'use strict';

// --------------------------------------------------------------------------
// ESTADO REACTIVO LOCAL
// --------------------------------------------------------------------------
const estadoApp = {
    ingredientes: [],
    categorias: [],
    metricas: {
        total_productos: 0,
        total_activos: 0,
        total_inactivos: 0,
        total_alertas_tempranas: 0,
        total_criticos: 0,
        total_optimos: 0
    },
    filtros: {
        busqueda: '',
        categoria: 'TODAS',
        alerta: 'TODOS',
        estado: 'TODOS'
    },
    modoModal: 'CREAR', // 'CREAR' | 'EDITAR'
    ingredienteEnEdicion: null,
    ingredienteParaCambioEstado: null,
    idEditadoManualmente: false
};

// --------------------------------------------------------------------------
// ENDPOINTS DEL BACKEND (SERVICIOS PHP)
// --------------------------------------------------------------------------
const RUTAS_API = {
    consultarIngredientes: `${RUTAS_INVENTARIO.api}/ingredientes`,
    consultarCategorias:   `${RUTAS_INVENTARIO.api}/categorias`,
    guardarIngrediente:    `${RUTAS_INVENTARIO.api}/ingredientes`,
    actualizarIngrediente: `${RUTAS_INVENTARIO.api}/ingredientes/actualizar`,
    cambiarEstado:         `${RUTAS_INVENTARIO.api}/ingredientes/estado`,
    siguienteId:           `${RUTAS_INVENTARIO.api}/siguiente-id`
};

// --------------------------------------------------------------------------
// UTILIDADES PURAS
// --------------------------------------------------------------------------
const escaparHTML = (str) => {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const formatearDecimal = (valor, decimales = 3) => {
    const num = Number(valor) || 0;
    return num.toLocaleString('es-CO', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
    });
};

// Sistema de Notificaciones Toast Flotantes
const mostrarToast = (mensaje, tipo = 'exito') => {
    const contenedor = document.getElementById('contenedor_toasts');
    if (!contenedor) return;

    const toast = document.createElement('div');
    toast.className = `toast-alerta toast-${tipo}`;

    let icono = '';
    if (tipo === 'exito') {
        icono = '<svg viewBox="0 0 256 256" fill="currentColor"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>';
    } else if (tipo === 'error') {
        icono = '<svg viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"/></svg>';
    } else {
        icono = '<svg viewBox="0 0 256 256" fill="currentColor"><path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"/></svg>';
    }

    toast.innerHTML = `${icono}<span class="toast-texto">${escaparHTML(mensaje)}</span>`;
    contenedor.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3800);
};

// --------------------------------------------------------------------------
// CONSUMO DE ENDPOINTS (FETCH API)
// --------------------------------------------------------------------------
const cargarCategorias = async () => {
    try {
        const respuesta = await fetch(RUTAS_API.consultarCategorias);
        const json = await respuesta.json();
        if (json.respuesta === 'SI') {
            estadoApp.categorias = json.datos || [];
            poblarSelectsCategorias();
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
};

const cargarIngredientes = async () => {
    const contador = document.getElementById('contador_mostrados');
    if (contador) contador.textContent = 'Actualizando...';

    try {
        const respuesta = await fetch(RUTAS_API.consultarIngredientes);
        const json = await respuesta.json();

        if (json.respuesta === 'SI') {
            estadoApp.ingredientes = json.datos || [];
            estadoApp.metricas = json.metricas || estadoApp.metricas;
            actualizarDashboardKPIs();
            actualizarBannerAlertaTemprana();
            renderizarTabla();
        } else {
            mostrarToast(json.mensaje || 'Error al obtener datos', 'error');
        }
    } catch (error) {
        console.error('Error en cargarIngredientes:', error);
        mostrarToast('Error de comunicación con el servidor', 'error');
    }
};

const obtenerSiguienteId = async (categoria) => {
    if (!categoria) return '';
    try {
        const respuesta = await fetch(`${RUTAS_API.siguienteId}?categoria=${encodeURIComponent(categoria)}`);
        const json = await respuesta.json();
        if (json.respuesta === 'SI') {
            return json.siguiente_id;
        }
    } catch (error) {
        console.error('Error al obtener siguiente ID:', error);
    }
    return '';
};

// --------------------------------------------------------------------------
// RENDERIZADO Y ACTUALIZACIÓN DEL DOM
// --------------------------------------------------------------------------
const poblarSelectsCategorias = () => {
    const selectFiltro = document.getElementById('filtro_categoria');
    const selectForm = document.getElementById('campo_categoria');

    if (selectFiltro) {
        let opcionesFiltro = '<option value="TODAS">Todas las categorías</option>';
        estadoApp.categorias.forEach(cat => {
            opcionesFiltro += `<option value="${escaparHTML(cat.id_categoria)}">${escaparHTML(cat.nombre)}</option>`;
        });
        selectFiltro.innerHTML = opcionesFiltro;
    }

    if (selectForm) {
        let opcionesForm = '<option value="" disabled selected>Selecciona categoría...</option>';
        estadoApp.categorias.forEach(cat => {
            opcionesForm += `<option value="${escaparHTML(cat.id_categoria)}">${escaparHTML(cat.nombre)}</option>`;
        });
        selectForm.innerHTML = opcionesForm;
    }
};

const actualizarDashboardKPIs = () => {
    const m = estadoApp.metricas;
    const elTotal    = document.getElementById('val_kpi_total');
    const elAlertas  = document.getElementById('val_kpi_alertas');
    const elCriticos = document.getElementById('val_kpi_criticos');
    const elActivos  = document.getElementById('val_kpi_activos');
    const elInactivos= document.getElementById('val_kpi_inactivos');

    if (elTotal)     elTotal.textContent    = m.total_productos;
    if (elAlertas)   elAlertas.textContent  = m.total_alertas_tempranas;
    if (elCriticos)  elCriticos.textContent = m.total_criticos;
    if (elActivos)   elActivos.textContent  = m.total_activos;
    if (elInactivos) elInactivos.textContent= `${m.total_inactivos}`;

    // Destacar la tarjeta de alertas tempranas si hay incidencias
    const cardAlertas = document.getElementById('kpi_alertas_tempranas');
    if (cardAlertas) {
        if (m.total_alertas_tempranas > 0) {
            cardAlertas.classList.add('alerta-activa');
        } else {
            cardAlertas.classList.remove('alerta-activa');
        }
    }
};

const actualizarBannerAlertaTemprana = () => {
    const banner = document.getElementById('banner_alertas_tempranas');
    const totalEnAlerta = estadoApp.metricas.total_alertas_tempranas + estadoApp.metricas.total_criticos;

    if (!banner) return;

    if (totalEnAlerta > 0) {
        const txt = document.getElementById('texto_banner_alerta');
        if (txt) {
            txt.innerHTML = `Atención: <strong>${totalEnAlerta} ingrediente(s)</strong> han alcanzado o descendido de su nivel de stock mínimo fijado (${estadoApp.metricas.total_alertas_tempranas} en alerta temprana y ${estadoApp.metricas.total_criticos} agotados). Requieren reabastecimiento prioritario.`;
        }
        banner.classList.remove('oculto');
    } else {
        banner.classList.add('oculto');
    }
};

const filtrarIngredientes = () => {
    const { busqueda, categoria, alerta, estado } = estadoApp.filtros;
    const busqLim = busqueda.trim().toLowerCase();

    return estadoApp.ingredientes.filter(item => {
        // Filtro por texto (Nombre o ID)
        if (busqLim) {
            const coincideNombre = item.nombre.toLowerCase().includes(busqLim);
            const coincideId = item.id_ingrediente.toLowerCase().includes(busqLim);
            if (!coincideNombre && !coincideId) return false;
        }

        // Filtro por Categoría
        if (categoria !== 'TODAS' && item.categoria !== categoria) {
            return false;
        }

        // Filtro por Alerta Temprana de Stock
        if (alerta !== 'TODOS' && item.nivel_alerta !== alerta) {
            return false;
        }

        // Filtro por Estado (Activo / Inactivo)
        if (estado !== 'TODOS' && item.estado !== estado) {
            return false;
        }

        return true;
    });
};

const renderizarTabla = () => {
    const tbody = document.getElementById('tbody_ingredientes');
    const vistaVacia = document.getElementById('vista_vacia');
    const contador = document.getElementById('contador_mostrados');
    if (!tbody) return;

    const itemsFiltrados = filtrarIngredientes();

    if (contador) {
        contador.textContent = `${itemsFiltrados.length} de ${estadoApp.ingredientes.length} productos`;
    }

    if (itemsFiltrados.length === 0) {
        tbody.innerHTML = '';
        if (vistaVacia) vistaVacia.classList.remove('oculto');
        return;
    }

    if (vistaVacia) vistaVacia.classList.add('oculto');

    const fragmento = document.createDocumentFragment();

    itemsFiltrados.forEach(item => {
        const tr = document.createElement('tr');

        // Clases de fila según alerta y estado
        if (item.estado === 'Inactivo') {
            tr.classList.add('fila-inactiva');
        } else if (item.nivel_alerta === 'CRITICO') {
            tr.classList.add('fila-critica');
        } else if (item.nivel_alerta === 'ALERTA_TEMPRANA') {
            tr.classList.add('fila-alerta-temprana');
        }

        // Configuración visual del Nivel de Stock y Alerta Temprana
        let badgeNivel = '';
        let claseCifra = 'cifra-optima';
        let claseRelleno = 'relleno-optimo';
        let anchoBarra = Math.min(Math.max(item.porcentaje_stock || 0, 0), 100);

        if (item.nivel_alerta === 'CRITICO') {
            badgeNivel = '<span class="badge-nivel nivel-critico">🔴 Stock Crítico (0)</span>';
            claseCifra = 'cifra-critica';
            claseRelleno = 'relleno-critico';
            anchoBarra = 5;
        } else if (item.nivel_alerta === 'ALERTA_TEMPRANA') {
            badgeNivel = '<span class="badge-nivel nivel-alerta">⚠️ Alerta Temprana (&le; Mín)</span>';
            claseCifra = 'cifra-alerta';
            claseRelleno = 'relleno-alerta';
        } else {
            badgeNivel = '<span class="badge-nivel nivel-optimo">🟢 Stock Óptimo</span>';
            claseCifra = 'cifra-optima';
            claseRelleno = 'relleno-optimo';
        }

        // Estado y botón alternar
        const esActivo = item.estado === 'Activo';
        const badgeEstado = esActivo
            ? '<span class="badge-estado estado-activo">Activo</span>'
            : '<span class="badge-estado estado-inactivo">Inactivo</span>';

        const btnToggleEstado = esActivo
            ? `<button type="button" class="btn-accion btn-accion-desactivar" data-id="${escaparHTML(item.id_ingrediente)}" data-accion="desactivar" title="Desactivar producto">
                 <svg viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"/></svg>
               </button>`
            : `<button type="button" class="btn-accion btn-accion-activar" data-id="${escaparHTML(item.id_ingrediente)}" data-accion="activar" title="Activar producto">
                 <svg viewBox="0 0 256 256" fill="currentColor"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Z"/></svg>
               </button>`;

        tr.innerHTML = `
            <td><span class="badge-id">${escaparHTML(item.id_ingrediente)}</span></td>
            <td>
                <div class="celda-producto">
                    <span class="nombre-producto">${escaparHTML(item.nombre)}</span>
                    <span class="desc-corta" title="${escaparHTML(item.descripcion)}">${escaparHTML(item.descripcion || 'Sin descripción adicional')}</span>
                </div>
            </td>
            <td><span class="badge-categoria">${escaparHTML(item.nombre_categoria)}</span></td>
            <td><strong class="cifra-stock ${claseCifra}">${formatearDecimal(item.stock, 3)}</strong> <small>${escaparHTML(item.unidad)}</small></td>
            <td><strong>${item.stock_minimo}</strong> <small>${escaparHTML(item.unidad)}</small></td>
            <td>
                <div class="bloque-alerta-stock">
                    ${badgeNivel}
                    <div class="barra-fondo" title="${anchoBarra}% del stock mínimo">
                        <div class="barra-relleno ${claseRelleno}" style="width: ${anchoBarra}%;"></div>
                    </div>
                </div>
            </td>
            <td><small>${escaparHTML(item.unidad_minima || '-')}</small></td>
            <td>${badgeEstado}</td>
            <td>
                <div class="acciones-fila">
                    <button type="button" class="btn-accion btn-accion-editar" data-id="${escaparHTML(item.id_ingrediente)}" data-accion="editar" title="Editar ingrediente">
                        <svg viewBox="0 0 256 256" fill="currentColor"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31l123.31-123.31A16,16,0,0,0,227.31,73.37ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/></svg>
                    </button>
                    ${btnToggleEstado}
                </div>
            </td>
        `;

        fragmento.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragmento);
};

// --------------------------------------------------------------------------
// MODAL DE CREACIÓN / EDICIÓN
// --------------------------------------------------------------------------
const abrirModalCrear = async () => {
    estadoApp.modoModal = 'CREAR';
    estadoApp.ingredienteEnEdicion = null;

    const modal = document.getElementById('modal_ingrediente');
    const form = document.getElementById('formulario_ingrediente');
    const titulo = document.getElementById('modal_titulo');
    const subtitulo = document.getElementById('modal_subtitulo');
    const campoId = document.getElementById('campo_id');
    const contadorChars = document.getElementById('contador_chars_nombre');

    if (!modal || !form) return;

    form.reset();
    titulo.textContent = 'Registrar Nuevo Ingrediente';
    subtitulo.textContent = 'Ingresa los datos del producto e inventario para el restaurante';
    if (contadorChars) contadorChars.textContent = '0';

    // El ID se calcula al elegir una categoría.
    estadoApp.idEditadoManualmente = false;
    campoId.value = '';
    campoId.readOnly = false;

    // Valores por defecto
    document.getElementById('campo_stock').value = '0';
    document.getElementById('campo_stock_minimo').value = '5';
    document.getElementById('campo_unidad').value = 'Kg';
    document.getElementById('campo_unidad_minima').value = 'Gr';
    document.getElementById('campo_estado').value = 'Activo';

    modal.showModal();
};

const abrirModalEditar = (idIngrediente) => {
    const item = estadoApp.ingredientes.find(i => String(i.id_ingrediente) === String(idIngrediente));
    if (!item) return;

    estadoApp.modoModal = 'EDITAR';
    estadoApp.ingredienteEnEdicion = item;
    estadoApp.idEditadoManualmente = true;

    const modal = document.getElementById('modal_ingrediente');
    const form = document.getElementById('formulario_ingrediente');
    const titulo = document.getElementById('modal_titulo');
    const subtitulo = document.getElementById('modal_subtitulo');
    const campoId = document.getElementById('campo_id');
    const contadorChars = document.getElementById('contador_chars_nombre');

    if (!modal || !form) return;

    form.reset();
    titulo.textContent = `Editar Ingrediente: ${item.nombre}`;
    subtitulo.textContent = `Actualiza cantidades, unidades y nivel de alerta temprana para [ID: ${item.id_ingrediente}]`;

    campoId.value = item.id_ingrediente;
    campoId.readOnly = true; // El ID primario no se altera en edición

    document.getElementById('campo_categoria').value = item.categoria || '';
    document.getElementById('campo_nombre').value = item.nombre || '';
    document.getElementById('campo_stock').value = item.stock;
    document.getElementById('campo_unidad').value = item.unidad || 'Und';
    document.getElementById('campo_unidad_minima').value = item.unidad_minima || '';
    document.getElementById('campo_stock_minimo').value = item.stock_minimo;
    document.getElementById('campo_estado').value = item.estado || 'Activo';
    document.getElementById('campo_descripcion').value = item.descripcion || '';

    if (contadorChars) {
        contadorChars.textContent = String(item.nombre || '').length;
    }

    modal.showModal();
};

const cerrarModalFormulario = () => {
    const modal = document.getElementById('modal_ingrediente');
    if (modal && modal.open) {
        modal.close();
    }
};

// --------------------------------------------------------------------------
// GUARDAR / ACTUALIZAR INGREDIENTE
// --------------------------------------------------------------------------
const procesarFormularioIngrediente = async (evento) => {
    evento.preventDefault();

    const form = document.getElementById('formulario_ingrediente');
    const btnSubmit = document.getElementById('btn_guardar_ingrediente');
    if (!form) return;

    const datos = {
        id_ingrediente: document.getElementById('campo_id').value.trim(),
        categoria:      document.getElementById('campo_categoria').value.trim(),
        nombre:         document.getElementById('campo_nombre').value.trim(),
        stock:          parseFloat(document.getElementById('campo_stock').value) || 0,
        unidad:         document.getElementById('campo_unidad').value.trim(),
        unidad_minima:  document.getElementById('campo_unidad_minima').value.trim(),
        stock_minimo:   parseInt(document.getElementById('campo_stock_minimo').value, 10) || 0,
        estado:         document.getElementById('campo_estado').value.trim(),
        descripcion:    document.getElementById('campo_descripcion').value.trim()
    };

    if (!datos.nombre || !datos.categoria) {
        mostrarToast('Completa el nombre y la categoría', 'alerta');
        return;
    }

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.querySelector('span').textContent = 'Guardando...';
    }

    const urlDestino = (estadoApp.modoModal === 'CREAR')
        ? RUTAS_API.guardarIngrediente
        : RUTAS_API.actualizarIngrediente;

    try {
        const respuesta = await fetch(urlDestino, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const json = await respuesta.json();

        if (json.respuesta === 'SI') {
            const idGuardado = json.id_ingrediente ? ` (${json.id_ingrediente})` : '';
            mostrarToast((json.mensaje || 'Operación exitosa') + idGuardado, 'exito');
            cerrarModalFormulario();
            await cargarIngredientes();
        } else if (json.respuesta === 'DUPLICADO') {
            mostrarToast(json.mensaje || 'El ID ya existe', 'error');
        } else {
            mostrarToast(json.mensaje || 'Ocurrió un error', 'error');
        }
    } catch (error) {
        console.error('Error al procesar ingrediente:', error);
        mostrarToast('Error de red al guardar ingrediente', 'error');
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.querySelector('span').textContent = 'Guardar Ingrediente';
        }
    }
};

// --------------------------------------------------------------------------
// MODAL DE CONFIRMACIÓN: ACTIVAR / DESACTIVAR
// --------------------------------------------------------------------------
const abrirModalConfirmacionEstado = (idIngrediente, accion) => {
    const item = estadoApp.ingredientes.find(i => String(i.id_ingrediente) === String(idIngrediente));
    if (!item) return;

    estadoApp.ingredienteParaCambioEstado = { item, nuevoEstado: accion === 'activar' ? 'Activo' : 'Inactivo' };

    const modal = document.getElementById('modal_confirmacion');
    const titulo = document.getElementById('conf_titulo');
    const mensaje = document.getElementById('conf_mensaje');
    const btnAceptar = document.getElementById('btn_aceptar_conf');

    if (!modal) return;

    if (accion === 'desactivar') {
        titulo.textContent = 'Desactivar Producto';
        mensaje.innerHTML = `¿Estás seguro de desactivar <strong>${escaparHTML(item.nombre)}</strong> (ID: ${item.id_ingrediente})?<br><br><small class="letra-gris-dark">El ingrediente no estará disponible en recetas ni platos activos mientras esté inactivo.</small>`;
        btnAceptar.className = 'btn-capsula capsula-full fondo-rojo letra-blanca';
        btnAceptar.textContent = 'Sí, desactivar';
    } else {
        titulo.textContent = 'Activar Producto';
        mensaje.innerHTML = `¿Deseas reactivar <strong>${escaparHTML(item.nombre)}</strong> (ID: ${item.id_ingrediente}) para uso en cocina?`;
        btnAceptar.className = 'btn-capsula capsula-full fondo-verde letra-blanca';
        btnAceptar.textContent = 'Sí, activar';
    }

    modal.showModal();
};

const confirmarCambioEstado = async () => {
    if (!estadoApp.ingredienteParaCambioEstado) return;

    const { item, nuevoEstado } = estadoApp.ingredienteParaCambioEstado;
    const modal = document.getElementById('modal_confirmacion');

    try {
        const respuesta = await fetch(RUTAS_API.cambiarEstado, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_ingrediente: item.id_ingrediente,
                nuevo_estado: nuevoEstado
            })
        });

        const json = await respuesta.json();

        if (json.respuesta === 'SI') {
            mostrarToast(json.mensaje, nuevoEstado === 'Activo' ? 'exito' : 'alerta');
            if (modal) modal.close();
            await cargarIngredientes();
        } else {
            mostrarToast(json.mensaje || 'Error al cambiar estado', 'error');
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        mostrarToast('Error de comunicación con el servidor', 'error');
    }
};

// --------------------------------------------------------------------------
// ENGANCHE DE EVENTOS (DOM CONTENT LOADED)
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    const parametros = new URLSearchParams(window.location.search);
    const filtroInicial = parametros.get('id') || parametros.get('buscar') || '';
    const buscadorInicial = document.getElementById('input_buscador');
    if (buscadorInicial && filtroInicial) {
        buscadorInicial.value = filtroInicial;
        estadoApp.filtros.busqueda = filtroInicial;
    }

    // 1. Cargas iniciales
    cargarCategorias();
    cargarIngredientes();

    // 2. Botón recargar / refrescar
    const btnRecargar = document.getElementById('btn_recargar');
    if (btnRecargar) {
        btnRecargar.addEventListener('click', () => {
            mostrarToast('Actualizando inventario...', 'exito');
            cargarIngredientes();
        });
    }

    // 3. Botón de nuevo ingrediente
    const btnAbrirCrear = document.getElementById('btn_abrir_modal_crear');
    if (btnAbrirCrear) {
        btnAbrirCrear.addEventListener('click', abrirModalCrear);
    }

    // 4. Cierres de modal de formulario
    const btnCerrarModal = document.getElementById('btn_cerrar_modal');
    const btnCancelarModal = document.getElementById('btn_cancelar_modal');
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModalFormulario);
    if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModalFormulario);

    // 5. Cierres y confirmación del modal de confirmación
    const btnCerrarConf = document.getElementById('btn_cerrar_conf');
    const btnCancelarConf = document.getElementById('btn_cancelar_conf');
    const btnAceptarConf = document.getElementById('btn_aceptar_conf');
    const modalConf = document.getElementById('modal_confirmacion');

    if (btnCerrarConf) btnCerrarConf.addEventListener('click', () => modalConf.close());
    if (btnCancelarConf) btnCancelarConf.addEventListener('click', () => modalConf.close());
    if (btnAceptarConf) btnAceptarConf.addEventListener('click', confirmarCambioEstado);

    // 6. Envío del formulario
    const formIngrediente = document.getElementById('formulario_ingrediente');
    if (formIngrediente) {
        formIngrediente.addEventListener('submit', procesarFormularioIngrediente);
    }

    const campoId = document.getElementById('campo_id');
    const campoCategoria = document.getElementById('campo_categoria');
    if (campoId) {
        campoId.addEventListener('input', () => {
            if (estadoApp.modoModal === 'CREAR') estadoApp.idEditadoManualmente = true;
        });
    }
    if (campoCategoria) {
        campoCategoria.addEventListener('change', async () => {
            if (estadoApp.modoModal !== 'CREAR' || estadoApp.idEditadoManualmente || !campoCategoria.value) return;
            const categoriaSeleccionada = campoCategoria.value;
            const siguienteId = await obtenerSiguienteId(categoriaSeleccionada);
            if (categoriaSeleccionada === campoCategoria.value && !estadoApp.idEditadoManualmente) {
                campoId.value = siguienteId;
            }
        });
    }

    // 7. Contador de caracteres en tiempo real para nombre (máx 20)
    const campoNombre = document.getElementById('campo_nombre');
    const contadorChars = document.getElementById('contador_chars_nombre');
    if (campoNombre && contadorChars) {
        campoNombre.addEventListener('input', () => {
            contadorChars.textContent = String(campoNombre.value.length);
        });
    }

    // 8. Buscador en tiempo real
    const inputBuscador = document.getElementById('input_buscador');
    const btnLimpiar = document.getElementById('btn_limpiar_busqueda');

    if (inputBuscador) {
        inputBuscador.addEventListener('input', (e) => {
            estadoApp.filtros.busqueda = e.target.value;
            if (btnLimpiar) {
                if (e.target.value.length > 0) {
                    btnLimpiar.classList.remove('oculto');
                } else {
                    btnLimpiar.classList.add('oculto');
                }
            }
            renderizarTabla();
        });
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            inputBuscador.value = '';
            estadoApp.filtros.busqueda = '';
            btnLimpiar.classList.add('oculto');
            renderizarTabla();
        });
    }

    // 9. Filtros de categoría, alerta y estado
    const selectFiltroCat = document.getElementById('filtro_categoria');
    const selectFiltroAlerta = document.getElementById('filtro_alerta');
    const selectFiltroEstado = document.getElementById('filtro_estado');

    if (selectFiltroCat) {
        selectFiltroCat.addEventListener('change', (e) => {
            estadoApp.filtros.categoria = e.target.value;
            renderizarTabla();
        });
    }

    if (selectFiltroAlerta) {
        selectFiltroAlerta.addEventListener('change', (e) => {
            estadoApp.filtros.alerta = e.target.value;
            renderizarTabla();
        });
    }

    if (selectFiltroEstado) {
        selectFiltroEstado.addEventListener('change', (e) => {
            estadoApp.filtros.estado = e.target.value;
            renderizarTabla();
        });
    }

    // 10. Botón del banner de alerta temprana: filtrar directamente solo alertas
    const btnFiltrarAlertas = document.getElementById('btn_filtrar_alertas');
    if (btnFiltrarAlertas) {
        btnFiltrarAlertas.addEventListener('click', () => {
            if (selectFiltroAlerta) {
                selectFiltroAlerta.value = 'ALERTA_TEMPRANA';
                estadoApp.filtros.alerta = 'ALERTA_TEMPRANA';
                renderizarTabla();
                const seccionListado = document.getElementById('seccion_listado');
                if (seccionListado) {
                    seccionListado.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }

    // 11. Botón de restablecer filtros en vista vacía
    const btnRestablecer = document.getElementById('btn_restablecer_filtros');
    if (btnRestablecer) {
        btnRestablecer.addEventListener('click', () => {
            estadoApp.filtros.busqueda = '';
            estadoApp.filtros.categoria = 'TODAS';
            estadoApp.filtros.alerta = 'TODOS';
            estadoApp.filtros.estado = 'TODOS';

            if (inputBuscador) inputBuscador.value = '';
            if (btnLimpiar) btnLimpiar.classList.add('oculto');
            if (selectFiltroCat) selectFiltroCat.value = 'TODAS';
            if (selectFiltroAlerta) selectFiltroAlerta.value = 'TODOS';
            if (selectFiltroEstado) selectFiltroEstado.value = 'TODOS';

            renderizarTabla();
        });
    }

    // 12. Delegación de eventos para la tabla (Editar / Activar / Desactivar)
    const tbody = document.getElementById('tbody_ingredientes');
    if (tbody) {
        tbody.addEventListener('click', (evento) => {
            const btn = evento.target.closest('button[data-accion]');
            if (!btn) return;

            const accion = btn.dataset.accion;
            const id = btn.dataset.id;

            if (accion === 'editar') {
                abrirModalEditar(id);
            } else if (accion === 'desactivar' || accion === 'activar') {
                abrirModalConfirmacionEstado(id, accion);
            }
        });
    }

});

