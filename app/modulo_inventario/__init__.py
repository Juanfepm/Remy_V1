"""Módulo de inventario: insumos, entradas y salidas."""
from flask import Blueprint, redirect, render_template, url_for

from app.modulo_inventario.models import entrada, salida, proveedor, usuario  # noqa: F401 (registra modelos)
from app.modulo_inventario.routes.auth_router import auth_bp
from app.modulo_inventario.routes.categoria_router import categoria_bp
from app.modulo_inventario.routes.ingrediente_router import ingrediente_bp
from app.modulo_inventario.routes.movimiento_router import movimiento_bp

inventario_bp = Blueprint('inventario', __name__, url_prefix='/inventario')

# API del inventario: /inventario/api/...
api_bp = Blueprint('api', __name__, url_prefix='/api')
api_bp.register_blueprint(ingrediente_bp)
api_bp.register_blueprint(categoria_bp)
api_bp.register_blueprint(movimiento_bp)
api_bp.register_blueprint(auth_bp)
inventario_bp.register_blueprint(api_bp)


# Vistas (HTML). Se aceptan también los nombres .html porque las páginas se
# enlazan entre sí de forma relativa.
@inventario_bp.route('/')
def index():
    return redirect(url_for('inventario.login'))

@inventario_bp.route('/login')
@inventario_bp.route('/index.html')
def login():
    return render_template('modulo_inventario/index.html')

@inventario_bp.route('/panel_aprendiz')
@inventario_bp.route('/panel_aprendiz.html')
def panel_aprendiz():
    return render_template('modulo_inventario/panel_aprendiz.html')

@inventario_bp.route('/panel_instructor')
@inventario_bp.route('/panel_instructor.html')
def panel_instructor():
    return render_template('modulo_inventario/panel_instructor.html')

@inventario_bp.route('/inventario')
@inventario_bp.route('/inventario.html')
def inventario():
    return render_template('modulo_inventario/inventario.html')

@inventario_bp.route('/entradas')
@inventario_bp.route('/entradas.html')
def entradas():
    return render_template('modulo_inventario/entradas.html')

@inventario_bp.route('/salidas')
@inventario_bp.route('/salidas.html')
def salidas():
    return render_template('modulo_inventario/salidas.html')

@inventario_bp.route('/insumos')
@inventario_bp.route('/insumos.html')
def insumos():
    return render_template('modulo_inventario/insumos.html')

@inventario_bp.route('/insumos_panel')
@inventario_bp.route('/insumos_panel.html')
def insumos_panel():
    return render_template('modulo_inventario/insumos_panel.html')

@inventario_bp.route('/agotados')
@inventario_bp.route('/agotados.html')
def agotados():
    return render_template('modulo_inventario/agotados.html')

@inventario_bp.route('/bajo_stock')
@inventario_bp.route('/bajo_stock.html')
def bajo_stock():
    return render_template('modulo_inventario/bajo_stock.html')

@inventario_bp.route('/editar_insumo')
@inventario_bp.route('/editar_insumo_panel.html')
def editar_insumo():
    return render_template('modulo_inventario/editar_insumo_panel.html')

@inventario_bp.route('/salir')
def salir():
    return redirect(url_for('inventario.login'))
