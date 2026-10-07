

let menuDeHoy = null;
let cantidadMenus = 1;
let registrando = false;

const MAX_MENUS_ADMIN = 10;

document.addEventListener('DOMContentLoaded', function () {

    const sesion = exigirSesion();
    if (!sesion) return;

    pintarPanel(sesion);

    cargarMenuDeHoy();
    engancharContadores();
    engancharFormulario();
});



async function cargarMenuDeHoy() {
    try {
        const respuesta = await apiMenuDelDia();

        if (respuesta.ok && !respuesta.datos.error) {
            menuDeHoy = respuesta.datos;
            document.getElementById('nombre_menu').textContent = menuDeHoy.titulo;
        } else {
            mostrarAvisoAdmin('aviso-vacio', 'Hoy no hay ningún menú activo, así que no se pueden registrar reservas.');
            document.getElementById('btn_registrar').disabled = true;
        }

    } catch (error) {
        mostrarAvisoAdmin('aviso-error', 'No se pudo conectar con el servidor.');
        document.getElementById('btn_registrar').disabled = true;
    }

    actualizarResumen();
}



function engancharContadores() {
    document.getElementById('btn_menos').addEventListener('click', function () {
        if (cantidadMenus > 1) cantidadMenus--;
        actualizarResumen();
    });

    document.getElementById('btn_mas').addEventListener('click', function () {
        if (cantidadMenus < MAX_MENUS_ADMIN) cantidadMenus++;
        actualizarResumen();
    });
}

function actualizarResumen() {
    const precio = menuDeHoy ? Number(menuDeHoy.precio) : 0;

    document.getElementById('num_menus').textContent = cantidadMenus;
    document.getElementById('resumen_cantidad').textContent = cantidadMenus;
    document.getElementById('valor_unitario').textContent = 'Valor por menú: ' + pesos(precio);
    document.getElementById('resumen_unitario').textContent = pesos(precio);
    document.getElementById('resumen_total').textContent = pesos(precio * cantidadMenus);
}



function engancharFormulario() {
    const forma = document.getElementById('forma_reserva');
    const boton = document.getElementById('btn_registrar');

    forma.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        if (registrando) return;

        const correo = document.getElementById('correo').value.trim().toLowerCase();

        if (!esCorreoInstitucional(correo)) {
            mostrarAvisoAdmin('aviso-error', 'El correo debe ser @sena.edu.co o @soy.sena.edu.co');
            return;
        }

        registrando = true;
        boton.disabled = true;
        boton.textContent = 'Registrando...';

        try {
            const respuesta = await apiRegistrarReserva(correo, cantidadMenus);
            const datos = respuesta.datos;

            if (respuesta.ok && datos.ok) {
                mostrarAvisoAdmin('aviso-ok', 'Reserva N.° ' + datos.idReserva + ' registrada para ' + correo + '.');
                forma.reset();
                cantidadMenus = 1;
                actualizarResumen();

            } else if (respuesta.estado === 409) {
                let texto = datos.mensaje;
                if (datos.idReserva) texto += ' Es la reserva N.° ' + datos.idReserva + '.';
                mostrarAvisoAdmin('aviso-vacio', texto);

            } else {
                mostrarAvisoAdmin('aviso-error', datos.mensaje || 'No se pudo registrar la reserva.');
            }

        } catch (error) {
            mostrarAvisoAdmin('aviso-error', 'No se pudo conectar con el servidor.');
        } finally {
            registrando = false;
            boton.disabled = false;
            boton.textContent = 'Registrar Reserva';
        }
    });
}

function mostrarAvisoAdmin(clase, texto) {
    const aviso = document.getElementById('aviso_reserva');
    aviso.className = 'aviso ' + clase;
    aviso.textContent = texto;
}
