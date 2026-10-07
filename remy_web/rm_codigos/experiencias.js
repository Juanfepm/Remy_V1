

let experienciasPublicas = [];

document.addEventListener('DOMContentLoaded', function () {
    cargarExperienciasPublicas();
    engancharBuscador();
});

async function cargarExperienciasPublicas() {
    const aviso = document.getElementById('aviso_experiencias');

    try {
        const respuesta = await apiExperienciasActivas();

        if (!respuesta.ok || !Array.isArray(respuesta.datos) || respuesta.datos.length === 0) {
            aviso.className = 'aviso aviso-vacio';
            aviso.textContent = 'Todavía no hay experiencias publicadas.';
            return;
        }

        experienciasPublicas = respuesta.datos;
        pintar(experienciasPublicas);
        aviso.classList.add('oculto');

    } catch (error) {
        aviso.className = 'aviso aviso-error';
        aviso.textContent = 'No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos en XAMPP.';
    }
}

function pintar(lista) {
    const contenedor = document.getElementById('lista_experiencias_pub');
    let html = '';

    for (let i = 0; i < lista.length; i++) {
        const experiencia = lista[i];

        html +=
            '<a href="reservas.html" class="card-v">' +
            '<div class="img-box">' +
            etiquetaImagen(URL_IMG_EXP, experiencia.ImgExperiencia, experiencia.Nombre, '') +
            '</div>' +
            '<h3>' + experiencia.Nombre + '</h3>' +
            '<p>' + (experiencia.Descripcion || '') + '</p>' +
            '<strong class="precio_card">' + pesos(experiencia.Precio) + '</strong>' +
            '</a>';
    }

    contenedor.innerHTML = html;
}


function engancharBuscador() {
    document.getElementById('buscar_experiencia').addEventListener('input', function () {
        const texto = this.value.trim().toLowerCase();

        const filtradas = experienciasPublicas.filter(function (experiencia) {
            return (experiencia.Nombre + ' ' + experiencia.Descripcion).toLowerCase().indexOf(texto) !== -1;
        });

        pintar(filtradas);
    });
}
