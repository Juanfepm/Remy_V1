"""Configuración única de REMY.

Todo sale de variables de entorno (o del archivo .env en la raíz, que no se
versiona). Los valores por defecto sirven para desarrollo local con XAMPP.
"""
import os
from pathlib import Path

RAIZ_PROYECTO = Path(__file__).resolve().parents[1]

try:
    from dotenv import load_dotenv
    load_dotenv(RAIZ_PROYECTO / ".env")
except ImportError:
    pass


class Config:
    SECRET_KEY = os.getenv("REMY_SECRET_KEY", "ADSO_2026")

    DB_HOST = os.getenv("REMY_DB_HOST", "localhost")
    DB_PORT = int(os.getenv("REMY_DB_PORT", "3306"))
    DB_USER = os.getenv("REMY_DB_USER", "root")
    DB_PASSWORD = os.getenv("REMY_DB_PASSWORD", "")
    DB_NAME = os.getenv("REMY_DB_NAME", "remy")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_recycle": 280}

    # URL de la API PHP de reservas (se queda en PHP).
    URL_API_RESERVAS = os.getenv(
        "REMY_URL_API_RESERVAS", "http://localhost/Remy_V1/modulo_reservas_php/"
    )

    # Carpeta donde se guardan las fotos de los platos.
    CARPETA_IMG_PLATOS = os.getenv(
        "REMY_CARPETA_IMG_PLATOS", str(RAIZ_PROYECTO / "uploads" / "platos")
    )

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
