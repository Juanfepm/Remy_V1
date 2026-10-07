


async function pedir(ruta, opciones) {
    const respuesta = await fetch(URL_BACKEND + ruta, opciones);
    const texto = await respuesta.text();

    let datos;
    try {
        datos = texto ? JSON.parse(texto) : {};
    } catch (error) {
        
        
        datos = { mensaje: texto };
    }

    return { ok: respuesta.ok, estado: respuesta.status, datos: datos };
}

function comoFormulario(objeto) {
    const cuerpo = new URLSearchParams();
    for (const clave in objeto) {
        cuerpo.append(clave, objeto[clave]);
    }
    return {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: cuerpo.toString()
    };
}

function comoJson(objeto, metodo) {
    return {
        method: metodo || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objeto)
    };
}



function apiLogin(correo, palabra) {
    return pedir('login.php', comoFormulario({ usuario: correo, palabra: palabra }));
}



function apiMenuDelDia() {
    return pedir('menu_dia.php');
}

function apiMenusActivos() {
    return pedir('consulta_Menus.php');
}



function apiRegistrarReserva(correo, cantidad) {
    return pedir('registrarReserva.php', comoFormulario({ correo: correo, cantidad: cantidad }));
}

function apiReservaDeHoy(correo) {
    return pedir('consulta_reserva_dia.php?correo=' + encodeURIComponent(correo));
}

function apiReservasDeHoy() {
    return pedir('listar_reservas_hoy.php');
}

function apiCambiarEstadoReserva(idReserva, estado) {
    return pedir('actualizar_estado_reserva.php', comoFormulario({ id_reserva: idReserva, estado: estado }));
}



function apiEventosCliente() {
    return pedir('consultaEventosCliente.php');
}

function apiEventosTodos() {
    return pedir('consultaEvento.php');
}

function apiEventosActivos() {
    return pedir('listar_eventos.php');
}

function apiEventoPorId(idEvento) {
    return pedir('listar_evento_id.php?id_evento=' + encodeURIComponent(idEvento));
}


function apiConfirmarAsistencia(idEvento, correo) {
    return pedir('confirmar_asistencia.php', comoFormulario({ id_evento: idEvento, correo: correo }));
}

function apiCupoDelDia(fecha) {
    return pedir('consulta_cupo.php?fecha=' + encodeURIComponent(fecha));
}

function apiCrearEventoCliente(evento) {
    return pedir('crear_evento.php', comoJson(evento));
}

function apiInsertarEvento(evento) {
    return pedir('insertarEvento.php', comoJson(evento));
}

function apiActualizarEvento(evento) {
    return pedir('actualizarEvento.php', comoJson(evento));
}

function apiEliminarEvento(idEvento) {
    return pedir('eliminarEvento.php?id=' + encodeURIComponent(idEvento), { method: 'DELETE' });
}

function apiCancelarEvento(idEvento) {
    return pedir('cancelar_evento.php?id_evento=' + encodeURIComponent(idEvento) + '&estado=cancelado', { method: 'POST' });
}



function apiExperienciasActivas() {
    return pedir('consultaExperiencias.php');
}

function apiExperienciasTodas() {
    return pedir('consultaExperiencia.php');
}

function apiInsertarExperiencia(experiencia) {
    return pedir('insertarExperiencia.php', comoJson(experiencia));
}

function apiActualizarExperiencia(experiencia) {
    return pedir('actualizarExperiencia.php', comoJson(experiencia));
}

function apiEliminarExperiencia(idExperiencia) {
    return pedir('eliminarExperiencia.php?id=' + encodeURIComponent(idExperiencia));
}
