"""Módulo de aprendices: usuarios, carga masiva, liderazgo y dashboard.

Antes eran un gateway (5101) y cinco microservicios (5103-5107). Ahora todo
vive en /aprendices/api y el control del token que hacía el gateway se hace
aquí, antes y después de cada petición.
"""
from datetime import datetime, timedelta, timezone

import jwt
from flask import Blueprint, current_app, g, jsonify, redirect, render_template, request, url_for

from app.modulo_aprendices.services.asignarLiderazgo.app import programa as liderazgo_bp
from app.modulo_aprendices.services.cargaMasivaAprendices.app import programa as carga_masiva_bp
from app.modulo_aprendices.services.dashboard.app import programa as dashboard_bp
from app.modulo_aprendices.services.login.app import programa as login_bp
from app.modulo_aprendices.services.usuarios.app import programa as usuarios_bp

DURACION_SESION = timedelta(minutes=30)

aprendices_bp = Blueprint("aprendices", __name__, url_prefix="/aprendices")

# ---------- API: /aprendices/api/... ----------

api_bp = Blueprint("api", __name__, url_prefix="/api")

# Endpoints que no piden token.
ENDPOINTS_PUBLICOS = {"aprendices.api.login.iniciar"}


@api_bp.before_request
def exigir_token():
    if request.method == "OPTIONS" or request.endpoint in ENDPOINTS_PUBLICOS:
        return None

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Token ausente"}), 401

    try:
        g.payload_jwt = jwt.decode(
            auth_header.split(" ", 1)[1], current_app.config["SECRET_KEY"], algorithms=["HS256"]
        )
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Token inválido"}), 401
    return None


@api_bp.after_request
def renovar_token(respuesta):
    payload = g.get("payload_jwt")
    if payload:
        nuevo = {k: v for k, v in payload.items() if k != "exp"}
        nuevo["exp"] = datetime.now(timezone.utc) + DURACION_SESION
        respuesta.headers["X-Nuevo-Token"] = jwt.encode(
            nuevo, current_app.config["SECRET_KEY"], algorithm="HS256"
        )
    return respuesta


for sub in (login_bp, usuarios_bp, liderazgo_bp, carga_masiva_bp, dashboard_bp):
    api_bp.register_blueprint(sub)
aprendices_bp.register_blueprint(api_bp)

# ---------- Vistas ----------


@aprendices_bp.route("/")
def inicio_principal():
    return redirect(url_for("aprendices.login"))

@aprendices_bp.route("/login")
def login():
    return render_template("modulo_aprendices/index.html")

@aprendices_bp.route("/liderazgo")
def liderazgo():
    return render_template("modulo_aprendices/Liderazgo.html")

@aprendices_bp.route("/cargaMasiva")
def carga_masiva():
    return render_template("modulo_aprendices/carga_masiva/carga_masiva.html")

@aprendices_bp.route("/cargaIndividual")
def carga_individual():
    return render_template("modulo_aprendices/usuario/carga_individual.html")

@aprendices_bp.route("/crear_instructor")
def crear_instructor():
    return render_template("modulo_aprendices/usuario/crear_instructor.html")

@aprendices_bp.route("/listaAprendices")
def lista_aprendices():
    return render_template("modulo_aprendices/usuario/listaAprendices.html")

@aprendices_bp.route("/dashboard")
def dashboard():
    return render_template("modulo_aprendices/Panel_Instructor.html")

@aprendices_bp.route("/asignarLiderazgo")
def asignar_liderazgo():
    return render_template("modulo_aprendices/asignar_liderazgo/asignar_liderazgo.html")

@aprendices_bp.route("/detalleEvento")
def detalle_evento():
    return render_template("modulo_aprendices/asignar_liderazgo/detalleEvento.html")

@aprendices_bp.route("/detalleAprendiz")
def detalle_aprendiz():
    return render_template("modulo_aprendices/usuario/detalleAprendiz.html")

@aprendices_bp.route("/modificarAprendiz")
def modificar_aprendiz():
    return render_template("modulo_aprendices/usuario/ModificarAprendiz.html")

@aprendices_bp.route("/salir")
def salir():
    return redirect(url_for("aprendices.login"))
