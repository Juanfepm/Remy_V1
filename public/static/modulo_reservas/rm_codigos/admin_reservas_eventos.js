

let reservasEventos = [];
let reservaActiva = null;
let guardandoReserva = false;

const ICO_CAL_MINI =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>';

const ICO_PERSONAS_MINI =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="9" cy="8" r="3.4"/><path d="M3.2 19.2c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4"/></svg>';

document.addEventListener('DOMContentLoaded', function () {

    const sesion = exigirSesion();
    if (!sesion) return;

    pintarPanel(sesion);

    cargarReservasEventos();
    engancharBuscadorEventos();
    engancharModal();
});



async function cargarReservasEventos() {
    const aviso = document.getElementById('aviso_reservas_eventos');

    try {
        const respuesta = await apiEventosTodos();

        if (!respuesta.ok || !Array.isArray(respuesta.datos)) {
            aviso.className = 'aviso aviso-error';
            aviso.textContent = 'No se pudieron consultar las reservas de eventos.';
            return;
        }

        reservasEventos = respuesta.datos;

        if (reservasEventos.length === 0) {
            aviso.className = 'aviso aviso-vacio';
            aviso.textContent = 'Todavía no hay reservas de eventos.';
            return;
        }

        pintarReservasEventos(reservasEventos);
        aviso.classList.add('oculto');

    } catch (error) {
        aviso.className = 'aviso aviso-error';
        aviso.textContent = 'No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos en XAMPP.';
    }
}

function pintarReservasEventos(lista) {
    const contenedor = document.getElementById('lista_reservas_eventos');
    let html = '';

    for (let i = 0; i < lista.length; i++) {
        const evento = lista[i];
        const cancelado = String(evento.estado).toLowerCase() === 'cancelado';

        html +=
            '<article class="tarjeta_reserva">' +

            '<div class="fila_reserva">' +
            '<div class="info_reserva">' +
            '<h3>' + evento.experiencia + '</h3>' +
            '<p class="detalle_reserva">' + ICO_CAL_MINI + fechaCorta(evento.fecha_inicio) + '</p>' +
            '<p class="detalle_reserva">' + ICO_PERSONAS_MINI + evento.numero_personas + ' personas</p>' +
            '<p class="detalle_reserva">' + evento.correo_fk + '</p>' +
            '</div>' +
            '<div class="total_reserva">' +
            '<span>Total</span>' +
            '<strong class="letra-verde">' + pesos(evento.costo_total) + '</strong>' +
            '</div>' +
            '</div>' +

            '<hr class="separador_reserva">' +

            '<div class="fila_estado">' +
            '<span class="etiqueta ' + (cancelado ? 'etiqueta-cancelada' : 'etiqueta-entregada') + '">' +
            String(evento.estado).toUpperCase() +
            '</span>' +
            '<button type="button" class="btn-capsula capsula-full fondo-azul letra-blanca btn_ver_reserva" ' +
            'data-id="' + evento.id_evento + '" style="width:auto;padding:8px 16px;font-size:0.8rem">Ver detalle</button>' +
            '</div>' +

            '</article>';
    }

    contenedor.innerHTML = html;

    const botones = contenedor.querySelectorAll('.btn_ver_reserva');
    for (let i = 0; i < botones.length; i++) {
        botones[i].addEventListener('click', function () {
            abrirReserva(this.dataset.id);
        });
    }
}



function abrirReserva(idEvento) {
    reservaActiva = reservasEventos.find(function (evento) {
        return evento.id_evento === idEvento;
    });
    if (!reservaActiva) return;

    document.getElementById('nombre_evento_modal').textContent = reservaActiva.experiencia;
    document.getElementById('detalle_evento_modal').textContent =
        reservaActiva.correo_fk + ' · ' + (reservaActiva.franja_horaria || '').trim() +
        ' · ' + String(reservaActiva.estado).toUpperCase();
    document.getElementById('editar_fecha').value = fechaInput(reservaActiva.fecha_inicio);
    document.getElementById('editar_franja').value = (reservaActiva.franja_horaria || '').trim();
    document.getElementById('editar_personas').value = reservaActiva.numero_personas;

    ocultarConfirmacion();
    document.getElementById('aviso_modal_reserva').classList.add('oculto');

    
    const yaCancelado = String(reservaActiva.estado).toLowerCase() === 'cancelado';
    document.getElementById('btn_cancelar_reserva').classList.toggle('oculto', yaCancelado);
    document.getElementById('btn_guardar_reserva').classList.toggle('oculto', yaCancelado);
    document.getElementById('editar_fecha').disabled = yaCancelado;
    document.getElementById('editar_franja').disabled = yaCancelado;
    document.getElementById('editar_personas').disabled = yaCancelado;

    document.getElementById('modal_reserva').showModal();
}




async function guardarCambiosReserva() {
    if (guardandoReserva || !reservaActiva) return;

    const boton = document.getElementById('btn_guardar_reserva');
    const fecha = document.getElementById('editar_fecha').value;
    const franja = document.getElementById('editar_franja').value.trim();
    const personas = Number(document.getElementById('editar_personas').value);

    if (!fecha) {
        mostrarAvisoModalReserva('aviso-error', 'Escoge la fecha del evento.');
        return;
    }
    if (personas < 1) {
        mostrarAvisoModalReserva('aviso-error', 'El número de personas debe ser mayor que cero.');
        return;
    }

    
    
    const encontrado = franja.match(/(\d{1,2}):(\d{2})/);
    const hora = encontrado
        ? String(encontrado[1]).padStart(2, '0') + ':' + encontrado[2] + ':00'
        : '12:00:00';

    const datos = {
        id_evento: reservaActiva.id_evento,
        experiencia: reservaActiva.experiencia,
        descripcion: reservaActiva.descripcion || '',
        fecha_inicio: fecha + ' ' + hora,
        fecha_fin: fecha + ' ' + hora,
        franja_horaria: franja,
        numero_personas: personas,
        costo_total: Number(reservaActiva.costo_total) || 0
    };

    guardandoReserva = true;
    boton.disabled = true;
    boton.textContent = 'Guardando...';

    try {
        const respuesta = await apiActualizarEvento(datos);

        if (respuesta.ok && respuesta.datos.res) {
            document.getElementById('modal_reserva').close();
            await cargarReservasEventos();
        } else {
            mostrarAvisoModalReserva('aviso-error', respuesta.datos.error || 'No se pudieron guardar los cambios.');
        }

    } catch (error) {
        mostrarAvisoModalReserva('aviso-error', 'No se pudo conectar con el servidor.');
    } finally {
        guardandoReserva = false;
        boton.disabled = false;
        boton.textContent = 'Guardar cambios';
    }
}

function mostrarAvisoModalReserva(clase, texto) {
    const aviso = document.getElementById('aviso_modal_reserva');
    aviso.className = 'aviso ' + clase;
    aviso.textContent = texto;
}

function engancharModal() {
    const modal = document.getElementById('modal_reserva');

    document.getElementById('btn_cerrar_modal').addEventListener('click', function () {
        modal.close();
    });

    document.getElementById('btn_guardar_reserva').addEventListener('click', guardarCambiosReserva);

    document.getElementById('btn_cancelar_reserva').addEventListener('click', function () {
        
        
        document.getElementById('confirmar_cancelacion').classList.remove('oculto');
        document.getElementById('fila_confirmar').classList.remove('oculto');
        document.getElementById('fila_acciones').classList.add('oculto');
        this.classList.add('oculto');
    });

    document.getElementById('btn_confirmar_no').addEventListener('click', ocultarConfirmacion);

    document.getElementById('btn_confirmar_si').addEventListener('click', async function () {
        if (!reservaActiva) return;

        this.disabled = true;
        this.textContent = 'Cancelando...';

        try {
            const respuesta = await apiCancelarEvento(reservaActiva.id_evento);

            if (respuesta.ok) {
                modal.close();
                await cargarReservasEventos();
            } else {
                alert(respuesta.datos.error || 'No se pudo cancelar la reserva.');
            }

        } catch (error) {
            alert('No se pudo conectar con el servidor.');
        } finally {
            this.disabled = false;
            this.textContent = 'Sí, cancelar';
        }
    });
}

function ocultarConfirmacion() {
    document.getElementById('confirmar_cancelacion').classList.add('oculto');
    document.getElementById('fila_confirmar').classList.add('oculto');
    document.getElementById('fila_acciones').classList.remove('oculto');
    document.getElementById('btn_cancelar_reserva').classList.remove('oculto');
}



function engancharBuscadorEventos() {
    document.getElementById('buscar_evento').addEventListener('input', function () {
        const texto = this.value.trim().toLowerCase();

        const filtradas = reservasEventos.filter(function (evento) {
            return (evento.experiencia + ' ' + evento.correo_fk).toLowerCase().indexOf(texto) !== -1;
        });

        pintarReservasEventos(filtradas);
    });
}
