

const MODULOS = [
    {
        id: 'reservas_dia',
        enlace: 'admin_reservas_dia.html',
        titulo: 'Reservas del día',
        texto: 'Consulta quién reservó el menú de hoy y marca las entregas.',
        icono: ICO_PANEL_RESERVAS,
        soloInstructor: false
    },
    {
        id: 'agregar_reserva',
        enlace: 'admin_agregar_reserva.html',
        titulo: 'Agregar reserva',
        texto: 'Registra a mano la reserva de alguien que llegó al punto.',
        icono: ICO_PANEL_CARTA,
        soloInstructor: false
    },
    {
        id: 'reservas_eventos',
        enlace: 'admin_reservas_eventos.html',
        titulo: 'Reservas de eventos',
        texto: 'Revisa las reservas de eventos y cancela las que no van.',
        icono: ICO_PANEL_RESERVAS,
        soloInstructor: false
    },
    {
        id: 'eventos',
        enlace: 'admin_eventos.html',
        titulo: 'Eventos',
        texto: 'Crea, edita y elimina los eventos del calendario.',
        icono: ICO_PANEL_EVENTOS,
        soloInstructor: true
    },
    {
        id: 'experiencias',
        enlace: 'admin_experiencias.html',
        titulo: 'Experiencias',
        texto: 'Administra las catas y talleres que se ofrecen.',
        icono: ICO_PANEL_EXPERIENCIAS,
        soloInstructor: true
    }
];

document.addEventListener('DOMContentLoaded', function () {

    const sesion = exigirSesion();
    if (!sesion) return;

    pintarPanel(sesion);

    document.getElementById('saludo_nombre').textContent = sesion.nombre;
    document.getElementById('saludo_fecha').textContent =
        'Hoy es ' + fechaLarga() + '. Entraste como ' + sesion.rolNombre + '.';

    pintarModulos(sesion);
    cargarCifras();
});



function pintarModulos(sesion) {
    const contenedor = document.getElementById('modulos_panel');
    let html = '';

    for (let i = 0; i < MODULOS.length; i++) {
        const modulo = MODULOS[i];

        
        
        const bloqueado = modulo.soloInstructor && sesion.rol !== ROL_INSTRUCTOR;
        const clase = bloqueado ? 'tarjeta_modulo bloqueado' : 'tarjeta_modulo';

        html +=
            '<a href="' + modulo.enlace + '" class="' + clase + '">' +
            '<figure class="ico_modulo">' + modulo.icono + '</figure>' +
            '<div class="txt_modulo">' +
            '<h3>' + modulo.titulo + '</h3>' +
            '<p>' + modulo.texto + (bloqueado ? ' (sólo instructor)' : '') + '</p>' +
            '</div>' +
            '</a>';
    }

    contenedor.innerHTML = html;
}



async function cargarCifras() {
    try {
        const reservas = await apiReservasDeHoy();
        const lista = Array.isArray(reservas.datos) ? reservas.datos : [];

        let menusPedidos = 0;
        let porEntregar = 0;

        for (let i = 0; i < lista.length; i++) {
            menusPedidos += Number(lista[i].cantMenus) || 0;
            if (String(lista[i].estado).toLowerCase() !== 'entregada') porEntregar++;
        }

        document.getElementById('cifra_reservas').textContent = lista.length;
        document.getElementById('cifra_menus').textContent = menusPedidos;
        document.getElementById('cifra_pendientes').textContent = porEntregar;

    } catch (error) {
        
        
    }

    try {
        const eventos = await apiEventosActivos();
        const lista = Array.isArray(eventos.datos) ? eventos.datos : [];
        document.getElementById('cifra_eventos').textContent = lista.length;
    } catch (error) {
        
    }
}
