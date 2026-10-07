from flask import Blueprint, jsonify, request

from app.modulo_inventario.database import db
from app.modulo_inventario.services.movimiento_service import MovimientoService

movimiento_bp = Blueprint('movimiento_bp', __name__, url_prefix='/movimientos')


@movimiento_bp.route('/entradas', methods=['GET'])
def get_entradas():
    return jsonify(MovimientoService.get_entradas()), 200


@movimiento_bp.route('/entradas', methods=['POST'])
def create_entrada():
    try:
        return jsonify(MovimientoService.create_entrada(request.get_json() or {})), 201
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)}), 400


@movimiento_bp.route('/salidas', methods=['GET'])
def get_salidas():
    return jsonify(MovimientoService.get_salidas()), 200


@movimiento_bp.route('/salidas', methods=['POST'])
def create_salida():
    try:
        return jsonify(MovimientoService.create_salida(request.get_json() or {})), 201
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)}), 400


@movimiento_bp.route('/ultimos', methods=['GET'])
def get_ultimos():
    try:
        limit = int(request.args.get('limit', 10))
        limit = max(1, min(limit, 100))
        return jsonify(MovimientoService.get_ultimos(limit)), 200
    except Exception as error:
        return jsonify({'error': str(error)}), 400
