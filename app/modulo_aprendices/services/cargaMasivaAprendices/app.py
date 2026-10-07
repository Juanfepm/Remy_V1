import bcrypt
import pandas as pd
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from cargaMasivaAprendices import mi_cargaMasiva

programa = Flask(__name__)
CORS(programa)

@programa.route("/programas/cargar-masiva", methods=["POST"])
def cargar_masiva():

    if "archivo" not in request.files:
        return jsonify({"error": "No se encontró el archivo"}), 400

    archivo = request.files["archivo"]

    if archivo.filename == "":
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400

    if not archivo.filename.endswith((".xlsx", ".xls")):
        return jsonify({"error": "Debe seleccionar un archivo Excel (.xlsx o .xls)"}), 400

    try:
        excel = pd.read_excel(archivo, dtype=str)
        excel = excel.fillna("")

        excel.columns = [str(col).strip().lower() for col in excel.columns]

        columnas_requeridas = [
            "cedula",
            "nombres",
            "apellidos",
            "correo",
            "telefono",
            "ficha",
            "fecha fin etapa lectiva"
        ]
        columnas_faltantes = [
            col for col in columnas_requeridas if col not in excel.columns
        ]
        if columnas_faltantes:
            return jsonify({
                "error": "El documento excel que quieres cargar no tiene todas las columnas requeridas.",
                "detalle": {
                    "faltantes": columnas_faltantes,
                    "requeridas": columnas_requeridas
                },
                "sugerencia": "Verifica que el documento excel coincida exactamente con los nombres requeridos."
            }), 400

        registros = []
        errores = []

        salt = bcrypt.gensalt()

        for numero, fila in excel.iterrows():
            id_usuario = str(fila["cedula"]).strip()
            nombre = str(fila["nombres"]).strip()
            apellido = str(fila["apellidos"]).strip()
            correo = str(fila["correo"]).strip()
            telefono = str(fila["telefono"]).strip()
            ficha = str(fila["ficha"]).strip()
            fecha_fin = str(fila["fecha fin etapa lectiva"]).strip()

            if not id_usuario:
                errores.append({
                    "fila": numero + 2,
                    "columna": "cedula",
                    "error": "La columna cedula está vacía en esta fila",
                    "sugerencia": "Ingrese el número de identificación del aprendiz."
                })
                continue

            if not id_usuario.isdigit():
                errores.append({
                    "fila": numero + 2,
                    "columna": "cedula",
                    "valor": id_usuario,
                    "error": "La cédula debe contener solo números."
                })
                continue

            if id_usuario.startswith("0"):
                errores.append({
                    "fila": numero + 2,
                    "columna": "cedula",
                    "valor": id_usuario,
                    "error": "La cédula no puede iniciar con 0."
                })
                continue

            if len(id_usuario) < 8 or len(id_usuario) > 10:
                errores.append({
                    "fila": numero + 2,
                    "columna": "cedula",
                    "valor": id_usuario,
                    "error": "La cédula debe tener un mínimo de 8 y un máximo de 10 dígitos."
                })
                continue

            if not nombre:
                errores.append({
                    "fila": numero + 2,
                    "error": "Falta el nombre del aprendiz."})
                continue

            if not apellido:
                errores.append({
                    "fila": numero + 2,
                    "error": "Falta el apellido del aprendiz."})
                continue

            if not correo:
                errores.append({
                    "fila": numero + 2,
                    "error": "Falta el correo institucional del aprendiz."})
                continue

            if not correo.endswith("@soy.sena.edu.co"):
                errores.append({
                    "fila": numero + 2,
                    "columna": "correo",
                    "valor": correo,
                    "error": "El correo debe pertenecer al dominio institucional '@soy.sena.edu.co'."
                })
                continue

            if not telefono:
                errores.append({
                    "fila": numero + 2,
                    "error": "Falta el número telefónico del aprendiz."})
                continue

            if not telefono.isdigit() or len(telefono) != 10 or not telefono.startswith("3"):
                errores.append({
                "fila": numero + 2,
                "columna": "telefono",
                "valor": telefono,
                "error": "El número de celular debe contener únicamente números, tambien debe tener 10 dígitos e iniciar con 3."
                })
                continue

            if not fecha_fin:
                errores.append({
                    "fila": numero + 2,
                    "columna": "fecha fin etapa lectiva",
                    "valor": fecha_fin,
                    "error": "Falta la fecha de finalización de la etapa lectiva del aprendiz."
                })
                continue

            if not ficha:
                errores.append({
                    "fila": numero + 2,
                    "columna": "ficha",
                    "valor": ficha,
                    "error": "Falta la ficha del Aprendiz."
                })
                continue


            if not ficha.isdigit() or len(ficha) < 7 or len(ficha) > 8:
                errores.append({
                    "fila": numero + 2,
                    "columna": "ficha",
                    "valor": ficha,
                    "error": "La ficha debe contener únicamente números y debe de tener un mínimo de 7 y un máximo de 8 dígitos."
                })
                continue

            existe = mi_cargaMasiva.comprobar_cedula(id_usuario)
            if existe:
                errores.append({
                    "fila": numero + 2,
                    "id_usuario": id_usuario,
                    "error": f"El usuario con cédula {id_usuario} ya está registrado."
                })
                continue

            cifrada = bcrypt.hashpw(telefono.encode("utf-8"), salt).decode("utf-8")

            mi_cargaMasiva.insertar_aprendiz(
                id_usuario,
                nombre,
                apellido,
                correo,
                cifrada,
                telefono,
                ficha,
                fecha_fin,
                0
            )

            registros.append({
                "id_usuario": id_usuario,
                "nombre": f"{nombre} {apellido}",
                "correo": correo,
                "ficha": ficha,
                "fecha_fin": fecha_fin
            })
            
        if len(registros) == 0 and len(errores) > 0:
            return jsonify({
                "error": "No se pudo registrar ningún aprendiz.",
                "registros_creados": 0,
                "errores": len(errores),
                "detalle_errores": errores
            }), 400

        return jsonify({
            "mensaje": f"Carga completada. Se registraron {len(registros)} aprendices.",
            "registros_creados": len(registros),
            "registros": registros,
            "errores": len(errores),
            "detalle_errores": errores
        }), 200

    except Exception as e:
        print("\n=== ERROR EN /programas/cargar-masiva ===")
        traceback.print_exc()
        print("=========================================\n")

        return jsonify({
            "error": "No se pudo procesar el archivo",
            "detalle": str(e)
        }), 500


if __name__ == "__main__":
    programa.run(host="0.0.0.0", debug=True, port=5005)
