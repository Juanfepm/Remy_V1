"""Módulo de platos y menús."""
import os
from datetime import datetime

from flask import Blueprint, current_app, jsonify, render_template, request, send_from_directory
from PIL import Image

from app.db import obtener_conexion
from app.modulo_platos.buscarGeneral import buscarGeneral
from app.modulo_platos.services.menus.consultarMenu import consultarMenu
from app.modulo_platos.services.menus.consultarMenuId import consultarMenuId
from app.modulo_platos.services.menus.insertarMenu import insertarMenu
from app.modulo_platos.services.menus.modificarMenu import modificarMenu
from app.modulo_platos.services.platos.consultarIngrediente import consultarIngrediente
from app.modulo_platos.services.platos.consultarPlatos import consultarPlatos
from app.modulo_platos.services.platos.consultarPlatosId import consultarPlatosId

platos_bp = Blueprint('platos', __name__, url_prefix='/platos')


def get_db_connection():
    return obtener_conexion()


def carpeta_img_platos():
    return current_app.config['CARPETA_IMG_PLATOS']


def respuesta_json(texto, estado=200):
    return current_app.response_class(response=texto, status=estado, mimetype='application/json')


MAPA_CATEGORIAS = {
    1: 'EN',
    2: 'FU',
    3: 'PO',
    4: 'BE'
}

NOMBRES_A_ID_CATEGORIA = {
    'entrada': 1,
    'plato fuerte': 2,
    'postre': 3,
    'bebida': 4
}

def generar_codigo_plato(id_categoria, conn):
    if id_categoria not in MAPA_CATEGORIAS:
        raise ValueError("Categoría inválida.")
    prefijo = f"PL{MAPA_CATEGORIAS[id_categoria]}"
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id_plato FROM platos WHERE id_plato LIKE %s ORDER BY id_plato DESC LIMIT 1"
    cursor.execute(query, (f"{prefijo}%",))
    resultado = cursor.fetchone()
    cursor.close()
    if resultado:
        ultimo_codigo = resultado['id_plato']
        numero = int(ultimo_codigo[-3:])
        nuevo_numero = str(numero + 1).zfill(3)
    else:
        nuevo_numero = "001"
    return f"{prefijo}{nuevo_numero}"

def guardar_imagen_png(file_storage, id_plato, directorio_destino):
    if not os.path.exists(directorio_destino):
        os.makedirs(directorio_destino, exist_ok=True)
    nombre_archivo = f"{id_plato}.png"
    ruta_final = os.path.join(directorio_destino, nombre_archivo)
    imagen = Image.open(file_storage)
    if imagen.mode != 'RGBA':
        imagen = imagen.convert('RGBA')
    imagen.save(ruta_final, format='PNG', optimize=True)
    return nombre_archivo

# ========== RUTAS ESTÁTICAS ==========

@platos_bp.route('/img_remy/<path:filename>')
def obtener_imagen_local(filename):
    return send_from_directory(carpeta_img_platos(), filename)

# ========== RUTAS DE VISTAS (Rutas con la jerarquía correcta) ==========

@platos_bp.route('/')
def index():
    return render_template('modulo_platos/platos/platos_menu.html')

@platos_bp.route('/platos_menu')
def platos_menu():
    return render_template('modulo_platos/platos/platos_menu.html')

@platos_bp.route('/busqueda')
def busqueda():
    return render_template('modulo_platos/busqueda/busqueda.html')

@platos_bp.route('/crear_plato')
def crear_plato():
    return render_template('modulo_platos/platos/crear_plato.html')

@platos_bp.route('/modificar_plato/<id_plato>')
def modificar_plato(id_plato):
    return render_template('modulo_platos/platos/modificar_plato.html')

@platos_bp.route('/detalle_plato/<id_plato>')
def detalle_plato(id_plato):
    return render_template('modulo_platos/platos/detalle_plato.html')

@platos_bp.route('/crear_menu')
def crear_menu():
    return render_template('modulo_platos/menus/crear_menu.html')

@platos_bp.route('/modificar_menu/<id_menu>')
def modificar_menu(id_menu):
    return render_template('modulo_platos/menus/modificar_menu.html')

@platos_bp.route('/detalle_menu/<id_menu>')
def detalle_menu(id_menu):
    return render_template('modulo_platos/menus/detalle_menu.html')

# ========== BÚSQUEDA GENERAL ==========

@platos_bp.route('/buscar')
def buscar():
    q = request.args.get('q', '')
    return respuesta_json(buscarGeneral(q))

# ========== API INGREDIENTES (directa a BD) ==========

@platos_bp.route('/api/ingredientes', methods=['GET'])
def obtener_ingredientes():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_ingrediente, nombre, unidad_minima FROM ingredientes ORDER BY nombre ASC")
        ingredientes = cursor.fetchall()
        cursor.close()
        return jsonify(ingredientes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

# ========== API PLATOS ==========

@platos_bp.route('/api/platos', methods=['GET'])
def proxy_platos():
    return respuesta_json(consultarPlatos())

@platos_bp.route('/api/platos/<id_plato>', methods=['GET'])
def proxy_plato_id(id_plato):
    return respuesta_json(consultarPlatosId(id_plato))

@platos_bp.route('/api/platos/<id_plato>/ingredientes', methods=['GET'])
def proxy_plato_ingredientes(id_plato):
    return respuesta_json(consultarIngrediente(id_plato))

@platos_bp.route('/api/platos/insertar', methods=['POST'])
def insertar_plato():
    conn = None
    try:
        nombre = request.form.get('nombre', '').strip()
        categoria_raw = request.form.get('categoria', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        estado = request.form.get('estado', 'Activo')
        
        ingredientes_ids = request.form.getlist('ingredientes[]')
        cantidades = request.form.getlist('cantidades[]')

        if categoria_raw.isdigit():
            id_categoria = int(categoria_raw)
        else:
            id_categoria = NOMBRES_A_ID_CATEGORIA.get(categoria_raw.lower(), 0)

        if not nombre or id_categoria == 0 or not descripcion:
            return jsonify({"status": "error", "message": "Datos incompletos o categoría no válida."}), 400

        conn = get_db_connection()

        try:
            id_plato = generar_codigo_plato(id_categoria, conn)
        except ValueError as e:
            return jsonify({"status": "error", "message": str(e)}), 400

        nombre_imagen_guardada = ""
        if 'imagen' in request.files and request.files['imagen'].filename != '':
            archivo_imagen = request.files['imagen']
            nombre_imagen_guardada = guardar_imagen_png(archivo_imagen, id_plato, carpeta_img_platos())

        fecha_creacion = datetime.now().strftime('%Y-%m-%d')

        cursor = conn.cursor()
        query_plato = """
            INSERT INTO platos (id_plato, nombre, categoria, descripcion, img_plato, estado, fecha_creacion)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query_plato, (id_plato, nombre, id_categoria, descripcion, nombre_imagen_guardada, estado, fecha_creacion))

        if ingredientes_ids:
            query_ing = "INSERT INTO plato_ingrediente (id_plato, id_ingrediente, cantidad) VALUES (%s, %s, %s)"
            datos_ingredientes = []
            for idx, id_ing in enumerate(ingredientes_ids):
                if id_ing and id_ing.strip():
                    cant = cantidades[idx] if idx < len(cantidades) and cantidades[idx] else 1
                    datos_ingredientes.append((id_plato, id_ing.strip(), float(cant)))
            
            if datos_ingredientes:
                cursor.executemany(query_ing, datos_ingredientes)

        conn.commit()
        cursor.close()

        return jsonify({
            "status": "success",
            "message": "Plato e imagen guardados exitosamente",
            "id_plato_generado": id_plato,
            "img_plato": nombre_imagen_guardada
        }), 201

    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
        return jsonify({"status": "error", "message": f"Error en el servidor: {str(e)}"}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

# ========== MODIFICACIÓN Y ELIMINACIÓN DE PLATOS ==========

@platos_bp.route('/api/platos/<id_plato>', methods=['PUT', 'POST', 'DELETE'])
@platos_bp.route('/api/platos/<id_plato>/modificar', methods=['PUT', 'POST'])
def modificar_plato_api(id_plato):
    conn = None
    try:
        conn = get_db_connection()

        if request.method == 'DELETE':
            cursor_del = conn.cursor()
            cursor_del.execute("DELETE FROM plato_ingrediente WHERE id_plato = %s", (id_plato,))
            cursor_del.execute("DELETE FROM platos WHERE id_plato = %s", (id_plato,))
            conn.commit()
            cursor_del.close()
            return jsonify({"status": "success", "message": "Plato eliminado correctamente"}), 200

        is_json = request.is_json
        if is_json:
            data = request.get_json(silent=True) or {}
            nombre = data.get('nombre', '').strip()
            categoria_raw = str(data.get('categoria', '')).strip()
            descripcion = data.get('descripcion', '').strip()
            estado = data.get('estado', 'Activo')
            ing_data = data.get('ingredientes', [])
            cantidades = data.get('cantidades', [])
        else:
            data = request.form
            nombre = data.get('nombre', '').strip()
            categoria_raw = str(data.get('categoria', '')).strip()
            descripcion = data.get('descripcion', '').strip()
            estado = data.get('estado', 'Activo')
            ing_data = request.form.getlist('ingredientes[]') or request.form.getlist('ingredientes')
            cantidades = request.form.getlist('cantidades[]') or request.form.getlist('cantidades')

        if categoria_raw.isdigit():
            id_categoria = int(categoria_raw)
        else:
            id_categoria = NOMBRES_A_ID_CATEGORIA.get(categoria_raw.lower(), 0)

        if not nombre or id_categoria == 0 or not descripcion:
            return jsonify({"status": "error", "message": "Campos requeridos incompletos."}), 400

        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT categoria, img_plato FROM platos WHERE id_plato = %s", (id_plato,))
        plato_actual = cursor.fetchone()
        cursor.close()

        if not plato_actual:
            return jsonify({"status": "error", "message": f"El plato '{id_plato}' no existe."}), 404

        id_final = id_plato
        if int(plato_actual['categoria']) != id_categoria:
            id_final = generar_codigo_plato(id_categoria, conn)

        nombre_imagen = plato_actual['img_plato'] or ""
        if 'imagen' in request.files and request.files['imagen'].filename != '':
            nombre_imagen = guardar_imagen_png(request.files['imagen'], id_final, carpeta_img_platos())

        cursor = conn.cursor()
        cursor.execute("DELETE FROM plato_ingrediente WHERE id_plato = %s", (id_plato,))

        cursor.execute("""
            UPDATE platos SET id_plato=%s, nombre=%s, categoria=%s,
            descripcion=%s, img_plato=%s, estado=%s WHERE id_plato=%s
        """, (id_final, nombre, id_categoria, descripcion, nombre_imagen, estado, id_plato))

        datos_ing = []
        if is_json and isinstance(ing_data, list) and len(ing_data) > 0 and isinstance(ing_data[0], dict):
            for item in ing_data:
                id_ing = str(item.get("id_ingrediente", "")).strip()
                cant = item.get("cantidad", 1)
                if id_ing:
                    datos_ing.append((id_final, id_ing, float(cant)))
        else:
            for idx, id_ing in enumerate(ing_data):
                id_ing_str = str(id_ing).strip()
                if id_ing_str:
                    cant = cantidades[idx] if idx < len(cantidades) and cantidades[idx] else 1
                    datos_ing.append((id_final, id_ing_str, float(cant)))

        if datos_ing:
            cursor.executemany(
                "INSERT INTO plato_ingrediente (id_plato, id_ingrediente, cantidad) VALUES (%s, %s, %s)",
                datos_ing
            )

        conn.commit()
        cursor.close()

        return jsonify({
            "status": "success",
            "message": "Plato modificado exitosamente",
            "id_plato_final": id_final,
            "id_plato_anterior": id_plato
        }), 200

    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
        return jsonify({"status": "error", "message": f"Error en el servidor: {str(e)}"}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

# ========== API MENUS ==========

@platos_bp.route('/api/menus', methods=['GET'])
def api_menus():
    return respuesta_json(consultarMenu())

@platos_bp.route('/api/menus/<id_menu>', methods=['GET'])
def api_menu_id(id_menu):
    return respuesta_json(consultarMenuId(id_menu))

@platos_bp.route('/api/menus/<id_menu>', methods=['PUT'])
def api_menu_put(id_menu):
    data = request.get_json(silent=True) or {}
    if "menu" in data:
        data["menu"]["id_menu"] = id_menu
    else:
        data["id_menu"] = id_menu
    return respuesta_json(modificarMenu(data))

@platos_bp.route('/api/menus', methods=['POST'])
def api_menus_post():
    return respuesta_json(insertarMenu(request.get_json(silent=True) or {}))
