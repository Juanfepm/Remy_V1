import bcrypt
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_restful import Resource
from app.modulo_aprendices.services.usuarios.usuarios import mis_usuarios
from app.roles import ROL_APRENDIZ, ROL_INSTRUCTOR

programa = Blueprint("usuarios", __name__)

def limpiar_fila_para_json(fila):
    fila_limpia = []
    for valor in fila:
        if isinstance(valor, (date, datetime)):
            fila_limpia.append(valor.isoformat())
        else:
            fila_limpia.append(valor)
    return fila_limpia

def validar_datos_usuario(datos, es_modificacion=False):

    if not datos or not isinstance(datos, dict):
        return False, "No se recibieron datos válidos."

    cedula = str(datos.get("cedula", "")).strip()
    nombres = str(datos.get("nombres", "")).strip()
    apellidos = str(datos.get("apellidos", "")).strip()
    correo = str(datos.get("correo", "")).strip().lower()
    celular = str(datos.get("celular", "")).strip()
    ficha = datos.get("ficha")
    fecha_fin = datos.get("fecha_fin_etapa_lectiva")

    if not es_modificacion:

        if not cedula or not cedula.isdigit() or len(cedula) < 7 or len(cedula) > 10:
            return False, "La cédula debe contener entre 7 y 10 dígitos numéricos."

        if cedula.startswith("0"):
            return False, "La cédula no puede iniciar con cero."

    if not nombres:
        return False, "El nombre es obligatorio."

    if not apellidos:
        return False, "El apellido es obligatorio."

    if not celular:
        return False, "El celular es obligatoria."

    if not celular.isdigit() or len(celular) != 10 or not celular.startswith("3"):
        return False, "El número de celular debe contener únicamente números, tambien debe tener 10 dígitos e iniciar con 3."

    rol = None
    if correo.endswith("@soy.sena.edu.co"):
        rol = ROL_APRENDIZ
        if not ficha or str(ficha).strip() == "":
            return False, "El aprendiz requiere un número de ficha."
        
        ficha_str = str(ficha).strip()
        if not ficha_str.isdigit() or len(ficha_str) < 7 or len(ficha_str) > 8:
            return False, "La ficha debe contener entre 7 y 8 dígitos."

        if not fecha_fin:
            return False, "El aprendiz requiere la fecha de finalización de etapa lectiva."

        if ficha.startswith("0"):
            return False, "La ficha no puede iniciar con cero."

    elif correo.endswith("@sena.edu.co"):
        rol = ROL_INSTRUCTOR
        ficha = None
        fecha_fin = None
    else:
        return False, "El correo debe terminar en '@soy.sena.edu.co' o '@sena.edu.co'."

    datos_limpios = {
        "cedula": cedula,
        "nombres": nombres,
        "apellidos": apellidos,
        "correo": correo,
        "contrasena": celular,
        "ficha": ficha,
        "fecha_fin_etapa_lectiva": fecha_fin,
        "rol": rol
    }

    return True, datos_limpios


class ListaUsuarios(Resource):

    def get(self):
        usuarios = mis_usuarios.listar()
        usuarios_limpios = [limpiar_fila_para_json(u) for u in usuarios]
        return jsonify(usuarios_limpios)

    def post(self):
        datos_json = request.get_json(silent=True)


        es_valido, resultado = validar_datos_usuario(datos_json)
        if not es_valido:
            return {"mensaje": resultado}, 400

        datos = resultado


        existe = mis_usuarios.consultar(datos["cedula"])
        if len(existe) > 0:
            return {"mensaje": f"El usuario con cédula {datos['cedula']} ya está registrado."}, 409

        cifrada = bcrypt.hashpw(datos["contrasena"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        try:
            mis_usuarios.agregar(
                cedula=datos["cedula"],
                nombres=datos["nombres"],
                apellidos=datos["apellidos"],
                correo=datos["correo"],
                contrasena_cifrada=cifrada,
                celular=datos["contrasena"],
                fecha_fin_etapa_lectiva=datos["fecha_fin_etapa_lectiva"],
                ficha=datos["ficha"],
                rol=datos["rol"]
            )
            return {"mensaje": "Usuario creado con éxito."}, 201

        except Exception as e:
            return {"mensaje": "Error interno al guardar usuario.", "detalle": str(e)}, 500


class Usuarios(Resource):

    def get(self, cedula):
        usuario = mis_usuarios.consultar(cedula)
        if len(usuario) == 0:
            return jsonify({"mensaje": "Usuario no encontrado."}), 404

        fila_limpia = limpiar_fila_para_json(usuario[0])
        return jsonify({"mensaje": "Usuario encontrado", "data": fila_limpia})

    def put(self, cedula):
        datos_json = request.get_json(silent=True)


        resultado_busqueda = mis_usuarios.consultar(cedula)
        if len(resultado_busqueda) == 0:
            return {"mensaje": "El usuario no existe."}, 404


        datos_json["cedula"] = cedula
        es_valido, datos = validar_datos_usuario(datos_json, es_modificacion=True)
        if not es_valido:
            return {"mensaje": datos}, 400

        cifrada = bcrypt.hashpw(datos["contrasena"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        try:
            mis_usuarios.modificar(
                cedula,
                datos["nombres"],
                datos["apellidos"],
                cifrada,
                datos["contrasena"],
                datos["ficha"],
                datos["fecha_fin_etapa_lectiva"]
            )
            return {"mensaje": "Usuario modificado con éxito."}, 200
        except Exception as e:
            return {"mensaje": "Error al modificar el usuario.", "detalle": str(e)}, 500

    def delete(self, cedula):
        usuario = mis_usuarios.consultar(cedula)
        if len(usuario) == 0:
            return jsonify({"mensaje": "El usuario no existe."}), 404

        mis_usuarios.eliminar(cedula)
        return jsonify({"mensaje": "Usuario eliminado con éxito."})


programa.add_url_rule("/usuarios", view_func=ListaUsuarios.as_view("listausuarios"))
programa.add_url_rule("/usuarios/<cedula>", view_func=Usuarios.as_view("usuarios"))
