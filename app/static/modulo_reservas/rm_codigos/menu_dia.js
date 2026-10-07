

let menuActivo = null;
let cantidad = 1;
let enviando = false;

const MAX_MENUS = 10;

document.addEventListener('DOMContentLoaded', function () {
    cargarMenuDelDia();
    engancharContadores();
    engancharFormulario();
    engancharAvisoDeCorreo();
});



async function cargarMenuDelDia() {
    const aviso = document.getElementById('aviso_menu');
    const tarjeta = document.getElementById('tarjeta_menu');

    try {
        const respuesta = await apiMenuDelDia();

        if (!respuesta.ok || respuesta.datos.error) {

            
            
            if (respuesta.datos && respuesta.datos.error) {
                mostrarSinMenu();
            } else {
                aviso.className = 'aviso aviso-error';
                aviso.textContent = 'No se pudo cargar el menú de hoy. Intenta más tarde.';
            }
            return;
        }

        menuActivo = respuesta.datos;

        document.getElementById('titulo_menu').textContent = menuActivo.titulo;
        document.getElementById('txt_descripcion').textContent = menuActivo.descripcion;

        
        ponerImagen('img_plato_fuerte', menuActivo.imagenPlatoFuerte);
        ponerImagen('img_bebida', menuActivo.imagenBebida);
        ponerImagen('img_entrada', menuActivo.imagenEntrada);
        ponerImagen('img_postre', menuActivo.imagenPostre);

        actualizarTotal();

        aviso.classList.add('oculto');
        document.getElementById('sin_menu').classList.add('oculto');
        tarjeta.classList.remove('oculto');

    } catch (error) {
        aviso.className = 'aviso aviso-error';
        aviso.textContent = 'No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos en XAMPP.';
    }
}

function mostrarSinMenu() {
    document.getElementById('aviso_menu').classList.add('oculto');
    document.getElementById('tarjeta_menu').classList.add('oculto');
    document.getElementById('sin_menu').classList.remove('oculto');
}



function ponerImagen(id, ruta) {
    if (!ruta) return;
    const imagen = document.getElementById(id);
    if (imagen) imagen.src = URL_BACKEND + ruta;
}



function engancharContadores() {
    document.getElementById('btn_menos').addEventListener('click', function () {
        if (cantidad > 1) cantidad--;
        actualizarTotal();
    });

    document.getElementById('btn_mas').addEventListener('click', function () {
        if (cantidad < MAX_MENUS) cantidad++;
        actualizarTotal();
    });
}

function actualizarTotal() {
    document.getElementById('num_platos').textContent = cantidad;
    const precio = menuActivo ? Number(menuActivo.precio) : 0;
    document.getElementById('valor_menu').textContent = pesos(precio * cantidad);
}



function engancharAvisoDeCorreo() {
    const campo = document.getElementById('correo');

    
    
    campo.addEventListener('blur', async function () {
        const correo = campo.value.trim().toLowerCase();
        if (!esCorreoInstitucional(correo)) return;

        try {
            const respuesta = await apiReservaDeHoy(correo);
            if (respuesta.ok && respuesta.datos.tieneReserva) {
                mostrarAviso(
                    'aviso-vacio',
                    'Este correo ya tiene la reserva N.° ' + respuesta.datos.idReserva +
                    ' para hoy (' + respuesta.datos.cantMenus + ' menú(s)). No se puede reservar dos veces el mismo día.'
                );
                document.getElementById('btn_reservar').disabled = true;
            } else {
                ocultarAviso();
                document.getElementById('btn_reservar').disabled = false;
            }
        } catch (error) {
            
            
        }
    });
}



function engancharFormulario() {
    const forma = document.getElementById('forma_reserva');
    const boton = document.getElementById('btn_reservar');

    forma.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        
        if (enviando) return;

        const correo = document.getElementById('correo').value.trim().toLowerCase();

        if (!esCorreoInstitucional(correo)) {
            mostrarAviso('aviso-error', 'Usa tu correo institucional @sena.edu.co o @soy.sena.edu.co');
            return;
        }

        enviando = true;
        boton.disabled = true;
        boton.textContent = 'Guardando...';
        ocultarAviso();

        try {
            const respuesta = await apiRegistrarReserva(correo, cantidad);
            const datos = respuesta.datos;

            if (respuesta.ok && datos.ok) {
                
                
                let texto = datos.mensaje + ' Tu número de reserva es el ' + datos.idReserva + '.';
                texto += datos.correoEnviado
                    ? ' Te enviamos la confirmación a ' + correo + '.'
                    : ' (No se pudo enviar el correo de confirmación, pero tu reserva está guardada.)';

                mostrarAviso('aviso-ok', texto);
                
                
                boton.textContent = 'Reserva registrada';
                forma.reset();
                return;
            }

            if (respuesta.estado === 409) {
                
                let texto = datos.mensaje;
                if (datos.idReserva) texto += ' (reserva N.° ' + datos.idReserva + ')';
                mostrarAviso('aviso-vacio', texto);
                boton.textContent = 'Ya tienes reserva hoy';
                return;
            }

            mostrarAviso('aviso-error', datos.mensaje || 'No se pudo guardar la reserva.');
            boton.disabled = false;
            boton.textContent = 'Reservar menú';

        } catch (error) {
            mostrarAviso('aviso-error', 'No se pudo conectar con el servidor.');
            boton.disabled = false;
            boton.textContent = 'Reservar menú';
        } finally {
            enviando = false;
        }
    });
}



function mostrarAviso(clase, texto) {
    const aviso = document.getElementById('aviso_reserva');
    aviso.className = 'aviso ' + clase;
    aviso.textContent = texto;
}

function ocultarAviso() {
    document.getElementById('aviso_reserva').classList.add('oculto');
}
