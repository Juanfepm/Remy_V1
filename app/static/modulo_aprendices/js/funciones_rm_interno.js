/* URL base de la API del módulo (misma app Flask) */
const RUTA_MODULO = RAIZ + "/aprendices";
const API_BASE_URL = RUTA_MODULO + "/api";



function redireccionarALogin() {
    localStorage.removeItem("token");
    localStorage.removeItem("rol_usuario");

    const rutaActual = window.location.pathname.toLowerCase().replace(/\/$/, "");
    const rutasPublicas = [RUTA_MODULO + "/login", RUTA_MODULO].map(r => r.toLowerCase());

    if (!rutasPublicas.includes(rutaActual) && rutaActual !== "") {
        window.location.href = RUTA_MODULO + "/login";
    }
}

async function verificarSesion() {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined" || token === "null") {
        redireccionarALogin();
        return;
    }

    try {
        const respuesta = await fetchConToken(`${API_BASE_URL}/verificar-sesion`, { method: "GET" });
        if (!respuesta || !respuesta.ok) {
            redireccionarALogin();
            return;
        }
        const datos = await respuesta.json();
        if (datos.usuario && datos.usuario.rol_usuario !== undefined) {
            localStorage.setItem("rol_usuario", datos.usuario.rol_usuario);
        }
    } catch (error) {
        console.error("Error al verificar sesión:", error);
        redireccionarALogin();
    }
}

function validarCampoCorreo(campo_usuario) {
    const palabra = document.getElementById("cont_palabra");
    if (!campo_usuario || !palabra) return;

    campo_usuario.addEventListener("keyup", () => {
        if (campo_usuario.value.length >= 18) {
            palabra.style.left = "0px";
        } else {
            palabra.style.left = "-100px";
        }
    });
}

function recordatorioCorreo(bandera) {
    const usuario = document.getElementById("usuario");
    if (!usuario) return;

    usuario.addEventListener("focus", () => {
        if (bandera === 0) {
            alert("Recuerda que solo puedes usar la dirección de correo electrónico institucional.");
            bandera = 1;
        }
    });

    validarCampoCorreo(usuario);
}

function controlVista(objeto) {
    if (!objeto) return;
    objeto.style.display = (objeto.style.display === "none") ? "block" : "none";
}

async function fetchConToken(url, opciones = {}) {
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn('No hay token disponible.');
        redireccionarALogin();
        return;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        ...(opciones.headers || {})
    };

    if (!(opciones.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const respuesta = await fetch(url, { 
        ...opciones, 
        headers,
        cache: 'no-store' 
    });

    if (respuesta.status === 401) {
        localStorage.removeItem('token');
        alert('Tu sesión ha expirado. Por favor ingresa nuevamente.');
        redireccionarALogin();
        return;
    }

    const nuevoToken = respuesta.headers.get('X-Nuevo-Token');
    if (nuevoToken) {
        localStorage.setItem('token', nuevoToken);
    }

    return respuesta;
}


/** Conexión con el Login */

async function iniciarSesion() {
    const formulario = document.getElementById("forma_entrar");
    if (!formulario) return;

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const inputUsuario = document.getElementById("usuario");
        const inputPalabra = document.getElementById("palabra");

        if (!inputUsuario || !inputPalabra) {
            console.error("No se encontraron los inputs en el DOM.");
            return;
        }

        try {
            const respuesta = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    correo: inputUsuario.value,
                    contrasena: inputPalabra.value
                })
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();

                if (datos.token) {
                    localStorage.setItem("token", datos.token);
                    if (datos.rol_usuario !== undefined && datos.rol_usuario !== null) {
                        localStorage.setItem("rol_usuario", datos.rol_usuario);
                    }
                    window.location.href = RUTA_MODULO + "/dashboard";
                } else {
                    alert("Error en el formato de respuesta del servidor.");
                }
            } else {
                alert("Usuario o contraseña incorrectos");
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
        }
    });
}

function aplicarControlDeRol() {
    const rol = localStorage.getItem("rol_usuario");

    if (rol !== null && String(rol).trim() === String(ROLES.aprendiz)) {
        const selectoresRestringidos = [
            'a[href*="cargaMasiva"]',
            'a[href*="cargaIndividual"]',
            'a[href*="listaAprendices"]',
            'a[href*="asignarLiderazgo"]',
            'a[href*="modificarAprendiz"]',
            '.btn_asignar_liderazgo',
            '.contenedor_acciones_seccion',
            '.btn-editar',
            '.btn-eliminar',
            '.acciones_fila'
        ];

        selectoresRestringidos.forEach(selector => {
            document.querySelectorAll(selector).forEach(elemento => {
                elemento.style.setProperty("display", "none", "important");
            });
        });
    }
}

/** Conexión con Usuarios */
let aprendicesCompletos = [];

async function cargarAprendices() {
    try {
        const respuesta = await fetchConToken(`${API_BASE_URL}/usuarios`);
        if (!respuesta || !respuesta.ok) return;

        const resultado = await respuesta.json();
        const datos = Array.isArray(resultado) ? resultado : (resultado.data || []);

        console.log("Estructura de un aprendiz:", datos[0]);

        aprendicesCompletos = datos;
        renderizarListaAprendices(datos);
        OpcionesFiltro(datos);
    } catch (error) {
        console.error("Error al cargar la lista de aprendices:", error);
    }
}

function renderizarListaAprendices(lista) {
    const contenedor = document.getElementById("tarjeta_lista");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; padding: 20px;'>No hay aprendices en esta ficha.</p>";
        return;
    }

    lista.forEach((aprendiz) => {
        const id = aprendiz[0];
        const nombre = aprendiz[1];
        const apellido = aprendiz[2];

        const tarjeta = document.createElement("div");
        tarjeta.classList.add("fila_aprendiz");
        tarjeta.dataset.id = id;

        tarjeta.innerHTML = `
            <div class="info_aprendiz">
                <span class="nombre_aprendiz">${nombre} ${apellido}</span>
                <button type="button" class="btn-ver-mas">ver más</button>
            </div>
            <div class="acciones_fila">
                <button type="button" class="btn-icono letra-verde btn-editar" aria-label="Editar">
                    <svg viewBox="0 0 32 32" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M30 7 L25 2 5 22 3 29 10 27 Z M21 6 L26 11 Z M5 22 L10 27 Z"/>
                    </svg>
                </button>
                <button type="button" class="btn-icono letra-roja btn-eliminar" aria-label="Eliminar">
                    <svg viewBox="0 0 791.908 791.908" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <path d="M648.587,99.881H509.156C500.276,43.486,452.761,0,394.444,0S287.696,43.486,279.731,99.881H142.315 c-26.733,0-48.43,21.789-48.43,48.43v49.437c0,24.719,17.761,44.493,41.564,47.423V727.64c0,35.613,28.655,64.268,64.268,64.268 h392.475c35.613,0,64.268-28.655,64.268-64.268V246.087c23.711-3.937,41.564-23.711,41.564-47.423v-49.437 C697.017,121.67,675.228,99.881,648.587,99.881z M394.444,36.62c38.543,0,70.219,26.733,77.085,63.261H316.351 C324.225,64.268,355.901,36.62,394.444,36.62z M618.924,728.739c0,14.831-11.901,27.648-27.648,27.648H198.71 c-14.831,0-27.648-11.901-27.648-27.648V247.185h446.948v481.554H618.924z M660.397,197.748c0,6.958-4.944,11.902-11.902,11.902 H142.223c-6.958,0-11.902-4.944-11.902-11.902v-49.437c0-6.958,4.944-11.902,11.902-11.902h505.265 c6.958,0,11.901,4.944,11.901,11.902v49.437H660.397z M253.09,661.45V349.081c0-9.887,7.873-17.761,17.761-17.761 s17.761,7.873,17.761,17.761V661.45c0,9.887-7.873,17.761-17.761,17.761C260.964,680.309,253.09,671.337,253.09,661.45z M378.606,661.45V349.081c0-9.887,7.873-17.761,17.761-17.761c9.887,0,17.761,7.873,17.761,17.761V661.45 c0,9.887-7.873,17.761-17.761,17.761C386.57,680.309,378.606,671.337,378.606,661.45z M504.212,661.45V349.081 c0-9.887,7.873-17.761,17.761-17.761s17.761,7.873,17.761,17.761V661.45c0,9.887-7.873,17.761-17.761,17.761 C513.093,680.309,504.212,671.337,504.212,661.45z"/>
                    </svg>
                </button>
            </div>
        `;

        contenedor.appendChild(tarjeta);
        tarjeta.addEventListener("click", (evento) => {
            if (evento.target.closest(".btn-editar") || evento.target.closest(".btn-eliminar")) return;
            window.location.href = RUTA_MODULO + "/detalleAprendiz?id=" + encodeURIComponent(id);
        });

        const botonEditar = tarjeta.querySelector(".btn-editar");
        botonEditar.addEventListener("click", () => {
            window.location.href = RUTA_MODULO + "/modificarAprendiz?id=" + encodeURIComponent(id);
        });

        const botonEliminar = tarjeta.querySelector(".btn-eliminar");
        botonEliminar.addEventListener("click", async () => {
            if (!confirm("¿Está seguro de eliminar este aprendiz?")) return;
            try {
                const res = await fetchConToken(`${API_BASE_URL}/usuarios/${encodeURIComponent(id)}`, { method: "DELETE" });
                if (res && res.ok) {
                    alert("Aprendiz eliminado con éxito.");
                    tarjeta.remove();
                }
            } catch (err) {
                console.error(err);
            }
        });
    });

    aplicarControlDeRol();
}


function OpcionesFiltro(datos) {
    const select = document.getElementById("select_filtro_ficha");
    if (!select) return;

    const fichas = datos
        .map(ap => {
            if (Array.isArray(ap)) return ap[3];
            return ap.ficha || ap.num_ficha || ap.numero_ficha || ap.id_ficha || ap.ficha_numero || ap.ficha_id;
        })
        .filter(ficha => ficha !== undefined && ficha !== null && ficha !== "");

    const fichasUnicas = [...new Set(fichas)];

    console.log("Fichas encontradas:", fichasUnicas);

    select.innerHTML = '<option value="">Todas las fichas</option>';
    fichasUnicas.forEach(ficha => {
        const option = document.createElement("option");
        option.value = ficha;
        option.textContent = `Ficha: ${ficha}`;
        select.appendChild(option);
    });
}


function inicializarFiltro() {
    const btnFiltro = document.getElementById("btn_filtro_ficha");
    const selectFiltro = document.getElementById("select_filtro_ficha");

    if (btnFiltro && selectFiltro) {
        btnFiltro.addEventListener("click", () => {
            controlVista(selectFiltro);
        });

        selectFiltro.addEventListener("change", (e) => {
            const fichaSeleccionada = e.target.value;

            if (!fichaSeleccionada) {
                renderizarListaAprendices(aprendicesCompletos);
            } else {
                const aprendicesFiltrados = aprendicesCompletos.filter(ap => {
                    const fichaAprendiz = Array.isArray(ap) ? ap[3] : (ap.ficha || ap.num_ficha);
                    return fichaAprendiz && fichaAprendiz.toString() === fichaSeleccionada.toString();
                });
                renderizarListaAprendices(aprendicesFiltrados);
            }
        });
    }
}

/** Modificar Aprendiz */

async function cargarDatosAprendiz() {
    const parametros = new URLSearchParams(window.location.search);
    const cedula = parametros.get("id");

    if (!cedula) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No hay una sesión iniciada.");
        return;
    }

    try {
        const respuesta = await fetchConToken(
            `${API_BASE_URL}/usuarios/` + encodeURIComponent(cedula),
            { method: "GET" }
        );
        if (!respuesta) return;

        const datos = await respuesta.json();

        if (respuesta.ok) {
            const aprendiz = datos.data;
            document.getElementById("nombre").value = aprendiz[0] || "";
            document.getElementById("apellido").value = aprendiz[1] || "";
            document.getElementById("contrasena").value = aprendiz[2] || "";
            document.getElementById("ficha").value = aprendiz[3] || "";
            document.getElementById("fecha_fin_etapa_lectiva").value = aprendiz[4] || "";
        } else {
            alert(datos.mensaje || "No fue posible cargar el aprendiz.");
        }

    } catch (error) {
        console.error("Error al cargar el aprendiz:", error);
        alert("No fue posible conectar con el servidor.");
    }
}

async function modificarAprendiz() {
    const parametros = new URLSearchParams(window.location.search);
    const cedula = parametros.get("id");

    if (!cedula) {
        alert("No se encontró el aprendiz a modificar.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No hay una sesión iniciada.");
        return;
    }

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const contrasena = document.getElementById("contrasena").value;
    const ficha = document.getElementById("ficha").value;
    const fecha = document.getElementById("fecha_fin_etapa_lectiva").value;

    const celular = contrasena;

    if (celular.length !== 10 || !celular.startsWith("3") || isNaN(celular)) {
        alert("El número de celular debe contener 10 dígitos e iniciar con 3.");
        return;
    }

    if (ficha.length < 7 || ficha.length > 8 || ficha.startsWith("0") || isNaN(ficha)) {
        alert("La ficha debe contener entre 7 y 8 dígitos y no puede iniciar con 0.");
        return;
    }

    try {
        const respuesta = await fetchConToken(
            `${API_BASE_URL}/usuarios/` + encodeURIComponent(cedula),
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombres: nombre,
                    apellidos: apellido,
                    contrasena: contrasena,
                    ficha: ficha,
                    fecha_fin_etapa_lectiva: fecha
                })
            }
        );
        if (!respuesta) return;

        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert(datos.mensaje || "Aprendiz modificado con éxito.");
            window.location.href = RUTA_MODULO + "/listaAprendices";
        } else {
            alert(datos.mensaje || datos.error || "No fue posible modificar el aprendiz.");
        }

    } catch (error) {
        console.error("Error al conectar con el Gateway:", error);
        alert("No fue posible conectar con el servidor.");
    }
}

/** Detalle Aprendiz */

async function cargarDetalleAprendiz() {
    const parametros = new URLSearchParams(window.location.search);
    const cedula = parametros.get("id");

    if (!cedula) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No hay una sesión iniciada.");
        return;
    }

    try {
        const respuesta = await fetchConToken(
            `${API_BASE_URL}/usuarios/` + encodeURIComponent(cedula),
            { method: "GET" }
        );
        if (!respuesta) return;

        const datos = await respuesta.json();

        if (respuesta.ok) {
            const aprendiz = datos.data;
            const valores = document.querySelectorAll(".valor-dato");

            if (valores.length >= 5) {
                valores[0].textContent = aprendiz[0] || "";
                valores[1].textContent = aprendiz[1] || "";
                valores[2].textContent = aprendiz[3] || "";
                valores[3].textContent = aprendiz[2] || "";
                valores[4].textContent = aprendiz[4] || "";
            }
        } else {
            alert(datos.mensaje || datos.error || "No fue posible cargar la información del aprendiz.");
        }

    } catch (error) {
        console.error("Error al cargar el detalle:", error);
        alert("No fue posible conectar con el servidor.");
    }
}

/** Conexión con Carga Masiva */

function cargarAprendicesMasiva() {
    const formulario = document.getElementById("forma_carga_masiva");
    const archivoInput = document.getElementById("archivo_aprendices") || document.getElementById("archivo");
    const textoArchivo = document.getElementById("texto_archivo");
    const botonSubir = document.getElementById("btn_subir_aprendices");

    if (!formulario || !archivoInput) return;

    archivoInput.addEventListener("change", () => {
        if (archivoInput.files.length > 0) {
            if (textoArchivo) textoArchivo.textContent = archivoInput.files[0].name;
        } else {
            if (textoArchivo) textoArchivo.textContent = "Seleccionar archivo";
        }
    });

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            alert("No hay una sesión iniciada.");
            return;
        }

        if (archivoInput.files.length === 0) {
            alert("Debe seleccionar un archivo Excel.");
            return;
        }

        const archivo = archivoInput.files[0];
        const formData = new FormData();
        formData.append("archivo", archivo);

        if (botonSubir) botonSubir.disabled = true;
        const fondoErrores = document.getElementById("fondo_overlay_errores");
        const listaErrores = document.getElementById("lista_errores");
        const btnCerrarErrores = document.getElementById("btn_cerrar_errores");

        if (btnCerrarErrores && fondoErrores) {
            btnCerrarErrores.onclick = () => {
                fondoErrores.style.display = "none";
            };
        }

        if (fondoErrores && listaErrores) {
            listaErrores.innerHTML = "";
            fondoErrores.style.display = "none";
        }

        try {
            const respuesta = await fetchConToken(
                `${API_BASE_URL}/programas/cargar-masiva`,
                {
                    method: "POST",
                    body: formData
                }
            );
            if (!respuesta) { if (botonSubir) botonSubir.disabled = false; return; }

            const datos = await respuesta.json();

            if (respuesta.ok) {
                alert(datos.mensaje || "Aprendices cargados correctamente.");
                window.location.href = RUTA_MODULO + "/listaAprendices";
                archivoInput.value = "";
                if (textoArchivo) textoArchivo.textContent = "Seleccionar archivo";
            } else {
                if (datos.detalle_errores && datos.detalle_errores.length > 0) {
                    if (fondoErrores && listaErrores) {
                        datos.detalle_errores.forEach(err => {
                            const li = document.createElement("li");
                            if (err.fila) {
                                li.innerHTML = `<strong>Fila ${err.fila}:</strong> ${err.error}`;
                            } else {
                                li.textContent = err.error;
                            }
                            listaErrores.appendChild(li);
                        });
                        fondoErrores.style.display = "flex";
                    } else {
                        alert(datos.error || "Hubo errores en el archivo, revisa el detalle en pantalla.");
                    }
                } else if (datos.detalle && datos.detalle.faltantes) {
                    if (fondoErrores && listaErrores) {
                        const li = document.createElement("li");
                        li.innerHTML = `<strong>Columnas faltantes:</strong> ${datos.detalle.faltantes.join(", ")}`;
                        listaErrores.appendChild(li);
                        fondoErrores.style.display = "flex";
                    } else {
                        alert(datos.error || "Faltan columnas requeridas en el archivo.");
                    }
                } else {
                    alert(datos.mensaje || datos.error || "No fue posible cargar los aprendices.");
                }
            }

        } catch (error) {
            console.error("Error en la petición:", error);
            alert("No fue posible conectar con el servidor.");
        } finally {
            if (botonSubir) botonSubir.disabled = false;
        }
    });
}

/** Crear Usuario Individual */

function crearUsuarioIndividual() {
    const formulario = document.getElementById("forma_carga_individual");
    if (!formulario) return;

    formulario.onsubmit = async (evento) => {
        evento.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("No hay una sesión iniciada.");
            return;
        }
        const botonEnviar = formulario.querySelector("button[type='submit']");
        if (botonEnviar) botonEnviar.disabled = true;

        const datos = {
            cedula: document.getElementById("cedula").value.trim(),
            nombres: document.getElementById("nombres").value.trim(),
            apellidos: document.getElementById("apellidos").value.trim(),
            ficha: document.getElementById("ficha").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            celular: document.getElementById("celular").value.trim(),
            fecha_fin_etapa_lectiva: document.getElementById("fecha_fin_etapa_lectiva").value
        };

        if (!datos.correo.endsWith("@soy.sena.edu.co")) {
            alert("El correo debe tener el dominio @soy.sena.edu.co");
            if (botonEnviar) botonEnviar.disabled = false;
            return;
        }

        if (datos.celular.length !== 10 || !datos.celular.startsWith("3") || isNaN(datos.celular)) {
            alert("El número de celular debe contener 10 dígitos e iniciar con 3.");
            if (botonEnviar) botonEnviar.disabled = false;
            return;
        }

        if (datos.ficha.length < 7 || datos.ficha.length > 8 || datos.ficha.startsWith("0") || isNaN(datos.ficha)) {
            alert("La ficha debe contener entre 7 y 8 dígitos y no puede iniciar con 0.");
            if (botonEnviar) botonEnviar.disabled = false;
            return;
        }

        try {
            const respuesta = await fetchConToken(`${API_BASE_URL}/usuarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if (!respuesta) return;

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                alert(resultado.mensaje || "Usuario creado con éxito.");
                window.location.href = RUTA_MODULO + "/listaAprendices";
            } else {
                alert(resultado.error || resultado.mensaje || "Error al crear usuario.");
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("No fue posible conectar con el servidor.");
        } finally {
            if (botonEnviar) botonEnviar.disabled = false;
        }
    };
}

/** Cargar Eventos para Liderazgo */

async function cargarEventosYAprendices() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const respuestaEventos = await fetchConToken(`${API_BASE_URL}/eventos?sin_lideres=true`, { method: "GET" });
        const respuestaAprendices = await fetchConToken(`${API_BASE_URL}/aprendices`, { method: "GET" });

        if (!respuestaEventos || !respuestaAprendices) return;

        if (respuestaEventos.ok && respuestaAprendices.ok) {
            const resEventos = await respuestaEventos.json();
            const resAprendices = await respuestaAprendices.json();

            const eventos = Array.isArray(resEventos) ? resEventos : (resEventos.data || []);
            const aprendices = Array.isArray(resAprendices) ? resAprendices : (resAprendices.data || []);

            const selectEvento = document.getElementById("select_evento");
            const selectFicha = document.getElementById("select_ficha");
            const selectCocina = document.getElementById("select_lider_cocina");
            const selectServicio = document.getElementById("select_lider_servicio");

            if (!selectEvento || !selectCocina || !selectServicio) return;

            const eventosDisponibles = eventos.filter(ev => {
                const liderCocina = Array.isArray(ev) ? ev[13] : ev.lider_cocina;
                const liderServicio = Array.isArray(ev) ? ev[14] : ev.lider_servicio;

                const sinCocina = !liderCocina || liderCocina === "Sin asignar" || liderCocina === "0";
                const sinServicio = !liderServicio || liderServicio === "Sin asignar" || liderServicio === "0";

                return sinCocina && sinServicio;
            });

            selectEvento.innerHTML = '<option value="" selected disabled hidden>Seleccione un evento</option>';

            if (eventosDisponibles.length === 0) {
                selectEvento.innerHTML += '<option value="" disabled>No hay eventos pendientes por asignar</option>';
            } else {
                eventosDisponibles.forEach(ev => {
                    const id = Array.isArray(ev) ? ev[0] : ev.id_evento;
                    const nombre = Array.isArray(ev) ? ev[1] : ev.nombre_evento;
                    selectEvento.innerHTML += `<option value="${id}">${nombre}</option>`;
                });
            }

            const resetLideres = () => {
                const msjInicial = '<option value="" selected disabled hidden>Seleccione una ficha primero...</option>';
                selectCocina.innerHTML = msjInicial;
                selectServicio.innerHTML = msjInicial;
                selectCocina.disabled = true;
                selectServicio.disabled = true;
            };

            const cargarLideres = (lista) => {
                if (!lista || lista.length === 0) {
                    const msjVacio = '<option value="" selected disabled hidden>No hay aprendices en esta ficha</option>';
                    selectCocina.innerHTML = msjVacio;
                    selectServicio.innerHTML = msjVacio;
                    selectCocina.disabled = true;
                    selectServicio.disabled = true;
                    return;
                }

                const opcionesHTML = '<option value="" selected disabled hidden>Seleccione un líder</option>' +
                    lista.map(ap => {
                        const id = Array.isArray(ap) ? ap[0] : ap.id_usuario;
                        const nombre = Array.isArray(ap) ? ap[1] : ap.nombre;
                        const apellido = Array.isArray(ap) ? ap[2] : ap.apellido;
                        return `<option value="${id}">${nombre} ${apellido}</option>`;
                    }).join("");

                selectCocina.innerHTML = opcionesHTML;
                selectServicio.innerHTML = opcionesHTML;
                selectCocina.disabled = false;
                selectServicio.disabled = false;
            };

            resetLideres();

            if (selectFicha) {
                selectFicha.innerHTML = '<option value="" selected disabled hidden>Seleccione una ficha</option>';

                const fichasUnicas = [...new Set(aprendices.map(ap => Array.isArray(ap) ? ap[3] : ap.ficha).filter(Boolean))];
                fichasUnicas.forEach(ficha => {
                    selectFicha.innerHTML += `<option value="${ficha}">${ficha}</option>`;
                });

                selectFicha.addEventListener("change", (e) => {
                    const fichaSel = e.target.value;
                    if (fichaSel) {
                        const aprendicesFiltrados = aprendices.filter(ap => {
                            const fichaAp = Array.isArray(ap) ? ap[3] : ap.ficha;
                            return fichaAp?.toString() === fichaSel.toString();
                        });
                        cargarLideres(aprendicesFiltrados);
                    } else {
                        resetLideres();
                    }
                });
            }

            selectEvento.addEventListener("change", (e) => {
                const idSeleccionado = e.target.value;
                const eventoEncontrado = eventosDisponibles.find(ev => {
                    const id = Array.isArray(ev) ? ev[0] : ev.id_evento;
                    return id.toString() === idSeleccionado.toString();
                });

                if (eventoEncontrado) {
                    const fechaHoraCompleta = Array.isArray(eventoEncontrado) ? eventoEncontrado[5] : (eventoEncontrado.fecha_inicio || "N/A");
                    const cantidad = Array.isArray(eventoEncontrado) ? eventoEncontrado[7] : (eventoEncontrado.numero_personas ?? "N/A");

                    let fecha = fechaHoraCompleta;
                    let hora = "N/A";

                    if (typeof fechaHoraCompleta === 'string' && fechaHoraCompleta.includes(' ')) {
                        const partes = fechaHoraCompleta.split(' ');
                        fecha = partes[0];
                        hora = partes.slice(1).join(' ');
                    }

                    const elemHora = document.getElementById("info_hora");
                    const elemFecha = document.getElementById("info_fecha");
                    const elemCantidad = document.getElementById("info_cantidad");

                    if (elemHora) elemHora.textContent = hora;
                    if (elemFecha) elemFecha.textContent = fecha;
                    if (elemCantidad) elemCantidad.textContent = cantidad;
                }
            });
        }
    } catch (error) {
        console.error("Error cargando datos para asignar:", error);
    }
}

async function cargarEventosLiderazgo() {
    try {
        const respuesta = await fetchConToken(`${API_BASE_URL}/eventos`);
        if (!respuesta || !respuesta.ok) {
            console.error("Error en la respuesta del servidor al obtener eventos.");
            return;
        }

        const resultado = await respuesta.json();
        const listaEventos = Array.isArray(resultado) ? resultado : (resultado.data || []);

        const contenedor = document.getElementById("contenedor_eventos") || document.querySelector(".contenido-liderazgo");
        if (!contenedor) return;

        contenedor.innerHTML = "";

        if (listaEventos.length === 0) {
            contenedor.innerHTML = "<p>No hay eventos registrados.</p>";
            return;
        }

        listaEventos.forEach(evento => {
            const esArray = Array.isArray(evento);

            const idEvento = esArray ? evento[0] : (evento.id_evento || evento.id);
            const nombreEvento = esArray ? evento[1] : (evento.nombre_evento || evento.nombre || "Evento sin nombre");
            const fecha = esArray ? evento[5] : (evento.fecha || "Sin fecha");
            const cantidadPersonas = esArray ? evento[7] : (evento.cantidad_personas ?? 0);
            const liderCocina = esArray ? evento[13] : (evento.lider_cocina || "No asignado");
            const liderServicio = esArray ? evento[14] : (evento.lider_servicio || "No asignado");

            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta_lider");
            tarjeta.dataset.id = idEvento;
            tarjeta.style.cursor = "pointer";

            tarjeta.innerHTML = `
                <div class="encabezado_tarjeta">
                    <span class="evento" style="color: #4CAF50;">${nombreEvento}</span>
                    <div class="fecha">
                        <span>${fecha}</span>
                    </div>
                </div>
                <p><strong>Líder Cocina:</strong> ${liderCocina}</p>
                <p><strong>Líder Servicio:</strong> ${liderServicio}</p>

                <div class="pie_tarjeta">
                    <div class="acciones_izquierda">
                        <a href="${RUTA_MODULO}/detalleEvento?id=${encodeURIComponent(idEvento)}" class="btn_ver_mas">Ver más</a>

                        <div class="contenedor_acciones_seccion">
                            <a href="${RUTA_MODULO}/asignarLiderazgo?id=${encodeURIComponent(idEvento)}" class="btn_asignar_liderazgo">Asignar Liderazgos</a>
                        </div>
                    </div>

                    <span class="cantidad">
                        <span>${cantidadPersonas}</span>
                        <svg width="30" height="30" viewBox="0 0 100.4 100.4">
                            <path fill="currentColor" d="M76.9,34v-2.7c3.4-2,5.6-5.7,5.6-9.7v-4.8c0-6.2-5-11.2-11.2-11.2S60,10.6,60,16.8v4.8c0,3.9,2,7.5,5.4,9.5v2.9 c-1.5,0.4-2.9,1-4.3,1.8c-2.2-5.1-7.3-8.7-13.2-8.7c-5.8,0-10.7,3.4-13,8.4c-1.3-0.6-2.6-1.2-3.9-1.5v-2.7c3.4-2,5.6-5.7,5.6-9.7 v-4.8c0-6.2-5-11.2-11.2-11.2s-11.2,5-11.2,11.2v4.8c0,3.9,2,7.5,5.4,9.5v2.9c-9,2.6-15.1,10.7-15.1,20.1c0,0.8,0.7,1.5,1.5,1.5 h29.6c0.1,0,0.2,0,0.3,0c1.2,1.9,2.9,3.5,4.9,4.7v4.5c-11.9,3.2-20,13.9-20,26.3c0,0.8,0.7,1.5,1.5,1.5h51.5c0.8,0,1.5-0.7,1.5-1.5 c0-12.3-8.5-23.2-20.3-26.3v-4.3c2.1-1.2,3.8-2.8,5.1-4.8h30.7c0.8,0,1.5-0.7,1.5-1.5C92.2,44.8,85.8,36.5,76.9,34z M7.5,52.7 c0.6-7.8,6.2-14.2,13.9-16c0.7-0.2,1.2-0.8,1.2-1.5v-5c0-0.6-0.3-1.1-0.8-1.3c-2.8-1.4-4.6-4.2-4.6-7.3v-4.8c0-4.5,3.7-8.2,8.2-8.2 s8.2,3.7,8.2,8.2v4.8c0,3.1-1.9,6-4.7,7.4c-0.5,0.2-0.9,0.8-0.9,1.4v4.8c0,0.7,0.5,1.3,1.2,1.5c1.7,0.4,3.3,1,4.8,1.8 c-0.2,1-0.3,2-0.3,3.1V48c0,1.6,0.3,3.2,0.8,4.7L7.5,52.7L7.5,52.7z M52.8,58.2c-0.5,0.2-0.9,0.8-0.9,1.4v6.4c0,0.7,0.5,1.3,1.2,1.5 c10.6,2.3,18.4,11.5,19.1,22.2H23.8c0.6-10.7,8.2-19.7,18.8-22.1c0.7-0.2,1.2-0.8,1.2-1.5v-6.6c0-0.6-0.3-1.1-0.8-1.3 c-3.9-1.9-6.3-5.8-6.3-10.1v-6.4c0-6.3,5.1-11.3,11.3-11.3s11.3,5.1,11.3,11.3V48C59.3,52.3,56.8,56.3,52.8,58.2z M61.5,52.7 c0.5-1.5,0.8-3.1,0.8-4.7v-6.4c0-0.9-0.1-1.9-0.3-2.7c1.6-1,3.4-1.7,5.2-2.1c0.7-0.2,1.2-0.8,1.2-1.5v-5c0-0.6-0.3-1.1-0.8-1.3 c-2.8-1.4-4.6-4.2-4.6-7.3v-4.8c0-4.5,3.7-8.2,8.2-8.2c4.5,0,8.2,3.7,8.2,8.2v4.8c0,3.1-1.9,6-4.7,7.4c-0.5,0.2-0.9,0.8-0.9,1.4v4.8 c0,0.7,0.5,1.3,1.2,1.5c7.7,1.7,13.4,8.3,14.1,16L61.5,52.7L61.5,52.7z" />
                        </svg>
                    </span>
                </div>
            `;

            tarjeta.addEventListener("click", (e) => {
                if (e.target.closest("a") || e.target.closest("button")) {
                    return;
                }
                const id = tarjeta.dataset.id;
                if (id) {
                    window.location.href = `${RUTA_MODULO}/detalleEvento?id=${encodeURIComponent(id)}`;
                }
            });

            contenedor.appendChild(tarjeta);
        });

        aplicarControlDeRol();

    } catch (error) {
        console.error("Error cargando eventos para liderazgo:", error);
    }
}

/** Guardar Asignación de Líderes */

function asignarLideres() {
    const formulario = document.getElementById("forma_liderazgos");
    if (!formulario) return;

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) { alert("No hay sesión iniciada"); return; }

        const id_evento = document.getElementById("select_evento").value;
        const lider_cocina = document.getElementById("select_lider_cocina").value;
        const lider_servicio = document.getElementById("select_lider_servicio").value;

        if (!id_evento) {
            alert("Por favor seleccione un evento.");
            return;
        }

        if (!lider_cocina || !lider_servicio) {
            alert("Debe seleccionar ambos líderes.");
            return;
        }

        if (lider_cocina === lider_servicio) {
            alert("El líder de cocina y el líder de servicio no pueden ser el mismo aprendiz.");
            return;
        }

        const datos = {
            lider_cocina: lider_cocina,
            lider_servicio: lider_servicio
        };

        try {
            const respuesta = await fetchConToken(`${API_BASE_URL}/eventos/${id_evento}/lideres`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if (!respuesta) return;

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                alert(resultado.mensaje || "Líderes asignados correctamente.");
                window.location.href = RUTA_MODULO + "/liderazgo";
            } else {
                alert(resultado.mensaje || resultado.error || "No fue posible asignar los líderes.");
            }
        } catch (error) {
            console.error("Error asignando líderes:", error);
            alert("Error al conectar con el servidor.");
        }
    });
}

/** Detalle Evento */

async function cargarDetalleEvento() {
    const parametros = new URLSearchParams(window.location.search);
    const idEvento = parametros.get("id");

    if (!idEvento) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No hay una sesión iniciada.");
        return;
    }

    try {
        const respuesta = await fetchConToken(
            `${API_BASE_URL}/eventos/` + encodeURIComponent(idEvento),
            { method: "GET" }
        );
        if (!respuesta) return;

        const datos = await respuesta.json();

        if (respuesta.ok) {
            const evento = datos.data || datos;
            const esArray = Array.isArray(evento);

            const mapaCampos = {
                titulo_detalle: (esArray ? evento[1] : (evento.nombre_evento || evento.nombre)) || "Descripción del Evento",
                fecha_evento: (esArray ? evento[5] : (evento.fecha_inicio || evento.fecha)) || "Sin fecha",
                lider_cocina: (esArray ? evento[13] : evento.lider_cocina) || "Sin asignar",
                lider_servicio: (esArray ? evento[14] : evento.lider_servicio) || "Sin asignar",
                nombre_menu: (esArray ? evento[16] : evento.nombre_menu) || "Sin asignar",
                tiempos_menu: (esArray ? evento[17] : evento.tiempos_menu) || "N/A",
                experiencia_evento: (esArray ? evento[8] : evento.experiencia) || "",
                descripcion_menu: (esArray ? evento[18] : evento.descripcion_menu) || "Sin descripción",
                num_personas: (esArray ? evento[7] : (evento.numero_personas ?? evento.cantidad_personas)) ?? "0"
            };

            Object.entries(mapaCampos).forEach(([id, valor]) => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.textContent = valor;
            });
        } else {
            alert(datos.mensaje || datos.error || "No fue posible cargar la información del evento.");
        }

    } catch (error) {
        console.error("Error al cargar el detalle del evento:", error);
        alert("No fue posible conectar con el servidor.");
    }
}

/** Dashboard */

async function cargarMenuResumen() {
    const token = localStorage.getItem("token");
    if (!token) {
        redireccionarALogin();
        return;
    }

    try {
        const respuesta = await fetch(`${API_BASE_URL}/programa/dashboard/menu-resumen`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            cache: "no-store"
        });
        if (respuesta.status === 401) {
            alert("Tu sesión ha expirado. Por favor ingresa nuevamente.");
            localStorage.removeItem("token");
            redireccionarALogin();
            return;
        }

        const nuevoToken = respuesta.headers.get("X-Nuevo-Token");
        if (nuevoToken) {
            localStorage.setItem("token", nuevoToken);
        }

        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.status === "success") {
            renderizarTarjetaMenu(resultado.data);
        } else {
            console.error("Error al obtener los datos del menú:", resultado.error);
        }
    } catch (error) {
        console.error("Error de conexión con el API Gateway:", error);
    }
}

function renderizarTarjetaMenu(data) {
    const contenedorMenu = document.getElementById("menu_resumen");
    if (!contenedorMenu) return;

    const contadores = contenedorMenu.querySelectorAll(".stats-menu .num");
    if (contadores.length >= 2) {
        contadores[0].textContent = data.total_platos ?? 0;
        contadores[1].textContent = data.total_menus ?? 0;
    }

    const contenedorPlatos = contenedorMenu.querySelector(".lista-platos");
    if (!contenedorPlatos) return;

    contenedorPlatos.innerHTML = "";

    if (!data.platos || data.platos.length === 0) {
        contenedorPlatos.innerHTML = "<p class='sin-datos'>No hay platos registrados.</p>";
        return;
    }

    data.platos.forEach(plato => {
        const nombre = plato.plato_nombre || plato[1];

        const cardHTML = `
            <div class="card-plato">
                <div class="info-plato">
                    <h4>${nombre}</h4>
                    <div class="cuadro-cantidad">
                    </div>
                </div>
            </div>
        `;

        contenedorPlatos.insertAdjacentHTML("beforeend", cardHTML);
    });
}

/** Crear Instructor Individual */
function crearInstructorIndividual() {
    const formulario = document.getElementById("forma_carga_individual");
    if (!formulario) return;

    formulario.onsubmit = async (evento) => {
        evento.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("No hay una sesión iniciada.");
            return;
        }

        const botonEnviar = formulario.querySelector("button[type='submit']");
        if (botonEnviar) botonEnviar.disabled = true;

        const cedula = document.getElementById("cedula")?.value.trim() || "";
        const nombres = document.getElementById("nombres")?.value.trim() || "";
        const apellidos = document.getElementById("apellidos")?.value.trim() || "";
        const correo = document.getElementById("correo")?.value.trim() || "";
        const celular = document.getElementById("celular")?.value.trim() || "";

        if (!cedula || !nombres || !apellidos || !correo || !celular) {
            console.log("Valores detectados:", { cedula, nombres, apellidos, correo, celular });
            alert("Por favor completa todos los campos del formulario.");
            if (botonEnviar) botonEnviar.disabled = false;
            return;
        }

        const datos = {
            cedula: cedula,
            nombres: nombres,
            apellidos: apellidos,
            correo: correo,
            celular: celular,
            rol_usuario: ROLES.instructor,
            fecha_fin_etapa_lectiva: null,
            ficha: null,
            programa_formacion: null
        };

        if (!correo.endsWith("@sena.edu.co")) {
            alert("El correo debe tener el dominio @sena.edu.co");
            if (botonEnviar) botonEnviar.disabled = false;
            return;
        }

        if (celular.length !== 10 || !celular.startsWith("3") || isNaN(celular)) {
            alert("El número de celular debe contener 10 dígitos e iniciar con 3.");
            if (botonEnviar) botonEnviar.disabled = false;
            return;
        }

        try {
            const respuesta = await fetchConToken(`${API_BASE_URL}/usuarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if (!respuesta) return;

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                alert(resultado.mensaje || "Instructor creado con éxito.");
                window.location.href = RUTA_MODULO + "/listaAprendices";
            } else {
                alert(resultado.error || resultado.mensaje || "Error al crear instructor.");
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("No fue posible conectar con el servidor.");
        } finally {
            if (botonEnviar) botonEnviar.disabled = false;
        }
    };
}

/*------- Carga Inicial de Funciones -------*/

document.addEventListener("DOMContentLoaded", async () => {

    const rutaActual = window.location.pathname.toLowerCase();
    const rutasPublicas = [RUTA_MODULO + "/login", RUTA_MODULO, RUTA_MODULO + "/"].map(r => r.toLowerCase());

    if (!rutasPublicas.includes(rutaActual)) {
        await verificarSesion();
        aplicarControlDeRol();
    }

    if (document.getElementById("usuario")) {
        recordatorioCorreo(0);
    }

    const btn_menu = document.getElementById("btn_menu");
    const opcs_menu = document.getElementById("opcs_menu");
    if (btn_menu && opcs_menu) {
        btn_menu.addEventListener("click", () => {
            controlVista(opcs_menu);
        });
    }

    /** Login */
    if (document.getElementById("forma_entrar")) {
        iniciarSesion();
    }

    /** Lista Principal */
    if (document.getElementById("lista_ppal")) {
        cargarAprendices();
        inicializarFiltro();
    }

    /** Modificar Aprendiz */
    const parametrosUrl = new URLSearchParams(window.location.search);
    if (document.getElementById("nombre") && document.getElementById("apellido") && parametrosUrl.has("id")) {
        cargarDatosAprendiz();
    }

    const formularioModificar = document.querySelector(".formulario");
    if (formularioModificar && parametrosUrl.has("id")) {
        formularioModificar.addEventListener("submit", (evento) => {
            evento.preventDefault();
            modificarAprendiz();
        });
    }

    /** Carga Masiva */
    if (document.getElementById("forma_carga_masiva")) {
        cargarAprendicesMasiva();
    }

    /** Carga Individual */
    if (document.getElementById("forma_carga_individual")) {
        if (window.location.pathname.includes("instructor")) {
            crearInstructorIndividual();
        } else {
            crearUsuarioIndividual();
        }
    }

    /** Liderazgo Eventos Dinámicos */
    if (document.getElementById("contenedor_eventos") || document.querySelector(".contenido-liderazgo")) {
        cargarEventosLiderazgo();
    }

    /** Asignar Liderazgo */
    if (document.getElementById("forma_liderazgos")) {
        cargarEventosYAprendices();
        asignarLideres();
    }

    if (document.getElementById("contenedor_detalle_aprendiz") && parametrosUrl.has("id")) {
        cargarDetalleAprendiz();
    }

    if (document.getElementById("fecha_evento") && parametrosUrl.has("id")) {
        cargarDetalleEvento();
    }

    /** Dashboard */
    if (document.getElementById("menu_resumen")) {
        cargarMenuResumen();

        // Cargar fechas de eventos en el calendario
        cargarFechasEventos();

        const btnPrev = document.getElementById('btn-prev-mes');
        const btnNext = document.getElementById('btn-next-mes');
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                fechaActual.setMonth(fechaActual.getMonth() - 1);
                generarCalendarioTabla();
            });
        }
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                fechaActual.setMonth(fechaActual.getMonth() + 1);
                generarCalendarioTabla();
            });
        }
    }

    const opcionesTipo = document.querySelectorAll(".selector_tipo_usuario .opcion_tipo");
    opcionesTipo.forEach(enlace => {
        const href = (enlace.getAttribute("href") || "").toLowerCase();
        if (href && rutaActual.includes(href)) {
            enlace.classList.add("activa");
        } else {
            enlace.classList.remove("activa");
        }
    });
});

let fechaActual = new Date();
let fechasEventosActivos = [];


async function cargarFechasEventos() {
    const cuerpoTabla = document.getElementById('cuerpo-calendario');
    const labelMes = document.getElementById('mes-actual');
    if (!cuerpoTabla || !labelMes) return;

    try {
        const respuesta = await fetchConToken(`${API_BASE_URL}/programa/dashboard/eventos`);
        if (!respuesta || !respuesta.ok) {
            generarCalendarioTabla();
            return;
        }

        const resultado = await respuesta.json();
        const eventos = resultado.data || [];

        fechasEventosActivos = eventos.map(ev => {
            const fechaRaw = Array.isArray(ev) ? ev[2] : (ev.fecha_inicio || ev.fecha);
            if (!fechaRaw) return null;

            const raw = fechaRaw.toString();


            const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

            const mesesMap = {
                Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
                Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
            };
            const gmtMatch = raw.match(/(\d{1,2})\s([A-Za-z]{3})\s(\d{4})/);
            if (gmtMatch) {
                const dia = gmtMatch[1].padStart(2, '0');
                const mes = mesesMap[gmtMatch[2]] || null;
                const anio = gmtMatch[3];
                if (mes) return `${anio}-${mes}-${dia}`;
            }

            const d = new Date(raw);
            if (isNaN(d.getTime())) return null;
            const yyyy = d.getUTCFullYear();
            const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(d.getUTCDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }).filter(Boolean);

        generarCalendarioTabla();
    } catch (error) {
        console.error("Error al cargar fechas de eventos para el calendario:", error);
        generarCalendarioTabla();
    }
}

function generarCalendarioTabla() {
    const cuerpoTabla = document.getElementById('cuerpo-calendario');
    const labelMes = document.getElementById('mes-actual');

    if (!cuerpoTabla || !labelMes) return;

    cuerpoTabla.innerHTML = '';

    const hoy = new Date();
    const diaHoy = hoy.getDate();
    const mesHoy = hoy.getMonth();
    const añoHoy = hoy.getFullYear();

    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    labelMes.textContent = `${meses[mes]} de ${año}`;

    const primerDiaSemana = new Date(año, mes, 1).getDay();
    const totalDias = new Date(año, mes + 1, 0).getDate();

    let diaContador = 1;

    for (let i = 0; i < 6; i++) {
        let tr = document.createElement('tr');
        let filaVacia = true;

        for (let j = 0; j < 7; j++) {
            let td = document.createElement('td');
            td.classList.add('dia-o');

            if ((i === 0 && j < primerDiaSemana) || diaContador > totalDias) {
                td.textContent = '';
            } else {
                td.textContent = diaContador;
                filaVacia = false;

                if (diaContador === diaHoy && mes === mesHoy && año === añoHoy) {
                    td.classList.add('dia-hoy');
                }

                let mesFormateado = String(mes + 1).padStart(2, '0');
                let diaFormateado = String(diaContador).padStart(2, '0');
                let fechaString = `${año}-${mesFormateado}-${diaFormateado}`;

                if (fechasEventosActivos.includes(fechaString)) {
                    td.classList.add('dia-even');
                }

                diaContador++;
            }
            tr.appendChild(td);
        }

        if (!filaVacia) {
            cuerpoTabla.appendChild(tr);
        }
    }
}



async function renderizarInsumosAlerta() {
    const contenedor = document.getElementById('contenedor-insumos');
    if (!contenedor) return;

    contenedor.innerHTML = '<p class="cargando">Consultando estado del inventario...</p>';

    try {
        const respuesta = await fetchConToken(`${API_BASE_URL}/dashboard/completo`);
        if (!respuesta || !respuesta.ok) return;

        const resultado = await respuesta.json();

        if (resultado && resultado.data) {
            renderizarResumenEventos(resultado.data.eventos);
            renderizarAgendaAprendices(resultado.data.lideres);
        }

        const insumosCriticos = resultado.data?.inventario_alerta || [];

        contenedor.innerHTML = '';

        if (!Array.isArray(insumosCriticos) || insumosCriticos.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-stock-ok">
                    <span class="icono-ok">✓</span>
                    <p>Todos los insumos cuentan con stock suficiente.</p>
                </div>`;
            return;
        }

        insumosCriticos.forEach(item => {
            const divItem = document.createElement('div');

            const nombre = Array.isArray(item) ? item[0] : (item.nombre || 'Insumo');
            const cantidad = parseFloat(Array.isArray(item) ? item[1] : (item.cantidad ?? item.stock ?? 0));
            const unidad = Array.isArray(item) ? item[2] : (item.unidad_medida || item.unidad || '');

            let claseColor = 'amarillo';

            if (Array.isArray(item) && item[3]) {
                claseColor = item[3].toLowerCase();
            } else if (item.color || item.nivel) {
                claseColor = (item.color || item.nivel).toLowerCase();
            } else if (cantidad <= 2) {
                claseColor = 'rojo';
            }

            divItem.className = `item-insumo ${claseColor}`;

            divItem.innerHTML = `
                <span>${nombre}</span>
                <strong>${cantidad} ${unidad}</strong>
            `;
            contenedor.appendChild(divItem);
        });

    } catch (error) {
        console.error('Error cargando inventario:', error);
        contenedor.innerHTML = `<div class="mensaje-error"><p>No se pudo obtener el inventario.</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', renderizarInsumosAlerta);

function renderizarResumenEventos(eventos) {
    const contenedor = document.querySelector('#resumen_eventos .lista-eventos');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (!eventos || eventos.length === 0) {
        contenedor.innerHTML = '<p class="sin-datos">No hay eventos próximos.</p>';
        return;
    }

    eventos.forEach(ev => {
        const nombre = Array.isArray(ev) ? ev[1] : ev.nombre_evento;
        const fechaInicio = Array.isArray(ev) ? ev[2] : ev.fecha_inicio;
        const fechaFin = Array.isArray(ev) ? ev[3] : ev.fecha_fin;

        let fechaTexto = 'Sin fecha';
        let horaTexto = '';

        if (fechaInicio) {
            const dateObj = new Date(fechaInicio);
            const meses = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];
            fechaTexto = `${dateObj.getDate()} - ${meses[dateObj.getMonth()]} - ${dateObj.getFullYear()}`;

            const formatTime = (dateStr) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                let hours = d.getHours();
                let minutes = d.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                minutes = minutes < 10 ? '0' + minutes : minutes;
                return hours + ':' + minutes + ' ' + ampm;
            };

            const horaIniStr = formatTime(fechaInicio);
            const horaFinStr = fechaFin ? formatTime(fechaFin) : '';
            horaTexto = horaFinStr ? `${horaIniStr} - ${horaFinStr}` : horaIniStr;
        }

        const item = document.createElement('div');
        item.className = 'item-evento';
        item.innerHTML = `
            <span class="nombre-evento verde">${nombre}</span>
            <div class="fecha-evento">
                <small>${fechaTexto}</small>
                <small>${horaTexto}</small>
            </div>
        `;
        contenedor.appendChild(item);
    });
}

function renderizarAgendaAprendices(lideres) {
    const contenedor = document.querySelector('#agenda_aprendices .lista-agenda');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (!lideres || lideres.length === 0) {
        contenedor.innerHTML = '<p class="sin-datos">No hay aprendices asignados a próximos eventos.</p>';
        return;
    }

    lideres.forEach(ld => {
        const nombre = Array.isArray(ld) ? ld[0] : ld.nombre_evento;
        const fecha = Array.isArray(ld) ? ld[1] : ld.fecha_inicio;
        const personas = Array.isArray(ld) ? ld[2] : ld.numero_personas;
        const liderCocina = Array.isArray(ld) ? ld[3] : ld.lider_cocina;
        const liderServicio = Array.isArray(ld) ? ld[4] : ld.lider_servicio;

        let fechaTexto = 'Sin fecha';
        if (fecha) {
            const dateObj = new Date(fecha);
            const meses = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];
            fechaTexto = `${dateObj.getDate()} - ${meses[dateObj.getMonth()]} - ${dateObj.getFullYear()}`;
        }

        const item = document.createElement('div');
        item.className = 'card-agenda';
        item.innerHTML = `
            <div class="header-agenda">
                <strong class="verde">${nombre}</strong>
                <small>${fechaTexto}</small>
            </div>
            <div class="lideres">
                <p>Líder Cocina: <span>${liderCocina || 'Sin Asignar'}</span></p>
                <p>Líder Servicio: <span>${liderServicio || 'Sin Asignar'}</span></p>
            </div>
            <div class="personas">
                <svg id="personas" style="enable-background:new 0 0 100.4 100.4;" version="1.1" viewBox="0 0 100.4 100.4" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <path fill="currentColor" d="M76.9,34v-2.7c3.4-2,5.6-5.7,5.6-9.7v-4.8c0-6.2-5-11.2-11.2-11.2S60,10.6,60,16.8v4.8c0,3.9,2,7.5,5.4,9.5v2.9  c-1.5,0.4-2.9,1-4.3,1.8c-2.2-5.1-7.3-8.7-13.2-8.7c-5.8,0-10.7,3.4-13,8.4c-1.3-0.6-2.6-1.2-3.9-1.5v-2.7c3.4-2,5.6-5.7,5.6-9.7  v-4.8c0-6.2-5-11.2-11.2-11.2s-11.2,5-11.2,11.2v4.8c0,3.9,2,7.5,5.4,9.5v2.9c-9,2.6-15.1,10.7-15.1,20.1c0,0.8,0.7,1.5,1.5,1.5  h29.6c0.1,0,0.2,0,0.3,0c1.2,1.9,2.9,3.5,4.9,4.7v4.5c-11.9,3.2-20,13.9-20,26.3c0,0.8,0.7,1.5,1.5,1.5h51.5c0.8,0,1.5-0.7,1.5-1.5  c0-12.3-8.5-23.2-20.3-26.3v-4.3c2.1-1.2,3.8-2.8,5.1-4.8h30.7c0.8,0,1.5-0.7,1.5-1.5C92.2,44.8,85.8,36.5,76.9,34z M7.5,52.7  c0.6-7.8,6.2-14.2,13.9-16c0.7-0.2,1.2-0.8,1.2-1.5v-5c0-0.6-0.3-1.1-0.8-1.3c-2.8-1.4-4.6-4.2-4.6-7.3v-4.8c0-4.5,3.7-8.2,8.2-8.2  s8.2,3.7,8.2,8.2v4.8c0,3.1-1.9,6-4.7,7.4c-0.5,0.2-0.9,0.8-0.9,1.4v4.8c0,0.7,0.5,1.3,1.2,1.5c1.7,0.4,3.3,1,4.8,1.8  c-0.2,1-0.3,2-0.3,3.1V48c0,1.6,0.3,3.2,0.8,4.7L7.5,52.7L7.5,52.7z M52.8,58.2c-0.5,0.2-0.9,0.8-0.9,1.4v6.4c0,0.7,0.5,1.3,1.2,1.5  c10.6,2.3,18.4,11.5,19.1,22.2H23.8c0.6-10.7,8.2-19.7,18.8-22.1c0.7-0.2,1.2-0.8,1.2-1.5v-6.6c0-0.6-0.3-1.1-0.8-1.3  c-3.9-1.9-6.3-5.8-6.3-10.1v-6.4c0-6.3,5.1-11.3,11.3-11.3s11.3,5.1,11.3,11.3V48C59.3,52.3,56.8,56.3,52.8,58.2z M61.5,52.7  c0.5-1.5,0.8-3.1,0.8-4.7v-6.4c0-0.9-0.1-1.9-0.3-2.7c1.6-1,3.4-1.7,5.2-2.1c0.7-0.2,1.2-0.8,1.2-1.5v-5c0-0.6-0.3-1.1-0.8-1.3  c-2.8-1.4-4.6-4.2-4.6-7.3v-4.8c0-4.5,3.7-8.2,8.2-8.2c4.5,0,8.2,3.7,8.2,8.2v4.8c0,3.1-1.9,6-4.7,7.4c-0.5,0.2-0.9,0.8-0.9,1.4v4.8  c0,0.7,0.5,1.3,1.2,1.5c7.7,1.7,13.4,8.3,14.1,16L61.5,52.7L61.5,52.7z"/>
                </svg>
                <span>${personas || '0'}</span>
            </div>
        `;
        contenedor.appendChild(item);
    });
}