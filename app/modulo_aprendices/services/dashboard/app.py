from flask import Flask, jsonify
from flask_cors import CORS
from consultas import Consultas

app = Flask(__name__)

dato_consultas = Consultas()

@app.route('/programa/dashboard/eventos', methods=['GET'])
def obtener_eventos():
    try:
        data = dato_consultas.listar_eventos()
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/programa/dashboard/lideres', methods=['GET'])
def obtener_lideres():
    try:
        data = dato_consultas.lista_lideres()
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/programa/dashboard/menu-resumen', methods=['GET'])
def obtener_resumen_menu():
    
    try:
        cant_menus = dato_consultas.cantidad_menu()
        cant_platos = dato_consultas.cantidad_platos()
        lista_platos = dato_consultas.info_platos()

        respuesta = {
            "total_menus": cant_menus,
            "total_platos": cant_platos,
            "platos": lista_platos
        }
        return jsonify({"status": "success", "data": respuesta}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/programa/dashboard/completo', methods=['GET'])
def obtener_dashboard_completo():

    try:
        dashboard = {
            "eventos": dato_consultas.listar_eventos(),
            "lideres": dato_consultas.lista_lideres(),
            "inventario_alerta": dato_consultas.inventario(),
            "menu_resumen": {
                "total_menus": dato_consultas.cantidad_menu(),
                "total_platos": dato_consultas.cantidad_platos(),
                "platos": dato_consultas.info_platos()
            }
        }
        return jsonify({"status": "success", "data": dashboard}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5107, debug=True)