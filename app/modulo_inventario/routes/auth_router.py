from flask import Blueprint, request, jsonify, redirect
from app.modulo_inventario.services.auth_service import AuthService

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        if request.is_json:
            data = request.get_json() or {}
        else:
            data = request.form.to_dict() or {}

        # Soportar nombres de campos del formulario (usuario/palabra) o de API (correo/contrasena)
        correo = data.get('usuario') or data.get('correo')
        contrasena = data.get('palabra') or data.get('contrasena')

        res = AuthService.autenticar(correo, contrasena)

        # Si es petición normal de formulario (no JSON ni AJAX), redirigir
        if not request.is_json and request.headers.get('Accept', '').find('text/html') != -1:
            return redirect(f"/Remy__/Aplicacion__/{res['redirect']}", code=302)

        return jsonify(res), 200
    except ValueError as ve:
        return jsonify({"ok": False, "error": str(ve)}), 401
    except Exception as e:
        return jsonify({"ok": False, "error": f"Error del servidor: {str(e)}"}), 500
