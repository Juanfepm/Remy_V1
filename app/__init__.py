"""Aplicación unificada de REMY.

Un solo Flask con un blueprint por módulo:

    /aprendices   usuarios, carga masiva, liderazgo y dashboard
    /inventario   insumos, entradas y salidas
    /platos       platos, menús y búsqueda
    /reservas     web de reservas (su API sigue siendo PHP)
"""
from flask import Flask, redirect, request, url_for

from app.config import Config
from app.roles import ROL_APRENDIZ, ROL_INSTRUCTOR


def create_app(config=Config):
    app = Flask(__name__, template_folder="templates", static_folder="static")
    app.config.from_object(config)

    from app.modulo_inventario.database import db
    db.init_app(app)

    from app.modulo_aprendices import aprendices_bp
    from app.modulo_inventario import inventario_bp
    from app.modulo_platos import platos_bp
    from app.modulo_reservas import reservas_bp

    app.register_blueprint(aprendices_bp)
    app.register_blueprint(inventario_bp)
    app.register_blueprint(platos_bp)
    app.register_blueprint(reservas_bp)

    @app.context_processor
    def variables_globales():
        return {
            "raiz": request.script_root,
            "url_api_reservas": app.config["URL_API_RESERVAS"],
            "roles": {"instructor": ROL_INSTRUCTOR, "aprendiz": ROL_APRENDIZ},
        }

    @app.route("/")
    def inicio():
        return redirect(url_for("reservas.inicio"))

    return app
