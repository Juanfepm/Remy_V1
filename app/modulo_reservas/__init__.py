"""Web de reservas. Sólo sirve las páginas: los datos vienen de la API PHP
(modulo_reservas_php), cuya URL se configura con REMY_URL_API_RESERVAS."""
from pathlib import Path

from flask import Blueprint, abort, render_template

TEMPLATE_ROOT = Path(__file__).resolve().parents[1] / "templates"
RESERVAS_TEMPLATE_ROOT = TEMPLATE_ROOT / "modulo_reservas"

PAGE_TEMPLATES = {
    path.relative_to(TEMPLATE_ROOT).as_posix()
    for path in RESERVAS_TEMPLATE_ROOT.rglob("*.html")
}

reservas_bp = Blueprint("reservas", __name__, url_prefix="/reservas")


@reservas_bp.get("/")
def inicio():
    return render_template("modulo_reservas/index.html")


@reservas_bp.get("/aplicacion/<path:page>")
def pagina(page):
    template = f"modulo_reservas/aplicacion/{page}"
    if template not in PAGE_TEMPLATES:
        abort(404)
    return render_template(template)
