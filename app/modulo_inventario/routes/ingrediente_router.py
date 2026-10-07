from flask import Blueprint, request, jsonify
from app.modulo_inventario.services.ingrediente_service import IngredienteService

ingrediente_bp = Blueprint('ingrediente_bp', __name__, url_prefix='/ingredientes')

@ingrediente_bp.route('/', methods=['GET'])
def get_ingredientes():
    return jsonify(IngredienteService.get_all()), 200

@ingrediente_bp.route('/agotados', methods=['GET'])
def get_agotados():
    return jsonify(IngredienteService.get_agotados()), 200

@ingrediente_bp.route('/bajo-stock', methods=['GET'])
def get_bajo_stock():
    return jsonify(IngredienteService.get_bajo_stock()), 200

@ingrediente_bp.route('/', methods=['POST'])
def create_ingrediente():
    try:
        data = request.get_json()
        res = IngredienteService.create(data)
        return jsonify(res), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@ingrediente_bp.route('/<string:ingredient_id>', methods=['GET'])
def get_ingrediente(ingredient_id):
    try:
        return jsonify(IngredienteService.get_by_id(ingredient_id).to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@ingrediente_bp.route('/<string:ingredient_id>', methods=['PUT', 'PATCH'])
def update_ingrediente(ingredient_id):
    try:
        return jsonify(IngredienteService.update(ingredient_id, request.get_json() or {})), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@ingrediente_bp.route('/<string:ingredient_id>', methods=['DELETE'])
def delete_ingrediente(ingredient_id):
    try:
        IngredienteService.delete(ingredient_id)
        return jsonify({"message": "Ingrediente eliminado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
