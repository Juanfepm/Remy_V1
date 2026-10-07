

const URL_BACKEND = 'http://localhost/Remy_V1/app/modulo_reservas/services/';


const URL_IMG_MENU = URL_BACKEND + 'img_menu/';
const URL_IMG_EXP = URL_BACKEND + 'img_exp/';


const ROL_INSTRUCTOR = 1;
const ROL_APRENDIZ = 2;



const PATRON_CORREO = /^[a-z0-9._%+-]+@(soy\.sena\.edu\.co|sena\.edu\.co)$/i;

function esCorreoInstitucional(correo) {
    return PATRON_CORREO.test(String(correo || '').trim());
}


function pesos(valor) {
    const numero = Number(valor) || 0;
    return '$' + numero.toLocaleString('es-CO');
}


function fechaLarga(texto) {
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const fecha = texto ? new Date(String(texto).replace(' ', 'T')) : new Date();
    if (isNaN(fecha)) return String(texto || '');
    return fecha.getDate() + ' de ' + meses[fecha.getMonth()] + ' del ' + fecha.getFullYear();
}


function fechaCorta(texto) {
    const fecha = texto ? new Date(String(texto).replace(' ', 'T')) : new Date();
    if (isNaN(fecha)) return String(texto || '');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return dia + '/' + mes + '/' + fecha.getFullYear();
}


function fechaInput(texto) {
    return String(texto || '').substring(0, 10);
}


function etiquetaImagen(carpeta, archivo, alt, clase) {
    const respaldo = carpeta + 'cafe.jpg';
    const ruta = carpeta + encodeURIComponent(archivo || 'cafe.jpg');

    return '<img' + (clase ? ' class="' + clase + '"' : '') +
        ' src="' + ruta + '"' +
        ' alt="' + String(alt || '').replace(/"/g, '&quot;') + '"' +
        ' onerror="this.onerror=null;this.src=\'' + respaldo + '\'">';
}
