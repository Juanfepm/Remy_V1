

const LLAVE_SESION = 'remy_sesion';

function guardarSesion(usuario) {
    sessionStorage.setItem(LLAVE_SESION, JSON.stringify(usuario));
}

function obtenerSesion() {
    const guardado = sessionStorage.getItem(LLAVE_SESION);
    if (!guardado) return null;
    try {
        return JSON.parse(guardado);
    } catch (error) {
        return null;
    }
}

function cerrarSesion() {
    sessionStorage.removeItem(LLAVE_SESION);
    window.location.href = 'login.html';
}


function exigirSesion() {
    const sesion = obtenerSesion();
    if (!sesion) {
        window.location.href = 'login.html';
        return null;
    }
    return sesion;
}


function exigirInstructor() {
    const sesion = exigirSesion();
    if (!sesion) return null;
    if (sesion.rol !== ROL_INSTRUCTOR) {
        alert('Esta sección es sólo para instructores.');
        window.location.href = 'dashboard.html';
        return null;
    }
    return sesion;
}


function pintarSesionEnCabezote(sesion) {
    const nombre = document.getElementById('nombre_usuario');
    const rol = document.getElementById('rol_usuario');

    if (nombre) nombre.textContent = sesion.nombre;
    if (rol) rol.textContent = sesion.rolNombre;

    const botones = document.querySelectorAll('.btn_salir');
    for (let i = 0; i < botones.length; i++) {
        botones[i].addEventListener('click', function (evento) {
            evento.preventDefault();
            cerrarSesion();
        });
    }
}
