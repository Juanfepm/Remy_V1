const instructorMonth = new Date();
instructorMonth.setDate(1);

function renderInstructorCalendar() {
    const monthLabel = document.getElementById('mes_actual_instructor');
    const calendarBody = document.getElementById('cuerpo_calendario_instructor');
    if (!monthLabel || !calendarBody) return;

    const year = instructorMonth.getFullYear();
    const month = instructorMonth.getMonth();
    const today = new Date();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = instructorMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
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
                cell.classList.add('dia-calendario');
                if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    cell.classList.add('dia-hoy');
                    cell.setAttribute('aria-current', 'date');
                }
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }
}

function formatInstructorQuantity(value) {
    const quantity = Number(value);
    if (!Number.isFinite(quantity)) return String(value ?? '0');
    return quantity.toFixed(3).replace(/\.?0+$/, '');
}

async function loadInstructorInventoryAlerts() {
    const list = document.getElementById('lista_alertas_instructor');
    const state = document.getElementById('estado_alertas_instructor');
    if (!list || !state) return;

    try {
        const [ingredientsResponse, categoriesResponse] = await Promise.all([
            fetch(`${(window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : 'http://127.0.0.1:5000'}/ingredientes/`),
            fetch(`${(window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : 'http://127.0.0.1:5000'}/categoria/`).catch(() => null)
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
            state.textContent = 'Todos los insumos tienen existencias suficientes.';
            return;
        }

        state.hidden = true;
        alerts.forEach(item => {
            const stock = Number(item.stock) || 0;
            const entry = document.createElement('li');
            entry.className = `item-alerta-instructor${stock <= 0 ? ' stock-agotado' : ''}`;

            const info = document.createElement('div');
            info.className = 'info-alerta-instructor';
            const name = document.createElement('p');
            name.className = 'nombre-alerta-instructor';
            name.textContent = item.nombre || 'Insumo';
            const category = document.createElement('p');
            category.className = 'categoria-alerta-instructor';
            category.textContent = categoryNames.get(String(item.categoria)) || item.categoria || 'Sin categoría';
            info.append(name, category);

            const quantity = document.createElement('span');
            quantity.className = 'stock-alerta-instructor';
            quantity.textContent = `${formatInstructorQuantity(item.stock)} ${item.unidad || ''}`.trim();
            entry.append(info, quantity);
            list.appendChild(entry);
        });
    } catch (error) {
        console.error('Error al cargar las alertas de inventario:', error);
        state.hidden = false;
        state.textContent = 'No se pudo cargar el inventario.';
        list.replaceChildren();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderInstructorCalendar();
    document.getElementById('mes_anterior')?.addEventListener('click', () => {
        instructorMonth.setMonth(instructorMonth.getMonth() - 1);
        renderInstructorCalendar();
    });
    document.getElementById('mes_siguiente')?.addEventListener('click', () => {
        instructorMonth.setMonth(instructorMonth.getMonth() + 1);
        renderInstructorCalendar();
    });

    const session = sessionStorage.getItem('usuario_sesion') || localStorage.getItem('usuario_sesion');
    if (session) {
        try {
            const user = JSON.parse(session);
            const userInfo = document.getElementById('usuario_info');
            if (userInfo && user.nombre) userInfo.textContent = `Hola, ${user.nombre} (${user.rol_nombre || 'Instructor'})`;
        } catch (error) {
            console.error('No se pudo leer la sesión del usuario:', error);
        }
    }

    document.getElementById('btn_cerrar_sesion')?.addEventListener('click', () => {
        sessionStorage.removeItem('usuario_sesion');
        localStorage.removeItem('usuario_sesion');
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

    loadInstructorInventoryAlerts();
});