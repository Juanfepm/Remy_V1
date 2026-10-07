from datetime import datetime, date
from flask import Flask, request
from flask_restful import Api, Resource
from flask_cors import CORS
from eventos import mis_eventos
from aprendices import mis_aprendices

programa = Flask(__name__)
CORS(
    programa,
    resources={r"/*": {"origins": "*"}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)
api = Api(programa)

def validar_lideres(lider_cocina, lider_servicio):
    if not lider_cocina:
        return False, "Debe seleccionar un líder de cocina."

    if not lider_servicio:
        return False, "Debe seleccionar un líder de servicio."

    if str(lider_cocina) == str(lider_servicio):
        return False, "El mismo aprendiz no puede ocupar los dos liderazgos."

    return True, "Líderes válidos."

def limpiar_fila_para_json(fila):
    fila_limpia = []
    for valor in fila:
        if isinstance(valor, datetime):
            fila_limpia.append(valor.strftime("%d/%m/%Y %I:%M %p"))
        elif isinstance(valor, date):
            fila_limpia.append(valor.strftime("%d/%m/%Y"))
        elif isinstance(valor, str) and "T" in valor:
            try:
                dt = datetime.fromisoformat(valor.replace("Z", ""))
                fila_limpia.append(dt.strftime("%d/%m/%Y %I:%M %p"))
            except ValueError:
                fila_limpia.append(valor)
        else:
            fila_limpia.append(valor)
    return fila_limpia

class ListaEventos(Resource):
    def get(self):
        filtro_sin_lideres = request.args.get('sin_lideres', 'false').lower() == 'true'
        eventos = mis_eventos.listar(solo_sin_lideres=filtro_sin_lideres)
        eventos_listos = [limpiar_fila_para_json(fila) for fila in eventos]
        return {
            "mensaje": "Eventos encontrados",
            "cantidad": len(eventos_listos),
            "data": eventos_listos
        }, 200

class Evento(Resource):
    def get(self, id_evento):
        resultado = mis_eventos.consultar(id_evento)
        if len(resultado) == 0:
            return {"mensaje": "Evento no encontrado"}, 404

        fila_lista = limpiar_fila_para_json(resultado[0])
        return {"mensaje": "Evento encontrado", "data": fila_lista}, 200

class AsignarLideres(Resource):
    def put(self, id_evento):
        nuevo = request.json or {}

        lider_cocina = nuevo.get("lider_cocina")
        lider_servicio = nuevo.get("lider_servicio")

        datos_validos, mensaje = validar_lideres(lider_cocina, lider_servicio)

        if not datos_validos:
            return {"mensaje": mensaje}, 400

        evento = mis_eventos.consultar(id_evento)

        if len(evento) == 0:
            return {"mensaje": "El evento no existe."}, 404

        mis_eventos.asignar_lideres(id_evento, lider_cocina, lider_servicio)

        return {
            "mensaje": "Aprendices asignados correctamente.",
            "id_evento": id_evento,
            "lider_cocina": lider_cocina,
            "lider_servicio": lider_servicio
        }, 200

class ListaAprendices(Resource):
    def get(self):
        try:
            solo_disponibles = request.args.get('disponibles', 'false').lower() == 'true'
            ficha = request.args.get('ficha', None)

            if solo_disponibles:
                aprendices, ciclo_reiniciado = mis_aprendices.listar_disponibles(ficha=ficha)
                mensaje = "Se han asignado todos los aprendices. Ciclo reiniciado." if ciclo_reiniciado else "Aprendices disponibles encontrados"
            else:
                aprendices = mis_aprendices.listar()
                mensaje = "Aprendices encontrados"

            aprendices_listos = [limpiar_fila_para_json(fila) for fila in aprendices]

            return {
                "mensaje": mensaje,
                "cantidad": len(aprendices_listos),
                "data": aprendices_listos
            }, 200

        except Exception as e:
            print(f"Error en GET /aprendices: {e}")
            traceback.print_exc()
            return {"mensaje": "Error al listar aprendices", "error": str(e)}, 500

api.add_resource(ListaEventos, "/eventos")
api.add_resource(Evento, "/eventos/<id_evento>")
api.add_resource(AsignarLideres, "/eventos/<id_evento>/lideres")
api.add_resource(ListaAprendices, "/aprendices")

if __name__ == "__main__":
    programa.run(host="0.0.0.0", debug=True, port=5104)