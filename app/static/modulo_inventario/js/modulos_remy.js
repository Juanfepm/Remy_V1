/* Direcciones de los modulos de REMY (cada modulo corre como un servicio aparte).
   Si un modulo cambia de puerto, se actualiza solo aqui.
   Un modulo con URL vacia se muestra como "no disponible" en el menu. */
const HOST_REMY = window.location.hostname || '127.0.0.1';

const MODULOS_REMY = {
    // API Gateway (modulo_aprendices/services/Api_Gateway.py)
    gateway: `http://${HOST_REMY}:5101`,
    // Vistas de aprendices y liderazgo (modulo_aprendices/principal.py)
    aprendices: `http://${HOST_REMY}:5100`,
    // Vistas de menus y platos (modulo_platos/app.py)
    platos: `http://${HOST_REMY}:5000`,
    // Modulo de reservas: aun no tiene servidor en el proyecto
    reservas: '',
    // Este mismo modulo (inventario)
    inventario: window.location.origin && window.location.origin.startsWith('http') ? window.location.origin : `http://${HOST_REMY}:5200`
};

// Asigna el href de los enlaces marcados con data-modulo y data-ruta
function configurarEnlacesModulos(contenedor = document) {
    contenedor.querySelectorAll('a[data-modulo]').forEach(enlace => {
        const base = MODULOS_REMY[enlace.dataset.modulo];
        if (!base) {
            enlace.removeAttribute('href');
            // Fuera del menu lateral, un enlace a un modulo inexistente simplemente no se muestra
            if (!enlace.classList.contains('item-menu')) {
                enlace.hidden = true;
                return;
            }
            enlace.classList.add('item-menu-no-disponible');
            enlace.setAttribute('aria-disabled', 'true');
            enlace.title = 'Módulo aún no disponible';
            return;
        }
        enlace.href = `${base}${enlace.dataset.ruta || '/'}`;
    });
}
