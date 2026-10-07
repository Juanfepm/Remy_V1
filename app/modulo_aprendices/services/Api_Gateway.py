from functools import wraps
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
import jwt
from datetime import datetime, timezone, timedelta

gateway = Flask(__name__)

CORS(
    gateway,
    resources={r"/*": {"origins": "*"}},
    expose_headers=["X-Nuevo-Token"],
    allow_headers=["Content-Type", "Authorization", "X-Nuevo-Token"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

Llave_Secreta = "ADSO_2026"
DURACION_SESION = timedelta(minutes=30)

Servicios = {
    "login": "http://127.0.0.1:5006/login",
    "usuarios": "http://127.0.0.1:5003/usuarios",
    "eventos": "http://127.0.0.1:5004/eventos",
    "aprendices": "http://127.0.0.1:5004/aprendices",
    "carga_masiva": "http://127.0.0.1:5005/programas/cargar-masiva",
    "dashboard": "http://127.0.0.1:5007/programa/dashboard"
}

def requerir_jwt(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        if request.method == 'OPTIONS':
            res = make_response('', 200)
            res.headers["Access-Control-Allow-Origin"] = "*"
            res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Nuevo-Token"
            res.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            return res

        auth_header = request.headers.get("Authorization", None)
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token ausente"}), 401

        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, Llave_Secreta, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401

        resultado = f(payload, *args, **kwargs)

        nuevo_payload = {
            k: v for k, v in payload.items() if k != "exp"
        }
        nuevo_payload["exp"] = datetime.now(timezone.utc) + DURACION_SESION
        nuevo_token = jwt.encode(nuevo_payload, Llave_Secreta, algorithm="HS256")

        if isinstance(resultado, tuple):
            resul = make_response(resultado[0], resultado[1])
        else:
            resul = make_response(resultado)
        resul.headers["X-Nuevo-Token"] = nuevo_token

        return resul

    return decorador


@gateway.route("/login", methods=["POST"])
def gateway_login():
    datos = request.get_json()
    respuesta = requests.post(Servicios["login"], json=datos)
    return jsonify(respuesta.json()), respuesta.status_code

@gateway.route("/verificar-sesion", methods=["GET"])
@requerir_jwt
def gateway_verificar_sesion(payload):
    return jsonify({"mensaje": "Sesión válida", "usuario": payload}), 200


@gateway.route("/usuarios", methods=["GET", "POST"])
@requerir_jwt
def gateway_usuarios(payload):
    headers = {"Authorization": request.headers.get("Authorization")}
    if request.method == "GET":
        respuesta = requests.get(Servicios["usuarios"], headers=headers)
    else:
        datos = request.get_json()
        respuesta = requests.post(Servicios["usuarios"], json=datos, headers=headers)

    return jsonify(respuesta.json()), respuesta.status_code


@gateway.route("/usuarios/<cedula>", methods=["GET", "PUT", "DELETE"])
@requerir_jwt
def gateway_usuario_id(payload, cedula):
    headers = {"Authorization": request.headers.get("Authorization")}
    if request.method == "GET":
        respuesta = requests.get(f"{Servicios['usuarios']}/{cedula}", headers=headers)
    elif request.method == "PUT":
        datos = request.get_json()
        respuesta = requests.put(f"{Servicios['usuarios']}/{cedula}", json=datos, headers=headers)
    else:
        respuesta = requests.delete(f"{Servicios['usuarios']}/{cedula}", headers=headers)

    return jsonify(respuesta.json()), respuesta.status_code


@gateway.route("/eventos", methods=["GET"])
@requerir_jwt
def gateway_eventos(payload):
    headers = {"Authorization": request.headers.get("Authorization")}
    respuesta = requests.get(Servicios["eventos"], headers=headers)
    return jsonify(respuesta.json()), respuesta.status_code

@gateway.route("/eventos/<id_evento>", methods=["GET"])
@requerir_jwt
def gateway_evento_id(payload, id_evento):
    headers = {"Authorization": request.headers.get("Authorization")}
    url_destino = f"{Servicios['eventos']}/{id_evento}"
    
    try:
        respuesta = requests.get(url_destino, headers=headers)
        try:
            contenido = respuesta.json()
        except requests.exceptions.JSONDecodeError:
            contenido = {
                "error": "El microservicio no devolvió un JSON válido.",
                "status_code": respuesta.status_code,
                "respuesta_raw": respuesta.text
            }
            
        return jsonify(contenido), respuesta.status_code

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error de conexión con el servicio de eventos: {str(e)}"}), 503


@gateway.route("/eventos/<id_evento>/lideres", methods=["PUT"])
@requerir_jwt
def gateway_asignar_lideres(payload, id_evento):
    datos = request.get_json()
    headers = {"Authorization": request.headers.get("Authorization")}
    respuesta = requests.put(f"{Servicios['eventos']}/{id_evento}/lideres", json=datos, headers=headers)
    return jsonify(respuesta.json()), respuesta.status_code


@gateway.route("/aprendices", methods=["GET"])
@requerir_jwt
def gateway_aprendices(payload):
    headers = {"Authorization": request.headers.get("Authorization")}
    respuesta = requests.get(Servicios["aprendices"], headers=headers)
    return jsonify(respuesta.json()), respuesta.status_code

@gateway.route("/programas/cargar-masiva", methods=["POST"])
@requerir_jwt 
def gateway_carga_masiva(payload):
    if 'archivo' not in request.files:
        return jsonify({"error": "Debe enviar un archivo Excel"}), 400

    archivo = request.files['archivo']
    files = {'archivo': (archivo.filename, archivo.stream.read(), archivo.mimetype)}
    headers = {"Authorization": request.headers.get("Authorization")}

    respuesta = requests.post(Servicios["carga_masiva"], files=files, headers=headers)
    return jsonify(respuesta.json()), respuesta.status_code

@gateway.route("/dashboard/menu-resumen", methods=["GET", "OPTIONS"])
@requerir_jwt
def gateway_menu_resumen(payload):
    headers = {"Authorization": request.headers.get("Authorization")}
    respuesta = requests.get(f"{Servicios['dashboard']}/menu-resumen", headers=headers)
    return jsonify(respuesta.json()), respuesta.status_code

@gateway.route("/dashboard/completo", methods=["GET", "OPTIONS"])
@requerir_jwt
def gateway_dashboard_completo(payload):
    headers = {"Authorization": request.headers.get("Authorization")}
    respuesta = requests.get(f"{Servicios['dashboard']}/completo", headers=headers)
    return jsonify(respuesta.json()), respuesta.status_code


@gateway.route("/programa/dashboard/eventos", methods=["GET", "OPTIONS"])
@gateway.route("/dashboard/eventos", methods=["GET", "OPTIONS"])
@requerir_jwt
def gateway_dashboard_eventos(payload):
    headers = {"Authorization": request.headers.get("Authorization")}
    try:
        respuesta = requests.get(f"{Servicios['dashboard']}/eventos", headers=headers)
        return jsonify(respuesta.json()), respuesta.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error de conexión con el servicio de dashboard: {str(e)}"}), 503


if __name__ == "__main__":
    gateway.run(host="0.0.0.0", debug=True, port=5001)