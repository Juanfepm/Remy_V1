const API_BASE = RAIZ + '/inventario/api';

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'No fue posible completar la solicitud');
    }
    return data;
}

function showError(error) {
    console.error(error);
    window.alert(error.message || 'No fue posible conectar con el backend');
}

function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

function formatQuantity(value) {
    const quantity = Number(value);
    if (!Number.isFinite(quantity)) return value ?? '';
    return quantity.toFixed(3).replace(/\.?0+$/, '');
}

function categoryName(categories, id) {
    const category = categories.find(item => item.id_categoria === id);
    return category ? category.nombre : id || 'Sin categoria';
}

function renderIngredientCards(container, ingredients, categories, showActions = true) {
    container.innerHTML = ingredients.map(ingredient => `
        <details class="tarjeta_insumo ${ingredient.stock > 0 && ingredient.stock <= ingredient.stock_minimo ? 'tarjeta_insumo_stock_bajo' : ''}">
            <summary>
                <div><h3 class="nombre_insumo">${ingredient.nombre}</h3><span class="categoria_insumo">${categoryName(categories, ingredient.categoria)}</span></div>
                <span class="cantidad_insumo">${formatQuantity(ingredient.stock)} ${ingredient.unidad || ''}</span>
            </summary>
            ${showActions ? `<div class="acciones_insumo">
                <button type="button" class="accion_modificar_insumo" data-edit-id="${ingredient.id_ingrediente}">Modificar</button>
                <a href="#" class="accion_eliminar" data-delete-id="${ingredient.id_ingrediente}">Eliminar</a>
            </div>` : ''}
        </details>`).join('');

    if (!showActions) return;

    container.querySelectorAll('[data-delete-id]').forEach(link => {
        link.addEventListener('click', async event => {
            event.preventDefault();
            if (!window.confirm('¿Seguro que quieres eliminar este insumo?')) return;
            try {
                await apiRequest(`/ingredientes/${link.dataset.deleteId}`, { method: 'DELETE' });
                await loadPageData();
            } catch (error) {
                showError(error);
            }
        });
    });

    container.querySelectorAll('[data-edit-id]').forEach(button => {
        button.addEventListener('click', () => {
            const ingredient = ingredients.find(item => String(item.id_ingrediente) === button.dataset.editId);
            if (ingredient) openEditIngredientForm(ingredient, categories);
        });
    });
}

function openInfoModal(title, infoHtml) {
    const overlay = document.createElement('div');
    overlay.className = 'fondo_ventana_emergente';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;background:rgba(10,25,45,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px;box-sizing:border-box;';
    
    overlay.innerHTML = `
        <div style="background: white; border-radius: 12px; width: 100%; max-width: 400px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 16px;">
                <h2 style="margin: 0; color: var(--azul-dark, #00304D); font-size: 1.25rem;">${title}</h2>
                <a href="#" class="boton_cerrar_ventana_emergente" style="color: #999; text-decoration: none; font-size: 1.5rem; font-weight: bold; line-height: 1;">&times;</a>
            </div>
            <div style="color: var(--azul-dark, #00304D); font-size: 0.95rem; line-height: 1.6;">
                ${infoHtml}
            </div>
            <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
                <button class="boton_cancelar_agregar_insumo" style="background: var(--verde, #4CAF50); color: white; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: 0.2s;">Aceptar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    
    overlay.querySelectorAll('.boton_cerrar_ventana_emergente, .boton_cancelar_agregar_insumo').forEach(button => button.addEventListener('click', event => {
        event.preventDefault();
        close();
    }));
}

function openForm(title, fields, onSubmit) {
    const overlay = document.createElement('div');
    overlay.className = 'fondo_ventana_emergente';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;background:rgba(10,25,45,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px;box-sizing:border-box;';
    
    // Build form fields HTML
    let fieldsHTML = '';
    for (const field of fields) {
        fieldsHTML += `<label for="${field.id}">${field.label}</label>`;
        if (field.type === 'select') {
            let optionsHTML = '';
            for (const option of (field.options || [])) {
                optionsHTML += `<option value="${option.value}">${option.label}</option>`;
            }
            fieldsHTML += `<select id="${field.id}" name="${field.name}" required>${optionsHTML}</select>`;
        } else {
            fieldsHTML += `<input id="${field.id}" name="${field.name}" type="${field.type || 'text'}" ${field.required === false ? '' : 'required'} ${field.min !== undefined ? `min="${field.min}"` : ''} ${field.step !== undefined ? `step="${field.step}"` : ''}>`;
        }
    }
    
    overlay.innerHTML = `<div class="cuadro_ventana_emergente"><div class="encabezado_ventana_emergente"><h2>${title}</h2><a href="#" class="boton_cerrar_ventana_emergente">&times;</a></div><form class="formulario_agregar_insumo">${fieldsHTML}<div class="botones_formulario_agregar_insumo"><a href="#" class="boton_cancelar_agregar_insumo">Cancelar</a><button type="submit" class="boton_guardar_insumo">Guardar</button></div></form></div>`;
    
    document.body.appendChild(overlay);
    const close = () => overlay.remove();

    fields.forEach(field => {
        if (field.value === undefined) return;
        const control = overlay.querySelector(`#${field.id}`);
        if (control) control.value = field.value;
    });
    
    overlay.querySelectorAll('.boton_cerrar_ventana_emergente, .boton_cancelar_agregar_insumo').forEach(button => button.addEventListener('click', event => {
        event.preventDefault();
        close();
    }));
    
    overlay.querySelector('form').addEventListener('submit', async event => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await onSubmit(data);
            close();
            await loadPageData();
        } catch (error) {
            showError(error);
        }
    });
}

async function loadCategories() {
    try {
        return await apiRequest('/categoria/');
    } catch (error) {
        return [];
    }
}

async function loadInsumosPage() {
    const container = document.querySelector('.lista_tarjetas_insumo');
    if (!container) return;
    const [ingredients, categories] = await Promise.all([apiRequest('/ingredientes/'), loadCategories()]);
    renderIngredientCards(container, ingredients, categories);
    const search = document.querySelector('.campo_buscar_insumo');
    search?.addEventListener('input', () => renderIngredientCards(container, ingredients.filter(item => item.nombre.toLowerCase().includes(search.value.toLowerCase())), categories));
    document.querySelectorAll('[href="#ventana_agregar_insumo"], .boton_flotante_agregar_insumo').forEach(button => button.addEventListener('click', event => {
        event.preventDefault();
        openIngredientForm(categories);
    }));
}

function openIngredientForm(categories) {
    const safeCategories = categories && categories.length ? categories : [{ id_categoria: 'GEN', nombre: 'General' }];
    openForm('Agregar insumo', [
        { id: 'nombre_nuevo', name: 'nombre', label: 'Nombre del insumo' },
        { id: 'categoria_nueva', name: 'categoria', label: 'Categoria', type: 'select', options: safeCategories.map(item => ({ value: item.id_categoria, label: item.nombre })) },
        { id: 'stock_nuevo', name: 'stock', label: 'Cantidad inicial', type: 'number', min: 0 },
        { id: 'unidad_nueva', name: 'unidad', label: 'Unidad de medida', type: 'select', options: [
            { value: 'KG', label: 'Kg' },
            { value: 'GR', label: 'Gr' },
            { value: 'L', label: 'L' },
            { value: 'UND', label: 'Und' }
        ] },
        { id: 'stock_minimo_nuevo', name: 'stock_minimo', label: 'Stock minimo', type: 'number', min: 0, required: false }
    ], data => {
        const payload = {
            nombre: String(data.nombre || '').trim(),
            categoria: String(data.categoria || safeCategories[0].id_categoria),
            stock: Number(data.stock || 0),
            unidad: String(data.unidad || '').trim() || 'KG',
            stock_minimo: Number(data.stock_minimo || 0),
            descripcion: String(data.descripcion || '').trim()
        };

        if (!payload.nombre) {
            throw new Error('El nombre del insumo es obligatorio');
        }

        return apiRequest('/ingredientes/', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    });
}

function openEditIngredientForm(ingredient, categories) {
    const safeCategories = categories && categories.length ? categories : [{ id_categoria: ingredient.categoria, nombre: categoryName([], ingredient.categoria) }];
    openForm('Modificar insumo', [
        { id: 'nombre_editar', name: 'nombre', label: 'Nombre del insumo', value: ingredient.nombre },
        { id: 'categoria_editar', name: 'categoria', label: 'Categoría', type: 'select', value: ingredient.categoria, options: safeCategories.map(item => ({ value: item.id_categoria, label: item.nombre })) },
        { id: 'stock_editar', name: 'stock', label: 'Cantidad disponible', type: 'number', min: 0, step: '0.001', value: formatQuantity(ingredient.stock) },
        { id: 'unidad_editar', name: 'unidad', label: 'Unidad de medida', type: 'select', value: String(ingredient.unidad || 'KG').toUpperCase(), options: [
            { value: 'KG', label: 'Kg' },
            { value: 'GR', label: 'Gr' },
            { value: 'L', label: 'L' },
            { value: 'UND', label: 'Und' }
        ] },
        { id: 'stock_minimo_editar', name: 'stock_minimo', label: 'Stock mínimo', type: 'number', min: 0, step: '0.001', required: false, value: formatQuantity(ingredient.stock_minimo || 0) }
    ], data => apiRequest(`/ingredientes/${ingredient.id_ingrediente}`, {
        method: 'PUT',
        body: JSON.stringify({
            nombre: String(data.nombre || '').trim(),
            categoria: data.categoria,
            stock: Number(data.stock),
            unidad: data.unidad,
            stock_minimo: Number(data.stock_minimo || 0)
        })
    }));
}

async function loadSummaryData() {
    const i = await apiRequest('/ingredientes/');
    const a = i.filter(item => item.stock <= 0).length;
    const b = i.filter(item => item.stock > 0 && item.stock <= item.stock_minimo).length;
    if (document.querySelector('#valor_insumos')) document.querySelector('#valor_insumos').textContent = i.length;
    if (document.querySelector('#valor_agotados')) document.querySelector('#valor_agotados').textContent = a;
    if (document.querySelector('#valor_bajostock')) document.querySelector('#valor_bajostock').textContent = b;
}

async function loadStatusPage(path) {
    const container = document.querySelector('.lista_tarjetas_insumo');
    if (!container) return;
    const [ingredients, categories] = await Promise.all([apiRequest(path), loadCategories()]);
    renderIngredientCards(container, ingredients, categories, false);
}

function configureIngredientAutocomplete(ingredients, searchInput, idInput, suggestionBox, status, onSelect) {
    const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    let matches = [];

    const closeSuggestions = () => {
        suggestionBox.hidden = true;
        searchInput.setAttribute('aria-expanded', 'false');
    };

    const chooseIngredient = ingredient => {
        idInput.value = ingredient.id_ingrediente;
        searchInput.value = ingredient.nombre;
        status.textContent = `${formatQuantity(ingredient.stock)} ${ingredient.unidad || ''} disponible`.trim();
        closeSuggestions();
        onSelect(ingredient);
    };

    const showSuggestions = () => {
        const query = normalize(searchInput.value.trim());
        idInput.value = '';
        onSelect(null);
        suggestionBox.replaceChildren();
        if (!query) {
            status.textContent = 'Escribe el nombre del ingrediente';
            closeSuggestions();
            return;
        }

        matches = ingredients.filter(item => normalize(item.nombre).includes(query));
        if (matches.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'estado-sugerencias-insumo';
            empty.textContent = 'No se encontraron ingredientes';
            suggestionBox.appendChild(empty);
        } else {
            matches.forEach((ingredient, index) => {
                const option = document.createElement('button');
                option.type = 'button';
                option.className = 'opcion-sugerencia-insumo';
                option.setAttribute('role', 'option');
                option.dataset.index = String(index);

                const name = document.createElement('span');
                name.textContent = ingredient.nombre;
                const stock = document.createElement('small');
                stock.textContent = `${formatQuantity(ingredient.stock)} ${ingredient.unidad || ''}`.trim();
                option.append(name, stock);
                option.addEventListener('click', () => chooseIngredient(ingredient));
                suggestionBox.appendChild(option);
            });
        }

        status.textContent = matches.length
            ? `${matches.length} resultado${matches.length === 1 ? '' : 's'}`
            : 'Prueba con otro nombre';
        suggestionBox.hidden = false;
        searchInput.setAttribute('aria-expanded', 'true');
    };

    searchInput.addEventListener('input', showSuggestions);
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeSuggestions();
        if (event.key === 'ArrowDown') {
            const firstOption = suggestionBox.querySelector('.opcion-sugerencia-insumo');
            if (firstOption) {
                event.preventDefault();
                firstOption.focus();
            }
        }
        if (event.key === 'Enter' && matches.length && !idInput.value) {
            event.preventDefault();
            chooseIngredient(matches[0]);
        }
    });
    suggestionBox.addEventListener('keydown', event => {
        const options = Array.from(suggestionBox.querySelectorAll('.opcion-sugerencia-insumo'));
        const currentIndex = options.indexOf(document.activeElement);
        if (event.key === 'ArrowDown' && currentIndex < options.length - 1) {
            event.preventDefault();
            options[currentIndex + 1].focus();
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (currentIndex <= 0) searchInput.focus();
            else options[currentIndex - 1].focus();
        }
    });
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) showSuggestions();
    });
    showSuggestions();
}

function openRegistrarEntradaModal(ingredients) {
    const overlay = document.createElement('div');
    overlay.className = 'fondo_ventana_emergente';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;background:rgba(10,25,45,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px;box-sizing:border-box;';

    overlay.innerHTML = `
        <div class="modal_movimiento_movil" style="margin:auto;max-height:92vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.5);">
            <div class="encabezado_modal_movil" style="justify-content: space-between;">
                <button type="button" class="btn_atras_modal_movil" title="Cerrar">&larr;</button>
                <h2 class="titulo_modal_movil" style="margin: 0 auto;">Registrar entradas</h2>
                <button type="button" class="btn_atras_modal_movil btn_cerrar_modal" title="Cerrar" style="font-size: 1.2rem;">&times;</button>
            </div>
            <form class="cuerpo_modal_movil" id="form_registrar_entrada">
                <div class="tarjeta_campo_movil autocomplete-insumo">
                    <label class="etiqueta_campo_movil" for="entrada_buscar_ingrediente">BUSCAR INGREDIENTE</label>
                    <input type="search" id="entrada_buscar_ingrediente" placeholder="Escribe para buscar..." class="input_campo_movil" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="entrada_sugerencias" aria-expanded="false" required>
                    <input type="hidden" id="entrada_ingrediente" name="id_ingrediente">
                    <div id="entrada_sugerencias" class="lista-sugerencias-insumo" role="listbox" hidden></div>
                    <small id="entrada_resultados_busqueda" class="estado-autocomplete-insumo" aria-live="polite"></small>
                </div>

                <div class="tarjeta_campo_movil">
                    <label class="etiqueta_campo_movil" for="entrada_cantidad">CANTIDAD</label>
                    <div class="fila_cantidad_movil">
                        <input type="number" id="entrada_cantidad" name="cantidad" min="1" step="1" placeholder="0" class="input_campo_movil" required>
                        <span class="badge_unidad_verde" id="entrada_badge_unidad">Kg</span>
                    </div>
                </div>

                <div class="tarjeta_campo_movil">
                    <label class="etiqueta_campo_movil" for="entrada_fecha_vencimiento">VENCE</label>
                    <input type="date" id="entrada_fecha_vencimiento" name="fecha_vencimiento" class="input_campo_movil">
                </div>

                <div class="tarjeta_campo_movil">
                    <label class="etiqueta_campo_movil" for="entrada_proveedor">PROVEEDOR</label>
                    <input type="text" id="entrada_proveedor" name="proveedor_nombre" placeholder="Nombre del proveedor" class="input_campo_movil">
                </div>

                <div class="tarjeta_campo_movil">
                    <label class="etiqueta_campo_movil" for="entrada_factura"># FACTURA</label>
                    <input type="text" id="entrada_factura" name="factura" placeholder="000000" class="input_campo_movil">
                </div>

                <button type="submit" class="boton_registrar_movil">REGISTRAR</button>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();

    overlay.querySelectorAll('.btn_atras_modal_movil, .btn_cerrar_modal').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            close();
        });
    });

    overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
    });

    const badgeUnidad = overlay.querySelector('#entrada_badge_unidad');
    const searchInput = overlay.querySelector('#entrada_buscar_ingrediente');
    const searchResults = overlay.querySelector('#entrada_resultados_busqueda');
    configureIngredientAutocomplete(
        ingredients,
        searchInput,
        overlay.querySelector('#entrada_ingrediente'),
        overlay.querySelector('#entrada_sugerencias'),
        searchResults,
        ingredient => {
            badgeUnidad.textContent = ingredient?.unidad || 'Kg';
        }
    );

    overlay.querySelector('form').addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        if (!data.id_ingrediente) {
            searchResults.textContent = 'Selecciona un ingrediente de las sugerencias';
            searchInput.focus();
            return;
        }
        try {
            await apiRequest('/movimientos/entradas', {
                method: 'POST',
                body: JSON.stringify({
                    id_ingrediente: data.id_ingrediente,
                    cantidad: Number(data.cantidad),
                    fecha_vencimiento: data.fecha_vencimiento || null,
                    id_proveedor: null,
                    proveedor_nombre: data.proveedor_nombre || null,
                    factura: data.factura || null
                })
            });
            close();
            await loadMovementPage('entrada');
            if (typeof loadSummaryData === 'function') await loadSummaryData();
        } catch (err) {
            showError(err);
        }
    });
}

function openRegistrarSalidaModal(ingredients) {
    const overlay = document.createElement('div');
    overlay.className = 'fondo_ventana_emergente';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;background:rgba(10,25,45,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px;box-sizing:border-box;';

    overlay.innerHTML = `
        <div class="modal_movimiento_movil" style="margin:auto;max-height:92vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.5);">
            <div class="encabezado_modal_movil" style="justify-content: space-between;">
                <button type="button" class="btn_atras_modal_movil" title="Cerrar">&larr;</button>
                <h2 class="titulo_modal_movil" style="margin: 0 auto;">Registrar Salida</h2>
                <button type="button" class="btn_atras_modal_movil btn_cerrar_modal" title="Cerrar" style="font-size: 1.2rem;">&times;</button>
            </div>
            <form class="cuerpo_modal_movil" id="form_registrar_salida">
                <div class="tarjeta_campo_movil autocomplete-insumo">
                    <label class="etiqueta_campo_movil" for="salida_buscar_ingrediente">BUSCAR INGREDIENTE</label>
                    <input type="search" id="salida_buscar_ingrediente" placeholder="Escribe para buscar..." class="input_campo_movil" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="salida_sugerencias" aria-expanded="false" required>
                    <input type="hidden" id="salida_ingrediente" name="id_ingrediente">
                    <div id="salida_sugerencias" class="lista-sugerencias-insumo" role="listbox" hidden></div>
                    <small id="salida_busqueda_estado" class="estado-autocomplete-insumo" aria-live="polite"></small>
                </div>

                <div class="tarjeta_campo_movil">
                    <label class="etiqueta_campo_movil" for="salida_cantidad">CANTIDAD</label>
                    <div class="stepper_cantidad_movil">
                        <button type="button" class="btn_stepper_circulo" id="btn_decrementar_salida" disabled>-</button>
                        <input type="number" id="salida_cantidad" name="cantidad" value="1" min="0.001" step="0.001" class="input_stepper_valor" required disabled>
                        <button type="button" class="btn_stepper_circulo" id="btn_incrementar_salida" disabled>+</button>
                        <select id="salida_unidad" name="unidad_medida" class="select_unidad_salida" aria-label="Unidad de salida" required disabled></select>
                    </div>
                    <small id="salida_disponible" class="disponible_salida" aria-live="polite"></small>
                </div>

                <div class="tarjeta_campo_movil">
                    <label class="etiqueta_campo_movil" for="salida_motivo">MOTIVO</label>
                    <input type="text" id="salida_motivo" name="motivo_salida" placeholder="Escribe el motivo..." class="input_campo_movil" required>
                </div>

                <button type="submit" class="boton_registrar_movil">REGISTRAR</button>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();

    overlay.querySelectorAll('.btn_atras_modal_movil, .btn_cerrar_modal').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            close();
        });
    });

    overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
    });

    const searchInput = overlay.querySelector('#salida_buscar_ingrediente');
    const ingredientIdInput = overlay.querySelector('#salida_ingrediente');
    const suggestionBox = overlay.querySelector('#salida_sugerencias');
    const searchStatus = overlay.querySelector('#salida_busqueda_estado');
    const selectUnidad = overlay.querySelector('#salida_unidad');
    const inputCantidad = overlay.querySelector('#salida_cantidad');
    const disponible = overlay.querySelector('#salida_disponible');
    const btnDec = overlay.querySelector('#btn_decrementar_salida');
    const btnInc = overlay.querySelector('#btn_incrementar_salida');

    const unitSettings = {
        kg: { label: 'Kg', group: 'mass', factor: 1000 },
        gr: { label: 'Gr', group: 'mass', factor: 1 },
        g: { label: 'Gr', group: 'mass', factor: 1 },
        l: { label: 'L', group: 'volume', factor: 1000 },
        ml: { label: 'mL', group: 'volume', factor: 1 },
        und: { label: 'Und', group: 'count', factor: 1 },
        unidad: { label: 'Und', group: 'count', factor: 1 },
        unidades: { label: 'Und', group: 'count', factor: 1 }
    };
    const getUnit = value => unitSettings[String(value || '').trim().toLowerCase()];
    let selectedIngredient = null;
    const updateAvailability = () => {
        const stockUnit = getUnit(selectedIngredient?.unidad);
        const outputUnit = getUnit(selectUnidad.value);
        if (!selectedIngredient || !stockUnit || !outputUnit) {
            disponible.textContent = '';
            return;
        }

        const stock = Number(selectedIngredient.stock) || 0;
        const availableQuantity = stock * stockUnit.factor / outputUnit.factor;
        const usesSmallUnit = ['Gr', 'mL'].includes(outputUnit.label);
        const maxQuantity = usesSmallUnit ? Math.min(availableQuantity, 999) : availableQuantity;
        const step = ['Kg', 'L'].includes(outputUnit.label) ? '0.001' : '1';
        inputCantidad.min = step;
        inputCantidad.step = step;
        inputCantidad.max = String(maxQuantity);
        if (Number(inputCantidad.value) > maxQuantity) {
            inputCantidad.value = String(maxQuantity);
        }
        const maxDescription = usesSmallUnit && availableQuantity > 999
            ? `${formatQuantity(maxQuantity)} ${outputUnit.label} por salida`
            : `${formatQuantity(maxQuantity)} ${outputUnit.label}`;
        disponible.textContent = `Disponible: ${formatQuantity(stock)} ${stockUnit.label} (máximo ${maxDescription})`;
    };

    const selectIngredient = ingredient => {
        selectedIngredient = ingredient;
        const stockUnit = getUnit(ingredient?.unidad);
        if (!stockUnit) {
            selectUnidad.replaceChildren();
            selectUnidad.disabled = true;
            inputCantidad.disabled = true;
            btnDec.disabled = true;
            btnInc.disabled = true;
            disponible.textContent = '';
            return;
        }

        const optionsByGroup = {
            mass: ['Kg', 'Gr'],
            volume: ['L', 'mL'],
            count: ['Und']
        };
        const units = optionsByGroup[stockUnit.group];
        selectUnidad.replaceChildren(...units.map(unit => new Option(unit, unit)));
        selectUnidad.value = stockUnit.label;
        selectUnidad.disabled = false;
        inputCantidad.disabled = false;
        btnDec.disabled = false;
        btnInc.disabled = false;
        inputCantidad.value = '1';
        updateAvailability();
    };

    configureIngredientAutocomplete(
        ingredients,
        searchInput,
        ingredientIdInput,
        suggestionBox,
        searchStatus,
        selectIngredient
    );

    selectUnidad.addEventListener('change', () => {
        inputCantidad.value = '1';
        updateAvailability();
    });

    inputCantidad.addEventListener('input', () => {
        const max = Number(inputCantidad.max);
        if (Number(inputCantidad.value) > max) {
            inputCantidad.value = String(max);
        }
    });

    btnDec.addEventListener('click', () => {
        const unit = getUnit(selectUnidad.value);
        const step = unit && ['Kg', 'L'].includes(unit.label) ? 0.1 : 1;
        const val = Number(inputCantidad.value) || step;
        if (val > step) {
            inputCantidad.value = String(Number((val - step).toFixed(3)));
        }
    });

    btnInc.addEventListener('click', () => {
        const unit = getUnit(selectUnidad.value);
        const step = unit && ['Kg', 'L'].includes(unit.label) ? 0.1 : 1;
        const val = Number(inputCantidad.value) || 0;
        const max = Number(inputCantidad.max);
        inputCantidad.value = String(Number(Math.min(val + step, max).toFixed(3)));
    });

    overlay.querySelector('form').addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        if (!data.id_ingrediente) {
            searchStatus.textContent = 'Selecciona un ingrediente de las sugerencias';
            searchInput.focus();
            return;
        }
        try {
            await apiRequest('/movimientos/salidas', {
                method: 'POST',
                body: JSON.stringify({
                    id_ingrediente: data.id_ingrediente,
                    cantidad: Number(data.cantidad),
                    unidad_medida: data.unidad_medida,
                    motivo_salida: data.motivo_salida || null
                })
            });
            close();
            await loadMovementPage('salida');
            if (typeof loadSummaryData === 'function') await loadSummaryData();
        } catch (err) {
            showError(err);
        }
    });
}

async function loadMovementPage(type) {
    const panel = type === 'entrada' ? document.querySelector('#panel_entradas') : document.querySelector('#panel_salidas');
    if (!panel) return;
    
    try {
        const movements = await apiRequest(`/movimientos/${type === 'entrada' ? 'entradas' : 'salidas'}`);
        
        // Agrupar por fecha
        const grouped = {};
        movements.forEach(movement => {
            const date = formatDate(movement.fecha_hora || movement.fecha_vencimiento);
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(movement);
        });
        
        // Limpiar grupos existentes
        const existingFechaGrupos = panel.querySelectorAll('.fecha-grupo');
        existingFechaGrupos.forEach(el => el.remove());
        
        // Insertar nuevos grupos
        Object.entries(grouped).forEach(([date, items]) => {
            const grupoDiv = document.createElement('div');
            grupoDiv.className = 'fecha-grupo';
            
            const fechaP = document.createElement('p');
            fechaP.className = 'fecha-salida letra-gris-dark';
            fechaP.textContent = date;
            grupoDiv.appendChild(fechaP);
            
            const ul = document.createElement('ul');
            ul.className = 'lista-items-fecha';
            
            items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'item-entrada-salida';
                
                const detalleDiv = document.createElement('div');
                detalleDiv.className = 'detalle-movimiento';
                
                const nombreP = document.createElement('p');
                nombreP.className = 'nombre-insumo letra-azul-dark';
                nombreP.textContent = item.nombre_ingrediente || item.id_ingrediente;
                
                const categoriaP = document.createElement('p');
                categoriaP.className = `categoria-insumo ${type === 'entrada' ? 'letra-verde' : 'letra-azul-dark'}`;
                categoriaP.textContent = `• ${item.categoria || 'General'}`;
                
                detalleDiv.appendChild(nombreP);
                detalleDiv.appendChild(categoriaP);
                
                const cantidadP = document.createElement('p');
                cantidadP.className = `cantidad-chip ${type === 'entrada' ? 'fondo-verde-lite letra-verde' : 'fondo-azul-lite letra-azul-dark'}`;
                const sign = type === 'entrada' ? '+ ' : '- ';
                cantidadP.textContent = `${sign}${formatQuantity(item.cantidad)} ${item.unidad || ''}`.trim();
                
                li.appendChild(detalleDiv);
                li.appendChild(cantidadP);
                li.style.cursor = 'pointer';
                li.addEventListener('click', () => {
                    let detailsHTML = '';
                    if (type === 'entrada') {
                        detailsHTML = `
                            <p><strong>Insumo:</strong> ${item.nombre_ingrediente || item.id_ingrediente}</p>
                            <p><strong>Categoría:</strong> ${item.categoria || 'General'}</p>
                            <p><strong>Cantidad ingresada:</strong> ${formatQuantity(item.cantidad)} ${item.unidad || ''}</p>
                            <p><strong>Fecha y hora:</strong> ${formatDate(item.fecha_hora || item.fecha_vencimiento)}</p>
                            <p><strong>Proveedor:</strong> ${item.proveedor || 'No registrado'}</p>
                            <p><strong>Factura:</strong> ${item.factura ? item.factura : 'No registrada'}</p>
                            <p><strong>Fecha Vencimiento:</strong> ${item.fecha_vencimiento ? formatDate(item.fecha_vencimiento) : 'No registrada'}</p>
                        `;
                    } else {
                        detailsHTML = `
                            <p><strong>Insumo:</strong> ${item.nombre_ingrediente || item.id_ingrediente}</p>
                            <p><strong>Categoría:</strong> ${item.categoria || 'General'}</p>
                            <p><strong>Cantidad retirada:</strong> ${formatQuantity(item.cantidad)} ${item.unidad || ''}</p>
                            <p><strong>Fecha y hora:</strong> ${formatDate(item.fecha_hora || item.fecha_vencimiento)}</p>
                            <p><strong>Motivo / Justificación:</strong> ${item.motivo_salida ? item.motivo_salida : 'No especificado'}</p>
                        `;
                    }
                    openInfoModal(`Detalles de ${type === 'entrada' ? 'Entrada' : 'Salida'}`, detailsHTML);
                });
                ul.appendChild(li);
            });
            
            grupoDiv.appendChild(ul);
            panel.appendChild(grupoDiv);
        });
        
        if (panel.querySelectorAll('.fecha-grupo').length === 0) {
            const emptyP = document.createElement('p');
            emptyP.className = 'letra-gris-dark';
            emptyP.textContent = `No hay ${type === 'entrada' ? 'entradas' : 'salidas'} registradas`;
            panel.appendChild(emptyP);
        }
    } catch (error) {
        console.error(`Error loading ${type}s:`, error);
    }
    
        // Button listeners moved to initButtons (handled after loadPageData)
}

async function loadInventoryPage() {
    const table = document.querySelector('#tabla_movimientos tbody');
    if (!table) return;
    const [ingredients, movements] = await Promise.all([apiRequest('/ingredientes/'), apiRequest('/movimientos/ultimos?limit=10')]);
    const agotados = ingredients.filter(item => item.stock <= 0).length;
    const bajoStock = ingredients.filter(item => item.stock > 0 && item.stock <= item.stock_minimo).length;
    document.querySelector('#valor_insumos')?.replaceChildren(document.createTextNode(ingredients.length));
    document.querySelector('#valor_agotados')?.replaceChildren(document.createTextNode(agotados));
    document.querySelector('#valor_bajostock')?.replaceChildren(document.createTextNode(bajoStock));
    table.innerHTML = movements.map(movement => {
        const isEntrada = movement.tipo === 'entrada';
        const iconoFondo = isEntrada ? 'fondo-verde-lite letra-verde' : 'fondo-azul-lite letra-azul-dark';
        const colorCantidad = isEntrada ? 'letra-verde' : 'letra-azul-dark';
        const signo = isEntrada ? '+ ' : '- ';
        const unidad = movement.unidad ? ` ${movement.unidad}` : '';
        const icono = isEntrada ? '+' : '&rarr;';
        return `<tr><td><figure class="icono-estado ${iconoFondo}"><span aria-label="${movement.tipo}">${icono}</span></figure></td><td class="letra-azul-dark">${movement.nombre_ingrediente || movement.id_ingrediente}</td><td class="${colorCantidad}">${signo}${formatQuantity(movement.cantidad)}${unidad}</td><td class="letra-gris-dark">${formatDate(movement.fecha_hora)}</td></tr>`;
    }).join('');
}

async function loadEditPage() {
    const form = document.querySelector('.formulario_editar_insumo');
    if (!form) return;
    const ingredientId = new URLSearchParams(location.search).get('insumo');
    if (!ingredientId) return;
    const [ingredient, categories] = await Promise.all([apiRequest(`/ingredientes/${ingredientId}`), loadCategories()]);
    form.querySelector('#nombre').value = ingredient.nombre || '';
    const categorySelect = form.querySelector('#categoria');
    categorySelect.replaceChildren(...categories.map(category => new Option(category.nombre, category.id_categoria)));
    categorySelect.value = ingredient.categoria || '';
    form.querySelector('#cantidad').value = formatQuantity(ingredient.stock ?? 0);
    form.querySelector('#unidad').value = String(ingredient.unidad || '').toUpperCase();
    form.addEventListener('submit', async event => {
        event.preventDefault();
        try {
            await apiRequest(`/ingredientes/${ingredientId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    nombre: form.querySelector('#nombre').value,
                    categoria: form.querySelector('#categoria').value,
                    stock: Number(form.querySelector('#cantidad').value),
                    unidad: form.querySelector('#unidad').value
                })
            });
            window.location.href = 'insumos_panel.html';
        } catch (error) {
            showError(error);
        }
    });
}

async function loadPageData() {
    try {
        if (document.querySelector('.formulario_editar_insumo')) await loadEditPage();
        if (document.querySelector('#tabla_movimientos')) await loadInventoryPage();
        if (document.querySelector('.lista_tarjetas_insumo')) {
            if (location.pathname.endsWith('agotados.html')) await loadStatusPage('/ingredientes/agotados');
            else if (location.pathname.endsWith('bajo_stock.html')) await loadStatusPage('/ingredientes/bajo-stock');
            else if (location.pathname.endsWith('insumos_panel.html')) await loadInsumosPage();
        }
        // loadSummaryData is called from inline script in entradas.html and salidas.html but we need it on all summary pages
        if (document.querySelector('#resumen_inventario')) await loadSummaryData();
        if (document.querySelector('#panel_entradas')) await loadMovementPage('entrada');
        if (document.querySelector('#panel_salidas')) await loadMovementPage('salida');
    } catch (error) {
        showError(error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    initButtons();
    initMobileMenu();
    await loadPageData();
});

// Mobile menu closing helpers (Escape key, link click)
function initMobileMenu() {
    const menuCheckbox = document.getElementById('checkbox_menu');
    if (!menuCheckbox) return;

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuCheckbox.checked) {
            menuCheckbox.checked = false;
        }
    });

    // Close when clicking any menu item
    document.querySelectorAll('#menu_lateral a, #menu_lateral span, .pie-menu-lateral a').forEach(item => {
        item.addEventListener('click', () => {
            menuCheckbox.checked = false;
        });
    });
}

// Initialize button handlers after the page data is loaded
function initButtons() {
    const btnEntrada = document.getElementById('btn_agregar_entrada');
    if (btnEntrada) {
        btnEntrada.onclick = async (e) => {
            e.preventDefault();
            try {
                const ingredients = await apiRequest('/ingredientes/');
                openRegistrarEntradaModal(ingredients);
            } catch (err) {
                showError(err);
            }
        };
    }
    const btnSalida = document.getElementById('btn_agregar_salida');
    if (btnSalida) {
        btnSalida.onclick = async (e) => {
            e.preventDefault();
            try {
                const ingredients = await apiRequest('/ingredientes/');
                openRegistrarSalidaModal(ingredients);
            } catch (err) {
                showError(err);
            }
        };
    }
}

