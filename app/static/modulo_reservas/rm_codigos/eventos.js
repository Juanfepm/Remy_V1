

let proximosEventos = [];
let miniEventoActivo = null;
let confirmandoAsistencia = false;

const ICO_COPA =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M19 3H5v4c0 3.28 2.27 6.03 5.34 6.78L10.34 19H6v2h12v-2h-4.34l0-5.22C16.73 13.03 19 10.28 19 7V3z"/></svg>';

const ICO_CALENDARIO =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>';

document.addEventListener('DOMContentLoaded', function () {
    cargarEventos();
    engancharVerTodos();
    engancharModalAsistencia();
});

async function cargarEventos() {
    const avisoHoy = document.getElementById('aviso_hoy');
    const avisoProximos = document.getElementById('aviso_proximos');

    try {
        const respuesta = await apiEventosCliente();

        if (!respuesta.ok) {
            avisoHoy.className = 'aviso aviso-error';
            avisoHoy.textContent = 'No se pudieron consultar los eventos.';
            avisoProximos.classList.add('oculto');
            return;
        }

        pintarEventoDeHoy(respuesta.datos.disponible_hoy);
        pintarProximos(respuesta.datos.proximos || []);

    } catch (error) {
        avisoHoy.className = 'aviso aviso-error';
        avisoHoy.textContent = 'No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos en XAMPP.';
        avisoProximos.classList.add('oculto');
    }
}



function pintarEventoDeHoy(evento) {
    const aviso = document.getElementById('aviso_hoy');
    const tarjeta = document.getElementById('evento_hoy');

    if (!evento) {
        aviso.className = 'aviso aviso-vacio';
        aviso.textContent = 'Hoy no hay ningún evento programado. Mira los próximos aquí abajo.';
        return;
    }

    const cuposLibres = Math.max(0, Number(evento.numero_personas) - Number(evento.asistentes));
    const fecha = new Date(String(evento.fecha_inicio).replace(' ', 'T'));
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    tarjeta.innerHTML =
        etiquetaImagen(URL_IMG_EXP, evento.imagen, evento.experiencia, 'foto_evento') +
        '<div class="hoy-cont">' +

        '<div class="titulo_evento">' +
        '<figure class="ico_evento">' + ICO_COPA + '</figure>' +
        '<strong>' + evento.experiencia + '</strong>' +
        '</div>' +

        '<div class="hoy-grid">' +
        '<div class="hoy-item"><strong>' + fechaLarga(evento.fecha_inicio) + '</strong><span>' + dias[fecha.getDay()] + '</span></div>' +
        '<div class="hoy-sep"></div>' +
        '<div class="hoy-item"><strong>' + (evento.franja_horaria || '').trim() + '</strong><span>Franja</span></div>' +
        '<div class="hoy-sep"></div>' +
        '<div class="hoy-item"><strong>' + cuposLibres + ' cupos</strong><span>Disponibles</span></div>' +
        '</div>' +

        '<div class="desc-precio-fila">' +
        '<p class="desc_evento">' + (evento.descripcion || '') + '</p>' +
        '<div class="precio_evento"><span>Precio persona</span><strong>' + pesos(evento.costo_total) + '</strong></div>' +
        '</div>' +

        '<button type="button" class="btn-reservar" id="btn_asistir_hoy">' + ICO_CALENDARIO + 'Confirmar asistencia</button>' +
        '</div>';

    aviso.classList.add('oculto');
    tarjeta.classList.remove('oculto');

    
    document.getElementById('btn_asistir_hoy').addEventListener('click', function () {
        abrirAsistencia(evento);
    });
}



function pintarProximos(proximos) {
    const aviso = document.getElementById('aviso_proximos');
    const lista = document.getElementById('lista_proximos');

    proximosEventos = proximos;

    if (proximos.length === 0) {
        aviso.className = 'aviso aviso-vacio';
        aviso.textContent = 'Todavía no hay próximos eventos publicados.';
        return;
    }

    let html = '';

    for (let i = 0; i < proximos.length; i++) {
        const evento = proximos[i];
        const cuposLibres = Math.max(0, Number(evento.numero_personas) - Number(evento.asistentes));

        html +=
            '<button type="button" class="card-v" data-indice="' + i + '">' +
            '<div class="img-box">' +
            etiquetaImagen(URL_IMG_EXP, evento.imagen, evento.experiencia, '') +
            '</div>' +
            '<h3>' + evento.experiencia + '</h3>' +
            '<p>' + fechaLarga(evento.fecha_inicio) + '</p>' +
            '<p>' + (evento.franja_horaria || '').trim() + '</p>' +
            '<p>' + cuposLibres + ' cupos disponibles</p>' +
            '<strong class="precio_card">' + pesos(evento.costo_total) + '</strong>' +
            '</button>';
    }

    lista.innerHTML = html;
    aviso.classList.add('oculto');

    const tarjetas = lista.querySelectorAll('.card-v');
    for (let i = 0; i < tarjetas.length; i++) {
        tarjetas[i].addEventListener('click', function () {
            abrirAsistencia(proximosEventos[Number(this.dataset.indice)]);
        });
    }

    revisarSiCaben();
}


function revisarSiCaben() {
    const lista = document.getElementById('lista_proximos');
    const boton = document.getElementById('btn_ver_todos');

    const sobran = lista.scrollWidth > lista.clientWidth + 1;

    boton.classList.toggle('oculto', !sobran && !lista.classList.contains('expandido'));
}

function engancharVerTodos() {
    const lista = document.getElementById('lista_proximos');
    const boton = document.getElementById('btn_ver_todos');

    boton.addEventListener('click', function () {
        const expandido = lista.classList.toggle('expandido');
        boton.textContent = expandido ? 'Ver menos' : 'Ver todos >';
    });

    
    
    window.addEventListener('resize', function () {
        if (!lista.classList.contains('expandido')) revisarSiCaben();
    });
}



function abrirAsistencia(evento) {
    miniEventoActivo = evento;

    const cuposLibres = Math.max(0, Number(evento.numero_personas) - Number(evento.asistentes));

    document.getElementById('nombre_mini_evento').textContent = evento.experiencia;
    document.getElementById('detalle_mini_evento').textContent =
        fechaLarga(evento.fecha_inicio) + ' · ' + (evento.franja_horaria || '').trim() +
        ' · ' + pesos(evento.costo_total) + ' por persona · ' + cuposLibres + ' cupos';

    document.getElementById('forma_asistencia').reset();
    document.getElementById('aviso_asistencia').classList.add('oculto');

    const boton = document.getElementById('btn_confirmar_asistencia');
    boton.disabled = cuposLibres === 0;
    boton.textContent = cuposLibres === 0 ? 'Sin cupos' : 'Confirmar asistencia';

    document.getElementById('modal_asistencia').showModal();
}

function engancharModalAsistencia() {
    const modal = document.getElementById('modal_asistencia');
    const forma = document.getElementById('forma_asistencia');
    const boton = document.getElementById('btn_confirmar_asistencia');

    document.getElementById('btn_cerrar_asistencia').addEventListener('click', function () {
        modal.close();
    });

    forma.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        
        
        if (confirmandoAsistencia || !miniEventoActivo) return;

        const correo = document.getElementById('correo_asistencia').value.trim().toLowerCase();

        if (!esCorreoInstitucional(correo)) {
            mostrarAvisoAsistencia('aviso-error', 'Usa tu correo institucional @sena.edu.co o @soy.sena.edu.co');
            return;
        }

        confirmandoAsistencia = true;
        boton.disabled = true;
        boton.textContent = 'Confirmando...';

        try {
            const respuesta = await apiConfirmarAsistencia(miniEventoActivo.id_evento, correo);
            const datos = respuesta.datos;

            if (respuesta.ok && datos.ok) {
                let texto = '¡Listo! Tu asistencia a "' + datos.experiencia + '" quedó confirmada.';
                texto += datos.correoEnviado
                    ? ' Te llegó la confirmación a ' + correo + '.'
                    : ' (No se pudo enviar el correo de confirmación, pero tu cupo está guardado.)';

                mostrarAvisoAsistencia('aviso-ok', texto);
                boton.textContent = 'Asistencia confirmada';

                
                await cargarEventos();
                return;
            }

            mostrarAvisoAsistencia(
                respuesta.estado === 409 ? 'aviso-vacio' : 'aviso-error',
                datos.mensaje || 'No se pudo confirmar la asistencia.'
            );
            boton.disabled = false;
            boton.textContent = 'Confirmar asistencia';

        } catch (error) {
            mostrarAvisoAsistencia('aviso-error', 'No se pudo conectar con el servidor.');
            boton.disabled = false;
            boton.textContent = 'Confirmar asistencia';
        } finally {
            confirmandoAsistencia = false;
        }
    });
}

function mostrarAvisoAsistencia(clase, texto) {
    const aviso = document.getElementById('aviso_asistencia');
    aviso.className = 'aviso ' + clase;
    aviso.textContent = texto;
}
