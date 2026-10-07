import os
from pathlib import Path

from flask import Flask, abort, render_template


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
TEMPLATE_ROOT = REPOSITORY_ROOT / "app" / "templates"
RESERVAS_TEMPLATE_ROOT = TEMPLATE_ROOT / "modulo_reservas"

app = Flask(
    __name__,
    template_folder=str(TEMPLATE_ROOT),
    static_folder=str(REPOSITORY_ROOT / "app" / "static"),
)

PAGE_TEMPLATES = {
    path.relative_to(TEMPLATE_ROOT).as_posix()
    for path in RESERVAS_TEMPLATE_ROOT.rglob("*.html")
}


@app.get("/")
def index():
    return render_template("modulo_reservas/index.html")


@app.get("/aplicacion/<path:page>")
def application_page(page):
    template = f"modulo_reservas/aplicacion/{page}"
    if template not in PAGE_TEMPLATES:
        abort(404)
    return render_template(template)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=False)
