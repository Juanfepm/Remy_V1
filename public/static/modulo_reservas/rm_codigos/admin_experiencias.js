

let experienciasAdmin = [];
let guardandoExperiencia = false;

document.addEventListener('DOMContentLoaded', function () {

    const sesion = exigirInstructor();
    if (!sesion) return;

    pintarPanel(sesion);

    cargarExperienciasAdmin();
    engancharBuscadorExperiencias();
    engancharModalExperiencia();
});



async function cargarExperienciasAdmin() {
    const aviso = document.getElementById('aviso_experiencias');

    try {
        const respuesta = await apiExperienciasTodas();

        if (!respuesta.ok || !Array.isArray(respuesta.datos)) {
            aviso.className = 'aviso aviso-error';
            aviso.textContent = 'No se pudieron consultar las experiencias.';
            return;
        }

        experienciasAdmin = respuesta.datos;

        if (experienciasAdmin.length === 0) {
            aviso.className = 'aviso aviso-vacio';
            aviso.textContent = 'No hay experiencias todavía. Crea la primera con el botón +.';
            document.getElementById('lista_experiencias_admin').innerHTML = '';
            return;
        }

        pintarExperienciasAdmin(experienciasAdmin);
        aviso.classList.add('oculto');

    } catch (error) {
        aviso.className = 'aviso aviso-error';
        aviso.textContent = 'No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos en XAMPP.';
    }
}

function pintarExperienciasAdmin(lista) {
    const contenedor = document.getElementById('lista_experiencias_admin');
    let html = '';

    for (let i = 0; i < lista.length; i++) {
        const experiencia = lista[i];

        html +=
            '<article class="card-h gris">' +
            etiquetaImagen(URL_IMG_EXP, experiencia.img_experiencia, experiencia.nombre, 'foto_card') +
            '<div class="info">' +

            '<div>' +
            '<h2>' + experiencia.nombre + '</h2>' +
            '<p class="descripcion-tarjeta">' + (experiencia.descripcion || '') + '</p>' +
            '</div>' +

            '<div class="fila_pie_card">' +
            '<span class="precio">' + pesos(experiencia.precio) + '</span>' +
            '<div class="acciones">' +
            '<button type="button" class="btn-ico editar btn_editar_experiencia" data-id="' + experiencia.id_experiencia + '" aria-label="Editar">' + ICO_EDITAR + '</button>' +
            '<button type="button" class="btn-ico borrar btn_borrar_experiencia" data-id="' + experiencia.id_experiencia + '" aria-label="Eliminar">' + ICO_BORRAR + '</button>' +
            '</div>' +
            '</div>' +

            '</div>' +
            '</article>';
    }

    contenedor.innerHTML = html;

    const editar = contenedor.querySelectorAll('.btn_editar_experiencia');
    for (let i = 0; i < editar.length; i++) {
        editar[i].addEventListener('click', function () {
            abrirModalExperiencia(this.dataset.id);
        });
    }

    const borrar = contenedor.querySelectorAll('.btn_borrar_experiencia');
    for (let i = 0; i < borrar.length; i++) {
        borrar[i].addEventListener('click', function () {
            borrarExperiencia(this.dataset.id);
        });
    }
}



function abrirModalExperiencia(idExperiencia) {
    const modal = document.getElementById('modal_experiencia');
    const titulo = document.getElementById('titulo_modal_experiencia');

    document.getElementById('aviso_modal_experiencia').classList.add('oculto');

    if (idExperiencia) {
        const experiencia = experienciasAdmin.find(function (e) { return e.id_experiencia === idExperiencia; });
        if (!experiencia) return;

        titulo.textContent = 'Editar experiencia';
        document.getElementById('id_experiencia').value = experiencia.id_experiencia;
        document.getElementById('nombre_experiencia').value = experiencia.nombre || '';
        document.getElementById('descripcion_experiencia').value = experiencia.descripcion || '';
        document.getElementById('precio_experiencia').value = experiencia.precio;
        document.getElementById('img_experiencia').value = experiencia.img_experiencia || 'cafe.jpg';

    } else {
        titulo.textContent = 'Nueva experiencia';
        document.getElementById('forma_experiencia').reset();
        document.getElementById('id_experiencia').value = '';
    }

    modal.showModal();
}

function engancharModalExperiencia() {
    const modal = document.getElementById('modal_experiencia');

    document.getElementById('btn_nueva_experiencia').addEventListener('click', function () {
        abrirModalExperiencia('');
    });

    document.getElementById('btn_cerrar_experiencia').addEventListener('click', function () {
        modal.close();
    });

    document.getElementById('forma_experiencia').addEventListener('submit', async function (evento) {
        evento.preventDefault();
        await guardarExperiencia();
    });
}



async function guardarExperiencia() {
    if (guardandoExperiencia) return;

    const boton = document.getElementById('btn_guardar_experiencia');
    const idExperiencia = document.getElementById('id_experiencia').value;

    const datos = {
        id_experiencia: idExperiencia || siguienteIdExperiencia(),
        nombre: document.getElementById('nombre_experiencia').value.trim(),
        descripcion: document.getElementById('descripcion_experiencia').value.trim(),
        precio: Number(document.getElementById('precio_experiencia').value),
        img_experiencia: document.getElementById('img_experiencia').value
    };

    guardandoExperiencia = true;
    boton.disabled = true;
    boton.textContent = 'Guardando...';

    try {
        const respuesta = idExperiencia
            ? await apiActualizarExperiencia(datos)
            : await apiInsertarExperiencia(datos);

        if (respuesta.ok && respuesta.datos.res) {
            document.getElementById('modal_experiencia').close();
            await cargarExperienciasAdmin();
        } else {
            mostrarAvisoModalExperiencia(respuesta.datos.error || 'No se pudo guardar la experiencia.');
        }

    } catch (error) {
        mostrarAvisoModalExperiencia('No se pudo conectar con el servidor.');
    } finally {
        guardandoExperiencia = false;
        boton.disabled = false;
        boton.textContent = 'Guardar';
    }
}


function siguienteIdExperiencia() {
    let mayor = 0;

    for (let i = 0; i < experienciasAdmin.length; i++) {
        const numero = Number(String(experienciasAdmin[i].id_experiencia).replace(/\D/g, ''));
        if (numero > mayor) mayor = numero;
    }

    return 'EXP' + String(mayor + 1).padStart(3, '0');
}



async function borrarExperiencia(idExperiencia) {
    const experiencia = experienciasAdmin.find(function (e) { return e.id_experiencia === idExperiencia; });
    const nombre = experiencia ? experiencia.nombre : idExperiencia;

    if (!confirm('¿Eliminar la experiencia "' + nombre + '"? Esta acción no se puede deshacer.')) return;

    try {
        const respuesta = await apiEliminarExperiencia(idExperiencia);

        if (respuesta.ok && respuesta.datos.res) {
            await cargarExperienciasAdmin();
        } else {
            alert(respuesta.datos.error || 'No se pudo eliminar la experiencia.');
        }

    } catch (error) {
        alert('No se pudo conectar con el servidor.');
    }
}



function engancharBuscadorExperiencias() {
    document.getElementById('buscar_experiencia').addEventListener('input', function () {
        const texto = this.value.trim().toLowerCase();

        const filtradas = experienciasAdmin.filter(function (experiencia) {
            return (experiencia.nombre + ' ' + experiencia.descripcion).toLowerCase().indexOf(texto) !== -1;
        });

        pintarExperienciasAdmin(filtradas);
    });
}

function mostrarAvisoModalExperiencia(texto) {
    const aviso = document.getElementById('aviso_modal_experiencia');
    aviso.className = 'aviso aviso-error';
    aviso.textContent = texto;
}
