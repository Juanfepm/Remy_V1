document.addEventListener('DOMContentLoaded', async () => {
    const id = decodeURIComponent(location.pathname.split('/').pop());
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    try {
        const response = await fetch(`${RAIZ}/platos/api/menus/${encodeURIComponent(id)}`);
        const menu = await response.json();
        if (!menu) throw Error('Menú no encontrado');
        document.querySelector('.tit-platillo').textContent = menu.nombre;
        document.querySelector('.precio-platillo').textContent = '$' + Number(menu.precio).toLocaleString('es-CO');
        document.querySelector('.txt-descripcion').textContent = menu.descripcion || '';
        document.querySelector('.txt-meta strong').textContent = menu.fecha_creacion || '-';
        document.querySelector('.txt-letra strong').textContent = menu.tiempos_menu;
        document.querySelector('#btn_flotante_editar').href = `${RAIZ}/platos/modificar_menu/${encodeURIComponent(id)}`;
        const active = String(menu.estado).toLowerCase() === 'activo';
        document.getElementById('swtch_estado_plato').checked = active;
        document.getElementById('lbl_estado_swtch').textContent = menu.estado;
        const strip = document.getElementById('tira_imagenes');
        strip.innerHTML = (menu.platos || []).map(plate => `<figure><img src="${RAIZ}/platos/img_remy/${encodeURIComponent(plate.img_plato || '')}" alt="${escapeHtml(plate.nombre)}" onerror="this.src='${RAIZ}/static/modulo_platos/platos/img/dummy_remy.png'"><figcaption>${escapeHtml(plate.nombre)}</figcaption></figure>`).join('');
        const slides = [...strip.children]; let current = 0;
        const indicators = document.getElementById('cont_puntos_carrusel');
        indicators.replaceChildren();
        slides.forEach((_, i) => { const dot = document.createElement('button'); dot.type='button'; dot.textContent = '●'; dot.setAttribute('aria-label', `Plato ${i+1}`); dot.onclick = () => show(i); indicators.appendChild(dot); });
        function show(i) { current = i; slides.forEach((slide, j) => slide.style.display = j === i ? 'block' : 'none'); [...indicators.children].forEach((dot,j) => dot.style.opacity = j === i ? '1' : '.4'); }
        if (slides.length) show(current);
        document.getElementById('swtch_estado_plato').addEventListener('change', async event => {
            const data = {menu: {...menu, estado: event.target.checked ? 'Activo' : 'Inactivo'}, platos: menu.platos};
            const response = await fetch(`${RAIZ}/platos/api/menus/${encodeURIComponent(id)}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
            const result = await response.json();
            if (result.status !== 'success') { event.target.checked = !event.target.checked; alert(result.message); }
            else document.getElementById('lbl_estado_swtch').textContent = data.menu.estado;
        });
    } catch (error) { document.querySelector('.tit-platillo').textContent = error.message; }
});
