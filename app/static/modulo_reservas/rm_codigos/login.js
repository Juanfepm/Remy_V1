

let entrando = false;

document.addEventListener('DOMContentLoaded', function () {

    if (obtenerSesion()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const forma = document.getElementById('forma_entrar');
    const boton = document.getElementById('btn-ingresar');

    forma.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        if (entrando) return;

        const correo = document.getElementById('usuario').value.trim().toLowerCase();
        const palabra = document.getElementById('palabra').value;

        if (!esCorreoInstitucional(correo)) {
            mostrarAvisoLogin('aviso-error', 'Usa tu correo institucional @sena.edu.co o @soy.sena.edu.co');
            return;
        }

        if (!/^[0-9]{10}$/.test(palabra)) {
            mostrarAvisoLogin('aviso-error', 'La contraseña son los 10 dígitos de tu número de teléfono.');
            return;
        }

        entrando = true;
        boton.disabled = true;
        boton.textContent = 'ENTRANDO...';

        try {
            const respuesta = await apiLogin(correo, palabra);

            if (respuesta.ok && respuesta.datos.ok) {
                guardarSesion(respuesta.datos);
                window.location.href = 'dashboard.html';
                return;
            }

            mostrarAvisoLogin('aviso-error', respuesta.datos.mensaje || 'No se pudo iniciar sesión.');

        } catch (error) {
            mostrarAvisoLogin('aviso-error', 'No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos en XAMPP.');
        } finally {
            entrando = false;
            boton.disabled = false;
            boton.textContent = 'ENTRAR';
        }
    });
});

function mostrarAvisoLogin(clase, texto) {
    const aviso = document.getElementById('aviso_login');
    aviso.className = 'aviso ' + clase;
    aviso.textContent = texto;
}
