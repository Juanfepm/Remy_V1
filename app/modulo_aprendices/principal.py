import os
from flask import Flask, render_template, session, redirect, url_for
from flask_cors import CORS

# BASE_DIR ajustado a la raíz del proyecto (Remy_Web)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'app', 'templates'),
    static_folder=os.path.join(BASE_DIR, 'app', 'static')
)

CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "expose_headers": ["X-Nuevo-Token"]
}})

@app.route("/")
def inicio_principal():
    return redirect(url_for("login"))

@app.route("/login")
def login():
    return render_template("modulo_aprendices/index.html")

@app.route("/liderazgo")
def liderazgo():
    return render_template("modulo_aprendices/liderazgo.html")

@app.route("/cargaMasiva")
def carga_masiva():
    return render_template("modulo_aprendices/carga_masiva/carga_masiva.html")

@app.route('/cargaIndividual')
def carga_individual():
    return render_template('modulo_aprendices/usuario/carga_individual.html')

@app.route('/crear_instructor')
def crear_instructor():
    return render_template('modulo_aprendices/usuario/crear_instructor.html')

@app.route("/listaAprendices")
def lista_aprendices():
    return render_template("modulo_aprendices/usuario/listaAprendices.html")

@app.route("/dashboard")
def dashboard():
    return render_template("modulo_aprendices/Panel_Instructor.html")

@app.route("/asignarLiderazgo")
def asignar_liderazgo():
    return render_template("modulo_aprendices/asignar_liderazgo/asignar_liderazgo.html")

@app.route("/detalleEvento")
def detalle_evento():
    return render_template("modulo_aprendices/asignar_liderazgo/detalleEvento.html")

@app.route("/detalleAprendiz")
def detalle_aprendiz():
    return render_template("modulo_aprendices/usuario/detalleAprendiz.html")

@app.route("/modificarAprendiz")
def modificar_aprendiz():
    return render_template("modulo_aprendices/usuario/ModificarAprendiz.html")

@app.route("/salir")
def salir():
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=True)