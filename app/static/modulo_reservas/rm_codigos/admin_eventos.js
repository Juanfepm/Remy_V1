

let eventosAdmin = [];
let guardandoEvento = false;

const ICO_CAL_EV =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>';

const ICO_RELOJ_EV =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';

document.addEventListener('DOMContentLoaded', function () {

    
    const sesion = exigirInstructor();
    if (!sesion) return;

    pintarPanel(sesion);

    cargarEventosAdmin();
    engancharBuscadorAdmin();
    engancharModalEvento();
});



async function cargarEventosAdmin() {
    const aviso = document.getElementById('aviso_eventos');

    try {
        const respuesta = await apiEventosTodos();

        if (!respuesta.ok || !Array.isArray(respuesta.datos)) {
            aviso.className = 'aviso aviso-error';
            aviso.textContent = 'No se pudieron consultar los eventos.';
            return;
        }

        eventosAdmin = respuesta.datos;

        if (eventosAdmin.length === 0) {
            aviso.className = 'aviso aviso-vacio';
            aviso.textContent = 'No hay eventos todavía. Crea el primero con el botón +.';
            document.getElementById('lista_eventos').innerHTML = '';
            return;
        }

        pintarEventosAdmin(eventosAdmin);
        aviso.classList.add('oculto');

    } catch (error) {
        aviso.className = 'aviso aviso-error';
        aviso.textContent = 'No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos en XAMPP.';
    }
}

function pintarEventosAdmin(lista) {
    const contenedor = document.getElementById('lista_eventos');
    let html = '';

    for (let i = 0; i < lista.length; i++) {
        const evento = lista[i];

        html +=
            '<article class="card-h gris">' +
            etiquetaImagen(URL_IMG_EXP, evento.imagen, evento.experiencia, 'foto_card') +
            '<div class="info">' +

            '<div>' +
            '<h2>' + evento.experiencia + '</h2>' +
            '<div class="detalle">' + ICO_CAL_EV + fechaCorta(evento.fecha_inicio) + '</div>' +
            '<div class="detalle">' + ICO_RELOJ_EV + (evento.franja_horaria || '').trim() + '</div>' +
            '<div class="cupos">Cupos: <b>' + evento.asistentes + '/' + evento.numero_personas + '</b></div>' +
            '</div>' +

            '<div class="fila_pie_card">' +
            '<span class="precio">' + pesos(evento.costo_total) + '</span>' +
            '<div class="acciones">' +
            '<button type="button" class="btn-ico editar btn_editar_evento" data-id="' + evento.id_evento + '" aria-label="Editar">' + ICO_EDITAR + '</button>' +
            '<button type="button" class="btn-ico borrar btn_borrar_evento" data-id="' + evento.id_evento + '" aria-label="Eliminar">' + ICO_BORRAR + '</button>' +
            '</div>' +
            '</div>' +

            '</div>' +
            '</article>';
    }

    contenedor.innerHTML = html;

    const editar = contenedor.querySelectorAll('.btn_editar_evento');
    for (let i = 0; i < editar.length; i++) {
        editar[i].addEventListener('click', function () {
            abrirModalEvento(this.dataset.id);
        });
    }

    const borrar = contenedor.querySelectorAll('.btn_borrar_evento');
    for (let i = 0; i < borrar.length; i++) {
        borrar[i].addEventListener('click', function () {
            borrarEvento(this.dataset.id);
        });
    }
}




function abrirModalEvento(idEvento) {
    const modal = document.getElementById('modal_evento');
    const titulo = document.getElementById('titulo_modal_evento');

    document.getElementById('aviso_modal_evento').classList.add('oculto');

    if (idEvento) {
        const evento = eventosAdmin.find(function (e) { return e.id_evento === idEvento; });
        if (!evento) return;

        titulo.textContent = 'Editar evento';
        document.getElementById('id_evento').value = evento.id_evento;
        document.getElementById('experiencia_evento').value = evento.experiencia || '';
        document.getElementById('descripcion_evento').value = evento.descripcion || '';
        document.getElementById('fecha_evento').value = fechaInput(evento.fecha_inicio);
        document.getElementById('franja_evento').value = (evento.franja_horaria || '').trim();
        document.getElementById('personas_evento').value = evento.numero_personas;
        document.getElementById('costo_evento').value = evento.costo_total;

    } else {
        titulo.textContent = 'Nuevo evento';
        document.getElementById('forma_evento').reset();
        document.getElementById('id_evento').value = '';
    }

    modal.showModal();
}

function engancharModalEvento() {
    const modal = document.getElementById('modal_evento');

    document.getElementById('btn_nuevo_evento').addEventListener('click', function () {
        abrirModalEvento('');
    });

    document.getElementById('btn_cerrar_evento').addEventListener('click', function () {
        modal.close();
    });

    document.getElementById('forma_evento').addEventListener('submit', async function (evento) {
        evento.preventDefault();
        await guardarEvento();
    });
}



async function guardarEvento() {
    if (guardandoEvento) return;

    const boton = document.getElementById('btn_guardar_evento');
    const idEvento = document.getElementById('id_evento').value;
    const fecha = document.getElementById('fecha_evento').value;
    const franja = document.getElementById('franja_evento').value.trim();

    
    const datos = {
        
        
        
        id_evento: idEvento || ('EVT' + Math.floor(Date.now() / 1000)),
        experiencia: document.getElementById('experiencia_evento').value.trim(),
        descripcion: document.getElementById('descripcion_evento').value.trim(),
        fecha_inicio: fecha + ' ' + horaDeLaFranja(franja),
        fecha_fin: fecha + ' ' + horaDeLaFranja(franja),
        franja_horaria: franja,
        numero_personas: Number(document.getElementById('personas_evento').value),
        asistentes: 0,
        costo_total: Number(document.getElementById('costo_evento').value)
    };

    guardandoEvento = true;
    boton.disabled = true;
    boton.textContent = 'Guardando...';

    try {
        const respuesta = idEvento
            ? await apiActualizarEvento(datos)
            : await apiInsertarEvento(datos);

        if (respuesta.ok && respuesta.datos.res) {
            document.getElementById('modal_evento').close();
            await cargarEventosAdmin();
        } else {
            mostrarAvisoModalEvento(respuesta.datos.error || 'No se pudo guardar el evento.');
        }

    } catch (error) {
        mostrarAvisoModalEvento('No se pudo conectar con el servidor.');
    } finally {
        guardandoEvento = false;
        boton.disabled = false;
        boton.textContent = 'Guardar';
    }
}


function horaDeLaFranja(franja) {
    const encontrado = String(franja).match(/(\d{1,2}):(\d{2})/);
    if (!encontrado) return '12:00:00';
    return String(encontrado[1]).padStart(2, '0') + ':' + encontrado[2] + ':00';
}



async function borrarEvento(idEvento) {
    const evento = eventosAdmin.find(function (e) { return e.id_evento === idEvento; });
    const nombre = evento ? evento.experiencia : idEvento;

    if (!confirm('¿Eliminar el evento "' + nombre + '"? Esta acción no se puede deshacer.')) return;

    try {
        const respuesta = await apiEliminarEvento(idEvento);

        if (respuesta.ok && respuesta.datos.res) {
            await cargarEventosAdmin();
        } else {
            alert(respuesta.datos.error || 'No se pudo eliminar el evento.');
        }

    } catch (error) {
        alert('No se pudo conectar con el servidor.');
    }
}



function engancharBuscadorAdmin() {
    document.getElementById('buscar_evento').addEventListener('input', function () {
        const texto = this.value.trim().toLowerCase();

        const filtrados = eventosAdmin.filter(function (evento) {
            return (evento.experiencia + ' ' + evento.descripcion).toLowerCase().indexOf(texto) !== -1;
        });

        pintarEventosAdmin(filtrados);
    });
}

function mostrarAvisoModalEvento(texto) {
    const aviso = document.getElementById('aviso_modal_evento');
    aviso.className = 'aviso aviso-error';
    aviso.textContent = texto;
}
