// Shared menu editor for the create and update pages.
document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('forma_insertar_menu') || document.getElementById('forma_modificar_menu');
    if (!form) return;
    const id = decodeURIComponent(location.pathname.split('/').pop());
    const editing = form.id === 'forma_modificar_menu';
    const inputs = {1: document.getElementById('entrada'), 2: document.getElementById('plato_fuerte'), 3: document.getElementById('postre'), 4: document.getElementById('bebida')};
    const overlay = document.getElementById('superficie_modal');
    const list = document.getElementById('lista_platos');
    const search = document.getElementById('input_buscar_plato');
    let dishes = [];
    let category = null;
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

    try {
        const response = await fetch(RAIZ + '/platos/api/platos');
        dishes = await response.json();
        if (!Array.isArray(dishes)) dishes = [];
    } catch { alert('No se pudieron cargar los platos.'); }

    function paint() {
        const query = search.value.trim().toLowerCase();
        list.replaceChildren();
        dishes.filter(d => Number(d.categoria) === category && String(d.nombre).toLowerCase().includes(query)).forEach(d => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'opcion-plato';
            button.innerHTML = `<span>${escapeHtml(d.nombre)}</span> <small>${escapeHtml(d.descripcion)}</small>`;
            button.addEventListener('click', () => { inputs[category].value = d.nombre; inputs[category].dataset.id = d.id_plato; overlay.classList.add('oculto'); });
            list.appendChild(button);
        });
    }
    for (const [number, input] of Object.entries(inputs)) {
        input.addEventListener('click', () => { category = Number(number); search.value = ''; document.getElementById('titulo_superficie').textContent = input.dataset.titulo || 'Escoger plato'; overlay.classList.remove('oculto'); paint(); search.focus(); });
    }
    search.addEventListener('input', paint);
    overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.add('oculto'); });
    window.limpiarCampo = button => { const input = button.parentElement.querySelector('input'); input.value = ''; delete input.dataset.id; };

    if (editing) {
        try {
            const response = await fetch(`${RAIZ}/platos/api/menus/${encodeURIComponent(id)}`);
            const menu = await response.json();
            if (!menu) throw Error('Menú no encontrado');
            document.getElementById('nombre_menu').value = menu.nombre || '';
            document.getElementById('desc_menu').value = menu.descripcion || '';
            document.getElementById('precio_menu').value = menu.precio || 0;
            document.getElementById('activo_menu').checked = String(menu.estado).toLowerCase() === 'activo';
            for (const dish of menu.platos || []) {
                const input = inputs[Number(dish.categoria)];
                if (input) { input.value = dish.nombre; input.dataset.id = dish.id_plato; }
            }
        } catch (error) { alert(error.message); }
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const plates = Object.values(inputs).map(input => input.dataset.id).filter(Boolean);
        if (!inputs[1].dataset.id || !inputs[2].dataset.id || !inputs[4].dataset.id) { alert('Selecciona entrada, plato fuerte y bebida.'); return; }
        const menu = {nombre: document.getElementById('nombre_menu').value.trim(), descripcion: document.getElementById('desc_menu').value.trim(), precio: Number(document.getElementById('precio_menu').value), estado: document.getElementById('activo_menu').checked ? 'Activo' : 'Inactivo'};
        const button = form.querySelector('button[type="submit"]'); button.disabled = true;
        try {
            const url = RAIZ + '/platos/api/menus' + (editing ? '/' + encodeURIComponent(id) : '');
            const response = await fetch(url, {method: editing ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({menu, platos: plates})});
            const result = await response.json();
            if (result.status !== 'success') throw Error(result.message || 'No se pudo guardar');
            location.href = RAIZ + '/platos/platos_menu';
        } catch (error) { alert(error.message); button.disabled = false; }
    });
});
