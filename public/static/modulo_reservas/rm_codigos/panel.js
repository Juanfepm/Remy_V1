



const ICO_PANEL_TRES_PUNTOS =
    '<svg id="btn_menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">' +
    '<path d="M128,100a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,128,100Zm0,48a20,20,0,1,1,20-20A20.02229,20.02229,0,0,1,128,148Zm0-72a28,28,0,1,0-28-28A28.03146,28.03146,0,0,0,128,76Zm0-48a20,20,0,1,1-20,20A20.02229,20.02229,0,0,1,128,28Zm0,152a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,128,180Zm0,48a20,20,0,1,1,20-20A20.02229,20.02229,0,0,1,128,228Z"/></svg>';

const ICO_PANEL_INICIO =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 10.5L12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.8 20v-5.5h4.4V20"/></svg>';

const ICO_PANEL_RESERVAS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3.5" y="4.5" width="17" height="16" rx="2.2"/><path d="M8 3v3.5M16 3v3.5M3.5 9.5h17"/><path d="M8 13.5h3M8 16.5h6"/></svg>';

const ICO_PANEL_EVENTOS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 3.5l2.2 4.6 5 0.7-3.6 3.55 0.85 5.05L12 15l-4.45 2.4 0.85-5.05-3.6-3.55 5-0.7z"/></svg>';

const ICO_PANEL_EXPERIENCIAS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M19 3H5v4c0 3.28 2.27 6.03 5.34 6.78L10.34 19H6v2h12v-2h-4.34l0-5.22C16.73 13.03 19 10.28 19 7V3z"/></svg>';

const ICO_PANEL_CARTA =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">' +
    '<path d="M464,344.063c0-109.308-84.755-199.193-192-207.39V80H240v56.673c-107.245,8.2-192,98.082-192,207.39V377.17H464Zm-32,1.107H80v-1.107c0-97.046,78.953-176,176-176s176,78.953,176,176Z"/>' +
    '<rect width="480" height="32" x="16" y="416"/></svg>';

const ICO_PANEL_SALIR =
    '<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" fill="currentColor">' +
    '<path d="M8.5 0C7.678 0 7 .678 7 1.5v6c0 .665 1 .67 1 0v-6c0-.286.214-.5.5-.5h20c.286 0 .5.214.5.5v27c0 .286-.214.5-.5.5h-20c-.286 0-.5-.214-.5-.5v-7c0-.66-1-.654-1 0v7c0 .822.678 1.5 1.5 1.5h20c.822 0 1.5-.678 1.5-1.5v-27c0-.822-.678-1.5-1.5-1.5zm-4 19c.45 0 .643-.563.354-.854L1.207 14.5l3.647-3.646c.442-.426-.254-1.16-.708-.708l-4 4c-.195.196-.195.512 0 .708l4 4c.095.097.22.146.354.146zm13-4h-14c-.277 0-.5-.223-.5-.5s.223-.5.5-.5h14c.277 0 .5.223.5.5s-.223.5-.5.5z"/></svg>';


const MARCAS_PANEL =
    '<div id="cont_marcas">' +
    '<figure id="marca_sena"><img src="' + RAIZ + '/static/modulo_reservas/rm_componentes/simbolo_sena_verde.svg" alt="SENA"></figure>' +
    '<div id="linea_vert"></div>' +
    '<figure id="marca_remy"><img src="' + RAIZ + '/static/modulo_reservas/rm_componentes/remy_green.svg" alt="REMY"></figure>' +
    '</div>';


const SECCIONES_PANEL = [
    { id: 'inicio', enlace: 'dashboard.html', icono: ICO_PANEL_INICIO, texto: 'Inicio', soloInstructor: false },
    { id: 'reservas_dia', enlace: 'admin_reservas_dia.html', icono: ICO_PANEL_RESERVAS, texto: 'Reservas del día', soloInstructor: false },
    { id: 'agregar_reserva', enlace: 'admin_agregar_reserva.html', icono: ICO_PANEL_CARTA, texto: 'Agregar reserva', soloInstructor: false },
    { id: 'reservas_eventos', enlace: 'admin_reservas_eventos.html', icono: ICO_PANEL_RESERVAS, texto: 'Reservas de eventos', soloInstructor: false },
    { id: 'eventos', enlace: 'admin_eventos.html', icono: ICO_PANEL_EVENTOS, texto: 'Eventos', soloInstructor: true },
    { id: 'experiencias', enlace: 'admin_experiencias.html', icono: ICO_PANEL_EXPERIENCIAS, texto: 'Experiencias', soloInstructor: true }
];


function pintarPanel(sesion) {
    const cabezote = document.getElementById('cabezote_sesion');
    if (!cabezote) return;

    const activo = cabezote.dataset.activo || '';
    let opciones = '';

    for (let i = 0; i < SECCIONES_PANEL.length; i++) {
        const seccion = SECCIONES_PANEL[i];

        
        if (seccion.soloInstructor && sesion.rol !== ROL_INSTRUCTOR) continue;

        const clase = seccion.id === activo ? 'btn-opc activo' : 'btn-opc';
        opciones +=
            '<a href="' + seccion.enlace + '" class="' + clase + '">' +
            seccion.icono + '<span>' + seccion.texto + '</span></a>';
    }

    opciones +=
        '<a href="#" class="btn-opc btn_salir">' + ICO_PANEL_SALIR + '<span>Cerrar Sesión</span></a>';

    cabezote.innerHTML =
        MARCAS_PANEL +
        '<div id="datos_sesion">' +
        '<strong id="nombre_usuario"></strong>' +
        '<span id="rol_usuario"></span>' +
        '</div>' +
        '<nav id="menu_ppal">' +
        ICO_PANEL_TRES_PUNTOS +
        '<div id="opcs_menu">' + opciones + '</div>' +
        '</nav>';

    pintarSesionEnCabezote(sesion);
    engancharBotonMenu();
}


function engancharBotonMenu() {
    const boton = document.getElementById('btn_menu');
    const opciones = document.getElementById('opcs_menu');
    if (!boton || !opciones) return;

    boton.addEventListener('click', function () {
        opciones.classList.toggle('abierto');
    });

    
    document.addEventListener('click', function (evento) {
        if (boton.contains(evento.target) || opciones.contains(evento.target)) return;
        opciones.classList.remove('abierto');
    });
}




const ICO_EDITAR =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>' +
    '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';

const ICO_BORRAR =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="3 6 5 6 21 6"></polyline>' +
    '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
