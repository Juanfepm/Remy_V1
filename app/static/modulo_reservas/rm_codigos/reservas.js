

const LLAVE_RESERVA = 'remy_reserva';

let menus = [];
let experiencias = [];

document.addEventListener('DOMContentLoaded', function () {
    cargarMenus();
    cargarExperiencias();
    engancharPasos();
});



function leerBorrador() {
    const guardado = sessionStorage.getItem(LLAVE_RESERVA);
    if (!guardado) return {};
    try {
        return JSON.parse(guardado);
    } catch (error) {
        return {};
    }
}

function guardarBorrador(datos) {
    const borrador = Object.assign(leerBorrador(), datos);
    sessionStorage.setItem(LLAVE_RESERVA, JSON.stringify(borrador));
}



async function cargarMenus() {
    const aviso = document.getElementById('aviso_menus');
    const lista = document.getElementById('lista_menus');

    try {
        const respuesta = await apiMenusActivos();

        if (!respuesta.ok || !Array.isArray(respuesta.datos) || respuesta.datos.length === 0) {
            aviso.className = 'aviso aviso-vacio';
            aviso.textContent = 'Por ahora no hay menús publicados.';
            return;
        }

        menus = respuesta.datos;
        let html = '';

        for (let i = 0; i < menus.length; i++) {
            const menu = menus[i];
            const marcado = i === 0 ? ' checked' : '';

            html +=
                '<li class="tarjeta_menu">' +
                '<label>' +
                '<figure class="img_menu">' +
                etiquetaImagen(URL_IMG_MENU, menu.ImgMenu, menu.Nombre, '') +
                '</figure>' +
                '<div class="info_menu">' +
                '<div class="fila_titulo">' +
                '<h3>' + menu.Nombre + '</h3>' +
                '<input type="radio" name="id_menu" value="' + menu.IdMenu + '"' + marcado + '>' +
                '</div>' +
                '<p class="descripcion_menu">' + (menu.Descripcion || '') + '</p>' +
                '<div class="fila_footer">' +
                '<span class="tiempos_menu">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
                '<path fill="currentColor" d="M464,344.063c0-109.308-84.755-199.193-192-207.39V80H240v56.673c-107.245,8.2-192,98.082-192,207.39V377.17H464Zm-32,1.107H80v-1.107c0-97.046,78.953-176,176-176s176,78.953,176,176Z"/>' +
                '<rect width="480" height="32" x="16" y="416" fill="currentColor"/>' +
                '</svg>' +
                menu.TiemposMenu + ' tiempos' +
                '</span>' +
                '<span class="precio_menu letra-verde">' + pesos(menu.Precio) + '</span>' +
                '</div>' +
                '</div>' +
                '</label>' +
                '</li>';
        }

        lista.innerHTML = html;
        aviso.classList.add('oculto');

    } catch (error) {
        aviso.className = 'aviso aviso-error';
        aviso.textContent = 'No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos en XAMPP.';
    }
}



async function cargarExperiencias() {
    const lista = document.getElementById('lista_experiencias');

    try {
        const respuesta = await apiExperienciasActivas();
        if (!respuesta.ok || !Array.isArray(respuesta.datos)) return;

        experiencias = respuesta.datos;
        let html = '';

        for (let i = 0; i < experiencias.length; i++) {
            const experiencia = experiencias[i];

            html +=
                '<li class="tarjeta_experiencia">' +
                '<figure class="img_experiencia">' +
                etiquetaImagen(URL_IMG_EXP, experiencia.ImgExperiencia, experiencia.Nombre, '') +
                '</figure>' +
                '<div class="velo_experiencia"></div>' +
                '<div class="info_experiencia">' +
                '<span class="sello_experiencia fondo-naranja letra-blanca">Experiencia</span>' +
                '<h3 class="letra-blanca">¿Deseas agregar a tu reserva la experiencia <b>de ' + experiencia.Nombre + '?</b></h3>' +
                '<div class="fila_experiencia">' +
                '<span class="precio_experiencia letra-verde-lite">' + pesos(experiencia.Precio) + '</span>' +
                '<button type="button" class="btn-capsula capsula-full fondo-verde letra-blanca btn_sumar_experiencia" data-indice="' + i + '">Si quiero</button>' +
                '</div>' +
                '</div>' +
                '</li>';
        }

        lista.innerHTML = html;

        const botones = lista.querySelectorAll('.btn_sumar_experiencia');
        for (let i = 0; i < botones.length; i++) {
            botones[i].addEventListener('click', function () {
                const elegida = experiencias[Number(this.dataset.indice)];
                guardarBorrador({
                    idExperiencia: elegida.IdExperiencia,
                    nombreExperiencia: elegida.Nombre,
                    precioExperiencia: Number(elegida.Precio) || 0
                });
                window.location.href = 'datos_reserva.html';
            });
        }

    } catch (error) {
        lista.innerHTML = '<li><p class="aviso aviso-error">No se pudieron cargar las experiencias.</p></li>';
    }
}



function engancharPasos() {
    const capa = document.getElementById('capa_experiencias');

    document.getElementById('btn_continuar').addEventListener('click', function () {
        const marcado = document.querySelector('input[name="id_menu"]:checked');

        if (!marcado) {
            alert('Selecciona primero un menú.');
            return;
        }

        const menu = menus.find(function (m) { return m.IdMenu === marcado.value; });

        guardarBorrador({
            idMenu: menu.IdMenu,
            nombreMenu: menu.Nombre,
            precioMenu: Number(menu.Precio) || 0,
            
            idExperiencia: null,
            nombreExperiencia: null,
            precioExperiencia: 0
        });

        capa.classList.remove('oculto');
    });

    document.getElementById('btn_sin_experiencia').addEventListener('click', function () {
        window.location.href = 'datos_reserva.html';
    });
}
