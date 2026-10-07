from conexiones import *
from login import mi_login
from flask import Flask, request, jsonify
from flask_restful import Api
import jwt
import datetime

programa = Flask(__name__)
api = Api(programa)

Llave_secreta = "ADSO_2026"

@programa.route('/login', methods=['POST'])
def iniciar():
    datos = request.get_json()
    correo = datos.get('correo')
    contrasena = datos.get('contrasena')

    resultado = mi_login().login(correo, contrasena)

    if resultado["status"] == "success":
        payload = {
            'correo': correo,
            'rol_usuario': resultado['rol_usuario'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        }
        token = jwt.encode(payload, Llave_secreta, algorithm='HS256')
        return jsonify({"mensaje": resultado["message"], "rol_usuario": resultado["rol_usuario"], "token": token}), 200
    else:
        return jsonify(resultado), 401

@programa.route('/verificar-sesion', methods=['GET'])
def verificar_sesion():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401

    token = auth_header.split(" ")[1]

    try:
        datos = jwt.decode(token, Llave_secreta, algorithms=['HS256'])
        return jsonify({'mensaje': 'Sesión válida', 'usuario': datos}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Sesión expirada'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

if __name__ == "__main__":
    programa.run(host="0.0.0.0", debug=True, port=5106)