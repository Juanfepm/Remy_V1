import os
import sys
from flask import Flask, render_template, redirect, url_for

try:
    from flask_cors import CORS
    has_cors = True
except ImportError:
    has_cors = False

# Directorio base apuntando a la raiz del proyecto unificado (Remy_V1-main)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.modulo_inventario.database import db
from app.modulo_inventario.routes.ingrediente_router import ingrediente_bp
from app.modulo_inventario.routes.categoria_router import categoria_bp
from app.modulo_inventario.routes.movimiento_router import movimiento_bp
from app.modulo_inventario.routes.auth_router import auth_bp
from app.modulo_inventario.routes.dashboard_router import dashboard_bp
from app.modulo_inventario.models import entrada, salida, proveedor, usuario

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'app', 'templates'),
    static_folder=os.path.join(BASE_DIR, 'app', 'static')
)

if has_cors:
    CORS(app, resources={r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["X-Nuevo-Token"]
    }})

# Configuracion de conexion a la base de datos MySQL (remy_unificado)
database_user = os.getenv('DB_USER', 'root')
database_password = os.getenv('DB_PASSWORD', '')
database_host = os.getenv('DB_HOST', '127.0.0.1')
database_name = os.getenv('DB_NAME', 'remy_unificado')

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DB_URI',
    f'mysql+pymysql://{database_user}:{database_password}@{database_host}/{database_name}'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Registrar Blueprints del Backend
app.register_blueprint(ingrediente_bp)
app.register_blueprint(categoria_bp)
app.register_blueprint(movimiento_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)

@app.after_request
def add_api_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    return response

# Rutas de Vistas Frontend (HTML Templates)
@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login')
@app.route('/index.html')
def login():
    return render_template('modulo_inventario/index.html')

@app.route('/panel_aprendiz')
@app.route('/panel_aprendiz.html')
def panel_aprendiz():
    return render_template('modulo_inventario/panel_aprendiz.html')

@app.route('/panel_instructor')
@app.route('/panel_instructor.html')
def panel_instructor():
    return render_template('modulo_inventario/panel_instructor.html')

@app.route('/inventario')
@app.route('/inventario.html')
def inventario():
    return render_template('modulo_inventario/inventario.html')

@app.route('/entradas')
@app.route('/entradas.html')
def entradas():
    return render_template('modulo_inventario/entradas.html')

@app.route('/salidas')
@app.route('/salidas.html')
def salidas():
    return render_template('modulo_inventario/salidas.html')

@app.route('/insumos')
@app.route('/insumos.html')
def insumos():
    return render_template('modulo_inventario/insumos.html')

@app.route('/insumos_panel')
@app.route('/insumos_panel.html')
def insumos_panel():
    return render_template('modulo_inventario/insumos_panel.html')

@app.route('/agotados')
@app.route('/agotados.html')
def agotados():
    return render_template('modulo_inventario/agotados.html')

@app.route('/bajo_stock')
@app.route('/bajo_stock.html')
def bajo_stock():
    return render_template('modulo_inventario/bajo_stock.html')

@app.route('/editar_insumo')
@app.route('/editar_insumo_panel.html')
def editar_insumo():
    return render_template('modulo_inventario/editar_insumo_panel.html')

@app.route('/salir')
def salir():
    return redirect(url_for('login'))

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5200))
    print(f'Iniciando Modulo Inventario en http://127.0.0.1:{port}')
    app.run(host='0.0.0.0', port=port, debug=True)
