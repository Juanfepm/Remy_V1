



const ICO_ATRAS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M15 18l-6-6 6-6"/></svg>';

const ICO_MENU_DIA =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
    '<path fill="currentColor" d="M464,344.063c0-109.308-84.755-199.193-192-207.39V80H240v56.673c-107.245,8.2-192,98.082-192,207.39V377.17H464Zm-32,1.107H80v-1.107c0-97.046,78.953-176,176-176s176,78.953,176,176Z"/>' +
    '<rect width="480" height="32" x="16" y="416" fill="currentColor"/></svg>';

const ICO_RESERVAS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3.5" y="4.5" width="17" height="16" rx="2.2"/>' +
    '<path d="M8 3v3.5M16 3v3.5M3.5 9.5h17"/>' +
    '<path d="M12 12.2l0.8 1.7 1.8 0.2-1.35 1.25 0.35 1.85L12 16.1l-1.6 0.9 0.35-1.85-1.35-1.25 1.8-0.2z" fill="currentColor" stroke="none"/></svg>';

const ICO_EVENTOS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 3.5l2.2 4.6 5 0.7-3.6 3.55 0.85 5.05L12 15l-4.45 2.4 0.85-5.05-3.6-3.55 5-0.7z"/></svg>';

const ICO_FIRMA =
    '<svg id="ico_firma" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 522.468 522.469"><g>' +
    '<path d="M325.762,70.513l-17.706-4.854c-2.279-0.76-4.524-0.521-6.707,0.715c-2.19,1.237-3.669,3.094-4.429,5.568L190.426,440.53c-0.76,2.475-0.522,4.809,0.715,6.995c1.237,2.19,3.09,3.665,5.568,4.425l17.701,4.856c2.284,0.766,4.521,0.526,6.71-0.712c2.19-1.243,3.666-3.094,4.425-5.564L332.042,81.936c0.759-2.474,0.523-4.808-0.716-6.999C330.088,72.747,328.237,71.272,325.762,70.513z"/>' +
    '<path d="M166.167,142.465c0-2.474-0.953-4.665-2.856-6.567l-14.277-14.276c-1.903-1.903-4.093-2.857-6.567-2.857s-4.665,0.955-6.567,2.857L2.856,254.666C0.95,256.569,0,258.759,0,261.233c0,2.474,0.953,4.664,2.856,6.566l133.043,133.044c1.902,1.906,4.089,2.854,6.567,2.854s4.665-0.951,6.567-2.854l14.277-14.268c1.903-1.902,2.856-4.093,2.856-6.57c0-2.471-0.953-4.661-2.856-6.563L51.107,261.233l112.204-112.201C165.217,147.13,166.167,144.939,166.167,142.465z"/>' +
    '<path d="M519.614,254.663L386.567,121.619c-1.902-1.902-4.093-2.857-6.563-2.857c-2.478,0-4.661,0.955-6.57,2.857l-14.271,14.275c-1.902,1.903-2.851,4.09-2.851,6.567s0.948,4.665,2.851,6.567l112.206,112.204L359.163,373.442c-1.902,1.902-2.851,4.093-2.851,6.563c0,2.478,0.948,4.668,2.851,6.57l14.271,14.268c1.909,1.906,4.093,2.854,6.57,2.854c2.471,0,4.661-0.951,6.563-2.854L519.614,267.8c1.903-1.902,2.854-4.096,2.854-6.57C522.468,258.755,521.517,256.565,519.614,254.663z"/>' +
    '</g></svg>';

const MARCAS =
    '<div id="cont_marcas">' +
    '<figure id="marca_sena"><img src="../rm_componentes/simbolo_sena_verde.svg" alt="SENA"></figure>' +
    '<div id="linea_vert"></div>' +
    '<figure id="marca_remy"><img src="../rm_componentes/remy_green.svg" alt="REMY"></figure>' +
    '</div>';

const FIRMA =
    '<aside id="firma_adso">' + ICO_FIRMA +
    '<div id="txt_firma">' +
    '<h1>remy version 1.0</h1>' +
    '<h3>adso grupo 3114251 - 3114265</h3>' +
    '<p>&copy; 2026 - sena cab</p>' +
    '</div></aside>';




function pintarCabezote() {
    const cabezote = document.getElementById('cabezote_titulo') || document.getElementById('cabezote_admin');
    if (!cabezote) return;

    const titulo = cabezote.dataset.titulo || 'REMY';
    const atras = cabezote.dataset.atras || '';

    const flecha = atras
        ? '<a href="' + atras + '" class="btn_volver letra-blanca" aria-label="Volver">' + ICO_ATRAS + '</a>'
        : '<span class="hueco_cabezote"></span>';

    cabezote.innerHTML =
        flecha +
        '<h1 class="letra-blanca">' + titulo + '</h1>' +
        '<span class="hueco_cabezote"></span>';
}




function pintarNavCliente() {
    const nav = document.getElementById('tabs_inferior');
    if (!nav) return;

    const activo = nav.dataset.activo || '';

    const pestanas = [
        { id: 'menu_dia', enlace: 'menu_dia.html', icono: ICO_MENU_DIA, texto: 'Menú del día' },
        { id: 'reservas', enlace: 'reservas.html', icono: ICO_RESERVAS, texto: 'Reservas' },
        { id: 'eventos', enlace: 'eventos.html', icono: ICO_EVENTOS, texto: 'Eventos' }
    ];

    let html = MARCAS;

    for (let i = 0; i < pestanas.length; i++) {
        const pestana = pestanas[i];
        const clase = pestana.id === activo ? 'tab-opc activo' : 'tab-opc';
        html +=
            '<a href="' + pestana.enlace + '" class="' + clase + '" id="tab_' + pestana.id + '">' +
            pestana.icono +
            '<span>' + pestana.texto + '</span>' +
            '</a>';
    }

    nav.innerHTML = html + FIRMA;
}



document.addEventListener('DOMContentLoaded', function () {
    pintarCabezote();
    pintarNavCliente();
});
