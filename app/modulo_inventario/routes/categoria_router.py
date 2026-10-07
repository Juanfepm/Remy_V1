from flask import Blueprint, request, jsonify
from app.modulo_inventario.services.categoria_service import CategoriaService

categoria_bp = Blueprint('categoria_bp', __name__, url_prefix='/categoria')

@categoria_bp.route('/', methods=['GET'])
def get_categorias():
    return jsonify(CategoriaService.get_all()), 200

@categoria_bp.route('/', methods=['POST'])
def create_categoria():
    try:
        data = request.get_json()
        res = CategoriaService.create(data)
        return jsonify(res), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
