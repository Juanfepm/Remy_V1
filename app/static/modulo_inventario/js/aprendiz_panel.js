/* URL Base del API Gateway (definida en modulos_remy.js) */
const GATEWAY_URL = MODULOS_REMY.gateway;

// Cada cuanto se vuelve a consultar la informacion de los otros modulos
const INTERVALO_ACTUALIZACION_MS = 30000;

const MESES_APRENDIZ = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const apprenticeMonth = new Date();
apprenticeMonth.setDate(1);

// Fechas (YYYY-MM-DD) con eventos activos y con reservas, para marcarlas en el calendario
let apprenticeEventDates = [];
let apprenticeReservationDates = [];

async function fetchGateway(path) {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
        throw new Error('sin_sesion');
    }

    const response = await fetch(`${GATEWAY_URL}${path}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        cache: 'no-store'
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('sin_sesion');
    }

    const newToken = response.headers.get('X-Nuevo-Token');
    if (newToken) localStorage.setItem('token', newToken);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function fetchInventario(path) {
    const response = await fetch(`${MODULOS_REMY.inventario}${path}`, { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok || result.status !== 'success') throw new Error(result.message || `HTTP ${response.status}`);
    return result;
}

// Primero pide los datos al modulo dueño por el API Gateway; si no responde,
// usa el respaldo de solo lectura de nuestro backend sobre remy_unificado
async function fetchConRespaldo(gatewayPath, respaldoPath) {
    try {
        return await fetchGateway(gatewayPath);
    } catch (error) {
        console.warn(`API Gateway no disponible para ${gatewayPath} (${error.message}); se usa el respaldo ${respaldoPath}`);
        return fetchInventario(respaldoPath);
    }
}

function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

// Acepta los formatos que devuelven los servicios: "22/05/2026 08:00 AM", "22/05/2026", ISO o GMT
function parseApprenticeDate(raw) {
    if (!raw) return null;
    const text = String(raw).trim();

    const local = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*([AaPp][Mm])?)?/);
    if (local) {
        let hours = Number(local[4] || 0);
        const period = (local[6] || '').toUpperCase();
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return {
            date: new Date(Number(local[3]), Number(local[2]) - 1, Number(local[1]), hours, Number(local[5] || 0)),
            hasTime: Boolean(local[4])
        };
    }

    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
    if (iso) {
        return {
            date: new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), Number(iso[4] || 0), Number(iso[5] || 0)),
            hasTime: Boolean(iso[4])
        };
    }

    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return null;
    return {
        date: new Date(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), parsed.getUTCHours(), parsed.getUTCMinutes()),
        hasTime: /\d{1,2}:\d{2}/.test(text)
    };
}

function formatApprenticeDay(date) {
    return `${String(date.getDate()).padStart(2, '0')} - ${MESES_APRENDIZ[date.getMonth()]} - ${date.getFullYear()}`;
}

function formatApprenticeTime(date) {
    const hours = date.getHours();
    return `${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}

function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Filas de GET /eventos (asignarLiderazgo): [id_evento, nombre_evento, estado, correo_fk, franja_horaria,
// fecha_inicio, fecha_fin, numero_personas, experiencia, id_menu_fk, ..., lider_cocina, lider_servicio, costo_total]
function normalizeEvent(row) {
    const get = (index, key) => (Array.isArray(row) ? row[index] : row[key]);
    return {
        nombre: get(1, 'nombre_evento') || get(0, 'id_evento') || 'Evento',
        franja: get(4, 'franja_horaria') || '',
        inicio: parseApprenticeDate(get(5, 'fecha_inicio')),
        fin: parseApprenticeDate(get(6, 'fecha_fin')),
        personas: get(7, 'numero_personas') ?? '',
        liderCocina: get(13, 'lider_cocina') || 'Sin asignar',
        liderServicio: get(14, 'lider_servicio') || 'Sin asignar'
    };
}

function renderApprenticeCalendar() {
    const monthLabel = document.getElementById('mes_actual_aprendiz');
    const calendarBody = document.getElementById('cuerpo_calendario_aprendiz');
    if (!monthLabel || !calendarBody) return;

    const year = apprenticeMonth.getFullYear();
    const month = apprenticeMonth.getMonth();
    const today = new Date();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = apprenticeMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    monthLabel.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    calendarBody.replaceChildren();

    const weeks = Math.ceil((firstWeekday + daysInMonth) / 7);
    for (let week = 0; week < weeks; week += 1) {
        const row = document.createElement('tr');
        for (let weekday = 0; weekday < 7; weekday += 1) {
            const cell = document.createElement('td');
            const day = week * 7 + weekday - firstWeekday + 1;
            if (day > 0 && day <= daysInMonth) {
                cell.textContent = String(day);
                cell.classList.add('dia-o', 'dia-calendario');
                if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    cell.classList.add('dia-hoy');
                    cell.setAttribute('aria-current', 'date');
                } else {
                    const key = dateKey(new Date(year, month, day));
                    const marks = [];
                    if (apprenticeEventDates.includes(key)) marks.push('evento');
                    if (apprenticeReservationDates.includes(key)) marks.push('reservas');
                    if (marks.length) {
                        cell.classList.add('dia-even');
                        cell.title = `Día con ${marks.join(' y ')}`;
                    }
                }
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }
}

function formatApprenticeQuantity(value) {
    const quantity = Number(value);
    if (!Number.isFinite(quantity)) return String(value ?? '0');
    return quantity.toFixed(3).replace(/\.?0+$/, '');
}

async function loadApprenticeInventoryAlerts() {
    const list = document.getElementById('lista_alertas_aprendiz');
    const state = document.getElementById('estado_alertas_aprendiz');
    if (!list || !state) return;

    try {
        const [ingredientsResponse, categoriesResponse] = await Promise.all([
            fetch(`${MODULOS_REMY.inventario}/ingredientes/`, { cache: 'no-store' }),
            fetch(`${MODULOS_REMY.inventario}/categoria/`, { cache: 'no-store' }).catch(() => null)
        ]);
        if (!ingredientsResponse.ok) throw new Error('No se pudo consultar el inventario');
        const ingredients = await ingredientsResponse.json();
        const categories = categoriesResponse?.ok ? await categoriesResponse.json() : [];
        const categoryNames = new Map(categories.map(category => [String(category.id_categoria), category.nombre]));
        const alerts = ingredients.filter(item => {
            const stock = Number(item.stock) || 0;
            const minimum = Number(item.stock_minimo) || 0;
            return stock <= 0 || (minimum > 0 && stock <= minimum);
        });

        list.replaceChildren();
        if (alerts.length === 0) {
            state.hidden = false;
            state.textContent = 'Todos los insumos tienen existencias suficientes.';
            return;
        }

        state.hidden = true;
        alerts.forEach(item => {
            const stock = Number(item.stock) || 0;
            const alert = document.createElement('li');
            alert.className = `item-alerta-instructor${stock <= 0 ? ' stock-agotado' : ''}`;
            const info = document.createElement('div');
            info.className = 'info-alerta-instructor';
            const name = document.createElement('p');
            name.className = 'nombre-alerta-instructor';
            name.textContent = item.nombre || 'Insumo';
            const category = document.createElement('p');
            category.className = 'categoria-alerta-instructor';
            category.textContent = categoryNames.get(String(item.categoria)) || item.categoria || 'Sin categoría';
            const quantity = document.createElement('p');
            quantity.className = 'stock-alerta-instructor';
            quantity.textContent = `${formatApprenticeQuantity(item.stock)} ${item.unidad || ''}`.trim();
            info.append(name, category);
            alert.append(info, quantity);
            list.appendChild(alert);
        });
    } catch (error) {
        console.error('Error al cargar las alertas del inventario:', error);
        state.hidden = false;
        state.textContent = 'No se pudo cargar el inventario.';
        list.replaceChildren();
    }
}

function showPanelState(stateId, message) {
    const state = document.getElementById(stateId);
    if (!state) return;
    state.hidden = !message;
    state.textContent = message || '';
}

function renderApprenticeEvents(events) {
    const list = document.getElementById('lista_eventos_aprendiz');
    if (!list) return;
    list.replaceChildren();

    if (events.length === 0) {
        showPanelState('estado_eventos_aprendiz', 'No hay eventos próximos.');
        return;
    }
    showPanelState('estado_eventos_aprendiz', '');

    events.forEach(event => {
        const item = document.createElement('li');
        item.className = 'evento-item';

        const name = document.createElement('p');
        name.className = 'nombre-evento letra-verde';
        name.textContent = event.nombre;

        const date = document.createElement('p');
        date.className = 'fecha-evento letra-gris-dark';
        date.append(event.inicio ? formatApprenticeDay(event.inicio.date) : 'Sin fecha');

        let schedule = event.franja;
        if (event.inicio?.hasTime) {
            schedule = formatApprenticeTime(event.inicio.date);
            if (event.fin?.hasTime) schedule += ` - ${formatApprenticeTime(event.fin.date)}`;
        }
        if (schedule) date.append(document.createElement('br'), schedule);

        item.append(name, date);
        list.appendChild(item);
    });
}

function renderApprenticeAgenda(events) {
    const list = document.getElementById('lista_agenda_aprendiz');
    if (!list) return;
    list.replaceChildren();

    if (events.length === 0) {
        showPanelState('estado_agenda_aprendiz', 'No hay aprendices asignados a eventos.');
        return;
    }
    showPanelState('estado_agenda_aprendiz', '');

    events.forEach(event => {
        const item = document.createElement('article');
        item.className = 'liderazgo-item';

        const header = document.createElement('div');
        header.className = 'cabecera-liderazgo';
        const name = document.createElement('p');
        name.className = 'nombre-liderazgo letra-verde';
        name.textContent = event.nombre;
        const date = document.createElement('p');
        date.className = 'fecha-liderazgo letra-gris-dark';
        date.textContent = event.inicio ? formatApprenticeDay(event.inicio.date) : 'Sin fecha';
        header.append(name, date);

        const kitchen = document.createElement('p');
        kitchen.className = 'responsable-liderazgo letra-gris-dark';
        kitchen.textContent = `Líder de cocina: ${event.liderCocina}`;
        const service = document.createElement('p');
        service.className = 'responsable-liderazgo letra-gris-dark';
        service.textContent = `Líder de servicio: ${event.liderServicio}`;

        const people = document.createElement('p');
        people.className = 'cantidad-liderazgo letra-azul-dark';
        people.textContent = String(event.personas);
        people.title = 'Número de personas';

        item.append(header, kitchen, service, people);
        list.appendChild(item);
    });
}

async function loadApprenticeEvents() {
    try {
        const result = await fetchConRespaldo('/eventos', '/dashboard/eventos');
        const events = (result.data || [])
            .map(normalizeEvent)
            .sort((a, b) => (a.inicio?.date.getTime() ?? Infinity) - (b.inicio?.date.getTime() ?? Infinity));

        apprenticeEventDates = events.filter(event => event.inicio).map(event => dateKey(event.inicio.date));
        renderApprenticeCalendar();

        // En las listas solo los eventos de hoy en adelante; el calendario muestra todos
        const today = startOfToday();
        const upcoming = events.filter(event => event.inicio && event.inicio.date >= today).slice(0, 4);
        renderApprenticeEvents(upcoming);
        renderApprenticeAgenda(upcoming);
    } catch (error) {
        console.error('Error al cargar los eventos:', error);
        showPanelState('estado_eventos_aprendiz', 'No se pudieron consultar los eventos.');
        showPanelState('estado_agenda_aprendiz', 'No se pudo consultar la agenda.');
    }
}

function renderApprenticeReservations(days) {
    const list = document.getElementById('lista_reservas_aprendiz');
    if (!list) return;
    list.replaceChildren();

    if (days.length === 0) {
        showPanelState('estado_reservas_aprendiz', 'No hay reservas próximas.');
        return;
    }
    showPanelState('estado_reservas_aprendiz', '');

    days.forEach(day => {
        const item = document.createElement('li');
        item.className = 'evento-item';

        const title = document.createElement('p');
        title.className = 'nombre-evento letra-verde';
        title.textContent = `${day.total_reservas} ${day.total_reservas === 1 ? 'reserva' : 'reservas'} · ${day.total_menus} ${day.total_menus === 1 ? 'menú' : 'menús'}`;

        const detail = document.createElement('p');
        detail.className = 'fecha-evento letra-gris-dark';
        detail.append(formatApprenticeDay(day.fecha.date));
        if (day.hora) detail.append(` · ${day.hora}`);
        detail.append(document.createElement('br'), day.menu ? `Menú: ${day.menu}` : 'Menú sin programar');

        item.append(title, detail);
        list.appendChild(item);
    });
}

async function loadApprenticeReservations() {
    try {
        // Reservas no tiene servicio propio todavia: los datos salen de remy_unificado
        const result = await fetchInventario('/dashboard/reservas');
        const days = (result.data || [])
            .map(day => ({ ...day, fecha: parseApprenticeDate(day.fecha) }))
            .filter(day => day.fecha);

        apprenticeReservationDates = days.map(day => dateKey(day.fecha.date));
        renderApprenticeCalendar();

        const today = startOfToday();
        renderApprenticeReservations(days.filter(day => day.fecha.date >= today).slice(0, 5));
    } catch (error) {
        console.error('Error al cargar las reservas:', error);
        showPanelState('estado_reservas_aprendiz', 'No se pudieron consultar las reservas.');
    }
}

// Misma regla que usa el modulo de platos (platos_menu.js): enlace completo
// o nombre de archivo servido por el modulo de platos en /img_remy
function dishImageUrl(img) {
    const value = String(img || '').trim();
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return MODULOS_REMY.platos ? `${MODULOS_REMY.platos}/img_remy/${value}` : null;
}

async function loadApprenticeMenu() {
    const container = document.getElementById('menu_resumen_aprendiz');
    const list = document.getElementById('lista_platos_aprendiz');
    const template = document.getElementById('plantilla_plato_aprendiz');
    if (!container || !list || !template) return;

    try {
        const result = await fetchConRespaldo('/dashboard/menu-resumen', '/dashboard/menu-resumen');
        if (result.status !== 'success') throw new Error(result.message || 'Respuesta inválida');
        const data = result.data || {};
        const dishes = data.platos || [];

        document.getElementById('total_platos_aprendiz').textContent = data.total_platos ?? dishes.length;
        document.getElementById('total_menus_aprendiz').textContent = data.total_menus ?? 0;
        document.getElementById('valor_total_platos_aprendiz').textContent = data.total_platos ?? dishes.length;

        list.replaceChildren();
        dishes.forEach(dish => {
            const item = template.content.firstElementChild.cloneNode(true);
            const name = Array.isArray(dish) ? dish[1] : dish.plato_nombre;
            const category = Array.isArray(dish) ? dish[2] : dish.categoria;
            const thumbnail = item.querySelector('.miniatura-plato');
            thumbnail.setAttribute('aria-label', name || 'Plato');
            const imageUrl = dishImageUrl(Array.isArray(dish) ? null : dish.img_plato);
            if (imageUrl) {
                // Si la imagen no carga se deja el dibujo de la plantilla
                const placeholder = thumbnail.querySelector('svg');
                const image = document.createElement('img');
                image.src = imageUrl;
                image.alt = name || 'Plato';
                image.loading = 'lazy';
                image.addEventListener('error', () => image.replaceWith(placeholder));
                placeholder.replaceWith(image);
            }
            item.querySelector('.nombre-plato').textContent = name || 'Plato';
            item.querySelector('.detalle-plato').textContent = category || '';
            list.appendChild(item);
        });

        container.hidden = false;
        showPanelState('estado_menu_aprendiz', dishes.length === 0 ? 'No hay platos activos en el menú.' : '');
    } catch (error) {
        console.error('Error al cargar el menú:', error);
        container.hidden = true;
        showPanelState('estado_menu_aprendiz', 'No se pudo consultar el menú.');
    }
}

let apprenticeRefreshRunning = false;

async function refreshApprenticeDashboard() {
    if (apprenticeRefreshRunning) return;
    apprenticeRefreshRunning = true;
    try {
        await Promise.all([
            loadApprenticeInventoryAlerts(),
            loadApprenticeEvents(),
            loadApprenticeMenu(),
            loadApprenticeReservations()
        ]);
    } finally {
        apprenticeRefreshRunning = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderApprenticeCalendar();
    document.getElementById('mes_anterior_aprendiz')?.addEventListener('click', () => {
        apprenticeMonth.setMonth(apprenticeMonth.getMonth() - 1);
        renderApprenticeCalendar();
    });
    document.getElementById('mes_siguiente_aprendiz')?.addEventListener('click', () => {
        apprenticeMonth.setMonth(apprenticeMonth.getMonth() + 1);
        renderApprenticeCalendar();
    });

    const session = sessionStorage.getItem('usuario_sesion') || localStorage.getItem('usuario_sesion');
    if (session) {
        try {
            const user = JSON.parse(session);
            const userInfo = document.getElementById('usuario_info');
            if (userInfo && user.nombre) userInfo.textContent = `Hola, ${user.nombre} (${user.rol_nombre || 'Aprendiz'})`;
        } catch (error) {
            console.error('No se pudo leer la sesión del usuario:', error);
        }
    }

    document.getElementById('btn_cerrar_sesion')?.addEventListener('click', () => {
        sessionStorage.removeItem('usuario_sesion');
        localStorage.removeItem('usuario_sesion');
        localStorage.removeItem('token');
        localStorage.removeItem('rol_usuario');
        window.location.href = 'index.html';
    });

    const menuCheckbox = document.getElementById('checkbox_menu');
    document.querySelectorAll('#menu_lateral a').forEach(link => {
        link.addEventListener('click', () => {
            if (menuCheckbox) menuCheckbox.checked = false;
        });
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuCheckbox?.checked) menuCheckbox.checked = false;
    });

    configurarEnlacesModulos();
    refreshApprenticeDashboard();

    // Actualizacion periodica mientras la pestaña esta visible, y al volver a ella
    setInterval(() => {
        if (!document.hidden) refreshApprenticeDashboard();
    }, INTERVALO_ACTUALIZACION_MS);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) refreshApprenticeDashboard();
    });
});