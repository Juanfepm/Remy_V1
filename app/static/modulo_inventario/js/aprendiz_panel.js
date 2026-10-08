const apprenticeMonth = new Date();
apprenticeMonth.setDate(1);

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
            fetch(`${RAIZ}/inventario/api/ingredientes/`),
            fetch(`${RAIZ}/inventario/api/categoria/`).catch(() => null)
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

    loadApprenticeInventoryAlerts();
});