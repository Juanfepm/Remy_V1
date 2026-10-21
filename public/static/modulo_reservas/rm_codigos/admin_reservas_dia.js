

let reservasDeHoy = [];

const ICO_PLATO =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">' +
    '<path d="M464,344.063c0-109.308-84.755-199.193-192-207.39V80H240v56.673c-107.245,8.2-192,98.082-192,207.39V377.17H464Zm-32,1.107H80v-1.107c0-97.046,78.953-176,176-176s176,78.953,176,176Z"/>' +
    '<rect width="480" height="32" x="16" y="416"/></svg>';

document.addEventListener('DOMContentLoaded', function () {

    const sesion = exigirSesion();
    if (!sesion) return;

    pintarPanel(sesion);

    document.getElementById('fecha_actual').textContent = fechaLarga();

    cargarReservas();
    engancharBuscador();
});



async function cargarReservas() {
    const aviso = document.getElementById('aviso_reservas');

    try {
        const respuesta = await apiReservasDeHoy();

        if (!respuesta.ok || !Array.isArray(respuesta.datos)) {
            aviso.className = 'aviso aviso-error';
            aviso.textContent = 'No se pudieron consultar las reservas.';
            return;
        }

        reservasDeHoy = respuesta.datos;

        if (reservasDeHoy.length === 0) {
            aviso.className = 'aviso aviso-vacio';
            aviso.textContent = 'Todavía no hay reservas para hoy.';
            document.getElementById('conteo_reservas').textContent = '0';
            document.getElementById('lista_reservas').innerHTML = '';
            return;
        }

        document.getElementById('conteo_reservas').textContent = reservasDeHoy.length;
        pintarReservas(reservasDeHoy);
        aviso.classList.add('oculto');

    } catch (error) {
        aviso.className = 'aviso aviso-error';
        aviso.textContent = 'No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos en XAMPP.';
    }
}



function pintarReservas(lista) {
    const contenedor = document.getElementById('lista_reservas');
    let html = '';

    for (let i = 0; i < lista.length; i++) {
        const reserva = lista[i];
        const entregada = String(reserva.estado).toLowerCase() === 'entregada';
        const total = (Number(reserva.cantMenus) || 0) * (Number(reserva.precioMenu) || 0);

        html +=
            '<article class="tarjeta_reserva" data-id="' + reserva.idReserva + '">' +

            '<div class="fila_reserva">' +
            '<div class="info_reserva">' +
            '<h3>' + reserva.correo + '</h3>' +
            '<p class="detalle_reserva">' + ICO_PLATO + reserva.cantMenus + ' menú(s) del día</p>' +
            '</div>' +
            '<div class="total_reserva">' +
            '<span>Total</span>' +
            '<strong class="letra-verde">' + pesos(total) + '</strong>' +
            '</div>' +
            '</div>' +

            '<hr class="separador_reserva">' +

            '<div class="fila_estado">' +
            '<p class="estado_reserva">' +
            '<span class="etiqueta ' + (entregada ? 'etiqueta-entregada' : 'etiqueta-pendiente') + '">' +
            (entregada ? 'ENTREGADA' : 'PENDIENTE') +
            '</span>' +
            '</p>' +
            '<label class="check_entregada">' +
            '<input type="checkbox" class="chk_entregada" data-id="' + reserva.idReserva + '"' +
            (entregada ? ' checked disabled' : '') + '>' +
            (entregada ? 'Ya entregada' : 'Marcar entregada') +
            '</label>' +
            '</div>' +

            '</article>';
    }

    contenedor.innerHTML = html;
    engancharChecks();
}



function engancharChecks() {
    const checks = document.querySelectorAll('.chk_entregada');

    for (let i = 0; i < checks.length; i++) {
        checks[i].addEventListener('change', async function () {

            
            
            this.disabled = true;

            const idReserva = this.dataset.id;

            try {
                const respuesta = await apiCambiarEstadoReserva(idReserva, 'entregada');

                if (respuesta.ok) {
                    
                    await cargarReservas();
                } else {
                    alert(respuesta.datos.error || 'No se pudo actualizar la reserva.');
                    this.checked = false;
                    this.disabled = false;
                }

            } catch (error) {
                alert('No se pudo conectar con el servidor.');
                this.checked = false;
                this.disabled = false;
            }
        });
    }
}



function engancharBuscador() {
    document.getElementById('buscar_reserva').addEventListener('input', function () {
        const texto = this.value.trim().toLowerCase();

        const filtradas = reservasDeHoy.filter(function (reserva) {
            return String(reserva.correo).toLowerCase().indexOf(texto) !== -1;
        });

        pintarReservas(filtradas);
    });
}
