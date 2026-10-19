

document.addEventListener('DOMContentLoaded', () => {
    pintarCalendario();
});


function esFinDeSemanaFecha(fecha) {
    const dia = fecha.getDay();
    return dia === 0 || dia === 6;
}


function pintarCalendario(
    anio = new Date().getFullYear(),
    mes = new Date().getMonth() + 1,
    diasSinServicio = []
) {
    const hoy = new Date();
    const esMesActual = anio === hoy.getFullYear() && mes === hoy.getMonth() + 1;
    const diaHoy = hoy.getDate();

    
    const diasEnMes = new Date(anio, mes, 0).getDate();

    
    
    const diaSemanaInicio = new Date(anio, mes - 1, 1).getDay();

    
    for (let fila = 1; fila <= 6; fila++) {
        for (let columna = 1; columna <= 7; columna++) {
            const celda = document.getElementById(`s0${fila}dia0${columna}`);
            if (!celda) continue;
            celda.textContent = '';
            celda.className = ''; 
        }
    }

    
    let fila = 1;
    let columna = diaSemanaInicio + 1; 

    for (let dia = 1; dia <= diasEnMes; dia++) {
        const celda = document.getElementById(`s0${fila}dia0${columna}`);

        if (celda) {
            celda.textContent = dia;

            const finDeSemana = esFinDeSemanaFecha(new Date(anio, mes - 1, dia));

            if (diasSinServicio.includes(dia) || finDeSemana) {
                celda.classList.add('dia-no');
            } else if (esMesActual && dia === diaHoy) {
                celda.classList.add('dia-hoy');
            } else {
                celda.classList.add('dia-o');
            }
        }

        columna++;
        if (columna > 7) {
            columna = 1;
            fila++;
        }
    }
}




function calendarioSeleccionable(anio, mes, fechasSinCupo, fechaMinima, fechaElegida, alSeleccionar) {

    pintarCalendario(anio, mes);

    
    
    quitarEscuchasDelCalendario();

    const diasEnMes = new Date(anio, mes, 0).getDate();

    for (let dia = 1; dia <= diasEnMes; dia++) {

        const fecha = anio + '-' + String(mes).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
        const celda = celdaDelDia(anio, mes, dia);

        if (!celda) continue;

        const finDeSemana = esFinDeSemanaFecha(new Date(anio, mes - 1, dia));
        const sinCupo = fechasSinCupo && typeof fechasSinCupo.has === 'function'
            ? fechasSinCupo.has(fecha)
            : false;

        const bloqueado = finDeSemana || fecha < fechaMinima || sinCupo;

        if (bloqueado) {
            celda.classList.remove('dia-o', 'dia-hoy', 'dia-even');
            celda.classList.add('dia-no');
            celda.style.cursor = 'not-allowed';
            continue;
        }

        celda.style.cursor = 'pointer';

        if (fecha === fechaElegida) {
            celda.classList.remove('dia-o', 'dia-hoy');
            celda.classList.add('dia-even');
        }

        celda.addEventListener('click', function () {
            alSeleccionar(fecha);
        });
    }
}


function celdaDelDia(anio, mes, dia) {
    const inicio = new Date(anio, mes - 1, 1).getDay(); 
    const posicion = inicio + dia - 1;                  
    const fila = Math.floor(posicion / 7) + 1;
    const columna = (posicion % 7) + 1;
    return document.getElementById('s0' + fila + 'dia0' + columna);
}


function quitarEscuchasDelCalendario() {
    for (let fila = 1; fila <= 6; fila++) {
        for (let columna = 1; columna <= 7; columna++) {
            const celda = document.getElementById('s0' + fila + 'dia0' + columna);
            if (celda) celda.replaceWith(celda.cloneNode(true));
        }
    }
}
