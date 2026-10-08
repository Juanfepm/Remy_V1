/*-------Declaracion de funciones------- */

function validarCampoCorreo(id_campo) {
    const campo_usuario = document.getElementById(id_campo);
    const cont_palabra = document.getElementById("cont_palabra");
    if (!campo_usuario || !cont_palabra) return;

    campo_usuario.addEventListener("keyup", () => {
        // Mantiene visible el campo contraseña si ya empezó a escribir o tiene longitud mínima
        if (campo_usuario.value.length >= 18) {
            cont_palabra.style.opacity = "1";
        }
    });
}

function recordatorioCorreo(bandera) {
    const usuario = document.getElementById("usuario");
    if (!usuario) return;

    usuario.addEventListener("focus", () => {
        if (bandera === 0) {
            console.log("Recordatorio: usa el correo institucional @soy.sena.edu.co");
            bandera = 1;
        }
    });
}

function inicializarLogin() {
    const form = document.getElementById("forma_entrar");
    if (!form) return;

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const usuarioInput = document.getElementById("usuario");
        const palabraInput = document.getElementById("palabra");
        const btnEntrar = document.getElementById("btn_entrar");

        const correo = usuarioInput ? usuarioInput.value.trim() : "";
        const palabra = palabraInput ? palabraInput.value.trim() : "";

        if (!correo || !palabra) {
            alert("Por favor completa los campos de correo y contraseña.");
            return;
        }

        if (btnEntrar) {
            btnEntrar.textContent = "INICIANDO...";
            btnEntrar.disabled = true;
        }

        try {
            const respuesta = await fetch(`${RAIZ}/inventario/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario: correo,
                    palabra: palabra
                })
            });

            const data = await respuesta.json();

            if (!respuesta.ok || !data.ok) {
                alert(data.error || "Credenciales incorrectas.");
                if (btnEntrar) {
                    btnEntrar.textContent = "ENTRAR";
                    btnEntrar.disabled = false;
                }
                return;
            }

            // Guardamos información del usuario en sessionStorage y localStorage
            sessionStorage.setItem("usuario_sesion", JSON.stringify(data.usuario));
            localStorage.setItem("usuario_sesion", JSON.stringify(data.usuario));

            // Redirigir a panel aprendiz
            window.location.href = data.redirect || "panel_aprendiz.html";

        } catch (error) {
            console.error("Error al conectar con el backend:", error);
            alert("No fue posible conectar con el servidor. Intenta de nuevo en unos minutos.");
            if (btnEntrar) {
                btnEntrar.textContent = "ENTRAR";
                btnEntrar.disabled = false;
            }
        }
    });
}

function inicializarMenuMovil() {
    const menuCheckbox = document.getElementById('checkbox_menu');
    if (!menuCheckbox) return;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuCheckbox.checked) {
            menuCheckbox.checked = false;
        }
    });

    document.querySelectorAll('#menu_lateral a, #menu_lateral span, .pie-menu-lateral a').forEach(item => {
        item.addEventListener('click', () => {
            menuCheckbox.checked = false;
        });
    });
}

/*-------Carga Inicial de funciones-------*/

document.addEventListener("DOMContentLoaded", () => {
    recordatorioCorreo(0);
    validarCampoCorreo("usuario");
    inicializarLogin();
    inicializarMenuMovil();
});