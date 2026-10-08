from conexion import *
from correo import mi_correo

programa = Flask(__name__)
api = Api(programa)


class EnvioCorreo(Resource):

    def get(self):
        return jsonify({
            "mensaje": "micro de correo de REMY",
            "servidor": SMTP_HOST + ":" + str(SMTP_PORT),
            "configurado": hay_credenciales()
        })

    def post(self):
        peticion = request.json or {}

        tipo = peticion.get("tipo", "")
        destino = peticion.get("correo", "")
        datos = peticion.get("datos", {})

        if destino == "":
            return jsonify({"enviado": False, "mensaje": "Falta el correo del destinatario"})

        enviado, motivo = mi_correo.confirmar(tipo, destino, datos)

        if enviado:
            return jsonify({"enviado": True, "mensaje": "Correo enviado a " + destino})

        return jsonify({"enviado": False, "mensaje": motivo})


api.add_resource(EnvioCorreo, "/correo")


if __name__ == "__main__":
    programa.run(host="0.0.0.0", debug=True, port=PUERTO)
