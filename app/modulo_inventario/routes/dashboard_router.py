from flask import Blueprint, jsonify
from app.modulo_inventario.services.dashboard_service import DashboardService

dashboard_bp = Blueprint('dashboard_bp', __name__, url_prefix='/dashboard')

@dashboard_bp.route('/eventos', methods=['GET'])
def get_eventos():
    try:
        return jsonify({"status": "success", "data": DashboardService.get_eventos()}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@dashboard_bp.route('/menu-resumen', methods=['GET'])
def get_menu_resumen():
    try:
        return jsonify({"status": "success", "data": DashboardService.get_menu_resumen()}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@dashboard_bp.route('/reservas', methods=['GET'])
def get_reservas():
    try:
        return jsonify({"status": "success", "data": DashboardService.get_reservas()}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
