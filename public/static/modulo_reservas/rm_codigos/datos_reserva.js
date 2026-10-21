

const DIAS_ANTICIPACION = 8;
const MIN_PERSONAS = 20;
const MAX_PERSONAS = 40;
const DIAS_EN_TIRA = 14;

const HORA_INICIO = 8;
const HORA_FIN = 20;

let borrador = {};
let fechaElegida = '';
let inicioTira = '';   
let mesVisible = '';
let fechasSinCupo = new Set();
let enviando = false;

document.addEventListener('DOMContentLoaded', async function () {
    borrador = leerBorrador();

    if (!borrador.idMenu) {
        
        window.location.href = 'reservas.html';
        return;
    }

    pintarHoras();
    pintarResumen();
    engancharPersonas();
    engancharFlechas();
    engancharNavegacionMes();
    engancharTiraDeDias();
    engancharFormulario();

    inicioTira = siguienteHabil(sumarDias(hoyTexto(), DIAS_ANTICIPACION));
    fechaElegida = inicioTira;
    mesVisible = inicioTira.substring(0, 7);

    await refrescarDias();
});



function leerBorrador() {
    const guardado = sessionStorage.getItem('remy_reserva');
    if (!guardado) return {};
    try {
        return JSON.parse(guardado);
    } catch (error) {
        return {};
    }
}



function hoyTexto() {
    const hoy = new Date();
    return hoy.getFullYear() + '-' +
        String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
        String(hoy.getDate()).padStart(2, '0');
}

function sumarDias(texto, dias) {
    const fecha = new Date(texto + 'T00:00:00');
    fecha.setDate(fecha.getDate() + dias);
    return fecha.getFullYear() + '-' +
        String(fecha.getMonth() + 1).padStart(2, '0') + '-' +
        String(fecha.getDate()).padStart(2, '0');
}

function esFinDeSemana(texto) {
    const dia = new Date(texto + 'T00:00:00').getDay();
    return dia === 0 || dia === 6;
}

function siguienteHabil(texto) {
    let fecha = texto;
    while (esFinDeSemana(fecha)) {
        fecha = sumarDias(fecha, 1);
    }
    return fecha;
}

function mesCorto(texto) {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return meses[Number(texto.substring(5, 7)) - 1];
}

function mesLargo(texto) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[Number(texto.substring(5, 7)) - 1] + ' ' + texto.substring(0, 4);
}



function etiquetaHora(hora) {
    const sufijo = hora < 12 ? 'am' : 'pm';
    let doce = hora % 12;
    if (doce === 0) doce = 12;
    return doce + ':00 ' + sufijo;
}

function pintarHoras() {
    const lista = document.getElementById('lista_horas');
    let html = '';

    for (let hora = HORA_INICIO; hora <= HORA_FIN; hora++) {
        const valor = String(hora).padStart(2, '0') + ':00';
        const marcado = hora === HORA_INICIO ? ' checked' : '';

        html +=
            '<li>' +
            '<label class="hora_chip">' +
            '<input type="radio" name="hora_reserva" value="' + valor + '" required' + marcado + '>' +
            etiquetaHora(hora) +
            '</label>' +
            '</li>';
    }

    lista.innerHTML = html;
}




async function refrescarDias() {
    const tira = document.getElementById('tira_dias');
    tira.innerHTML = '<p class="aviso aviso-cargando">Consultando días disponibles...</p>';

    const fechas = [];
    for (let i = 0; i < DIAS_EN_TIRA; i++) {
        fechas.push(sumarDias(inicioTira, i));
    }

    let cupos = [];
    try {
        cupos = await Promise.all(fechas.map(function (fecha) { return apiCupoDelDia(fecha); }));
    } catch (error) {
        tira.innerHTML = '<p class="aviso aviso-error">No se pudo consultar la disponibilidad.</p>';
        return;
    }

    let html = '';
    fechasSinCupo = new Set();

    for (let i = 0; i < fechas.length; i++) {
        const fecha = fechas[i];
        const finDeSemana = esFinDeSemana(fecha);
        const libre = !finDeSemana && cupos[i].ok && cupos[i].datos.Disponible === true;

        if (!libre) fechasSinCupo.add(fecha);

        
        if (!libre && fecha === fechaElegida) fechaElegida = '';

        html +=
            '<label class="dia_chip">' +
            '<input type="radio" name="dia_reserva" value="' + fecha + '"' +
            (libre ? '' : ' disabled') + '>' +
            '<span class="num_dia">' + Number(fecha.substring(8, 10)) + '</span>' +
            '<span class="mes_dia">' + mesCorto(fecha) + '</span>' +
            '</label>';
    }

    tira.innerHTML = html;

    if (!fechaElegida) {
        const primerLibre = tira.querySelector('input[name="dia_reserva"]:not([disabled])');
        fechaElegida = primerLibre ? primerLibre.value : '';
    }

    if (fechaElegida) mesVisible = fechaElegida.substring(0, 7);

    const marcado = tira.querySelector('input[value="' + fechaElegida + '"]');
    if (marcado) marcado.checked = true;

    pintarCalendarioDelMes();
}


function engancharTiraDeDias() {
    document.getElementById('tira_dias').addEventListener('change', function (evento) {
        if (evento.target.name !== 'dia_reserva') return;
        fechaElegida = evento.target.value;
        mesVisible = fechaElegida.substring(0, 7);
        pintarCalendarioDelMes();
    });
}


function mesMinimo() {
    return siguienteHabil(sumarDias(hoyTexto(), DIAS_ANTICIPACION)).substring(0, 7);
}

function engancharNavegacionMes() {
    const anterior = document.getElementById('btn_mes_anterior');
    const siguiente = document.getElementById('btn_mes_siguiente');
    if (!anterior || !siguiente) return;

    anterior.addEventListener('click', function () {
        if (mesVisible <= mesMinimo()) return;
        cambiarMes(-1);
    });

    siguiente.addEventListener('click', function () {
        cambiarMes(1);
    });
}

function cambiarMes(delta) {
    const anio = Number(mesVisible.substring(0, 4));
    const mes = Number(mesVisible.substring(5, 7));
    const referencia = new Date(anio, mes - 1 + delta, 1);
    mesVisible = referencia.getFullYear() + '-' +
        String(referencia.getMonth() + 1).padStart(2, '0');
    pintarCalendarioDelMes();
}

function actualizarEncabezadoMes(fechaMinima) {
    const rotulo = document.getElementById('rotulo_mes');
    if (rotulo) rotulo.textContent = mesLargo(mesVisible + '-01');

    const anterior = document.getElementById('btn_mes_anterior');
    if (anterior) anterior.disabled = mesVisible <= mesMinimo();
}

function pintarCalendarioDelMes() {
    const anio = Number(mesVisible.substring(0, 4));
    const mes = Number(mesVisible.substring(5, 7));
    const fechaMinima = siguienteHabil(sumarDias(hoyTexto(), DIAS_ANTICIPACION));

    actualizarEncabezadoMes(fechaMinima);

    calendarioSeleccionable(anio, mes, fechasSinCupo, fechaMinima, fechaElegida, function (fecha) {
        fechaElegida = fecha;
        mesVisible = fecha.substring(0, 7);
        const chip = document.querySelector('#tira_dias input[value="' + fecha + '"]');
        if (chip) chip.checked = true;
        pintarCalendarioDelMes();
    });
}

function engancharFlechas() {
    document.getElementById('btn_dia_anterior').addEventListener('click', async function () {
        const anterior = sumarDias(inicioTira, -DIAS_EN_TIRA);
        const minima = siguienteHabil(sumarDias(hoyTexto(), DIAS_ANTICIPACION));
        inicioTira = anterior < minima ? minima : anterior;
        await refrescarDias();
    });

    document.getElementById('btn_dia_siguiente').addEventListener('click', async function () {
        inicioTira = sumarDias(inicioTira, DIAS_EN_TIRA);
        await refrescarDias();
    });
}



function engancharPersonas() {
    const campo = document.getElementById('cant_personas');

    document.getElementById('btn_menos_personas').addEventListener('click', function () {
        const valor = Number(campo.value) - 1;
        campo.value = valor < MIN_PERSONAS ? MIN_PERSONAS : valor;
        pintarResumen();
    });

    document.getElementById('btn_mas_personas').addEventListener('click', function () {
        const valor = Number(campo.value) + 1;
        campo.value = valor > MAX_PERSONAS ? MAX_PERSONAS : valor;
        pintarResumen();
    });

    campo.addEventListener('change', pintarResumen);
}



function precioPorPersona() {
    return (Number(borrador.precioMenu) || 0) + (Number(borrador.precioExperiencia) || 0);
}

function pintarResumen() {
    const personas = Number(document.getElementById('cant_personas').value) || MIN_PERSONAS;

    let detalle = borrador.nombreMenu || '';
    if (borrador.nombreExperiencia) detalle += ' + ' + borrador.nombreExperiencia;

    document.getElementById('detalle_resumen').textContent = detalle;
    document.getElementById('valor_total').textContent = pesos(precioPorPersona() * personas);
}



function engancharFormulario() {
    const forma = document.getElementById('forma_datos');
    const boton = document.getElementById('btn_reservar');

    forma.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        if (enviando) return;

        const correo = document.getElementById('campo_correo').value.trim().toLowerCase();
        const personas = Number(document.getElementById('cant_personas').value);
        const hora = document.querySelector('input[name="hora_reserva"]:checked').value;

        if (!fechaElegida) {
            mostrarAvisoEvento('aviso-error', 'Escoge un día disponible.');
            return;
        }
        if (esFinDeSemana(fechaElegida)) {
            mostrarAvisoEvento('aviso-error', 'El centro solo atiende de lunes a viernes. Escoge un día hábil.');
            return;
        }
        if (!esCorreoInstitucional(correo)) {
            mostrarAvisoEvento('aviso-error', 'Usa tu correo institucional @sena.edu.co o @soy.sena.edu.co');
            return;
        }
        if (personas < MIN_PERSONAS || personas > MAX_PERSONAS) {
            mostrarAvisoEvento('aviso-error', 'El evento es para ' + MIN_PERSONAS + ' a ' + MAX_PERSONAS + ' personas.');
            return;
        }

        enviando = true;
        boton.disabled = true;
        boton.textContent = 'Guardando...';

        
        
        const nuevoEvento = {
            CorreoFk: correo,
            FranjaHoraria: hora,
            FechaInicio: fechaElegida + ' ' + hora + ':00',
            NumeroPersonas: personas,
            Experiencia: (borrador.nombreExperiencia || borrador.nombreMenu || '').substring(0, 64),
            IdMenuFk: borrador.idMenu,
            TipoServicio: 'presencial',
            Asistentes: 0,
            CostoTotal: precioPorPersona() * personas
        };

        try {
            const respuesta = await apiCrearEventoCliente(nuevoEvento);

            if (respuesta.ok && respuesta.datos.IdEvento) {
                let texto = '¡Reserva creada! Tu evento quedó con el número ' +
                    respuesta.datos.IdEvento + ' en estado pendiente.';
                texto += respuesta.datos.CorreoEnviado
                    ? ' Te enviamos el detalle a ' + correo + '.'
                    : ' (No se pudo enviar el correo de confirmación, pero tu reserva está guardada.)';

                mostrarAvisoEvento('aviso-ok', texto);
                boton.textContent = 'Reserva registrada';
                sessionStorage.removeItem('remy_reserva');
                return;
            }

            mostrarAvisoEvento('aviso-error', respuesta.datos.error || 'No se pudo crear la reserva.');
            boton.disabled = false;
            boton.textContent = 'Reservar Evento';

            
            
            await refrescarDias();

        } catch (error) {
            mostrarAvisoEvento('aviso-error', 'No se pudo conectar con el servidor.');
            boton.disabled = false;
            boton.textContent = 'Reservar Evento';
        } finally {
            enviando = false;
        }
    });
}

function mostrarAvisoEvento(clase, texto) {
    const aviso = document.getElementById('aviso_evento');
    aviso.className = 'aviso ' + clase;
    aviso.textContent = texto;
}
