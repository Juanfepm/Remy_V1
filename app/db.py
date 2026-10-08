"""Conexión MySQL compartida por todos los módulos.

Cada consulta abre su conexión y la cierra al terminar: así no quedan
conexiones globales colgadas cuando el servidor las corta por inactividad.
"""
from contextlib import contextmanager
from functools import wraps

import mysql.connector
from flask import current_app


def obtener_conexion():
    cfg = current_app.config
    return mysql.connector.connect(
        host=cfg["DB_HOST"],
        port=cfg["DB_PORT"],
        user=cfg["DB_USER"],
        password=cfg["DB_PASSWORD"],
        database=cfg["DB_NAME"],
        charset="utf8mb4",
    )


@contextmanager
def conexion_bd(dictionary=False):
    """Uso: with conexion_bd() as (mi_db, mi_cursor): ..."""
    mi_db = obtener_conexion()
    mi_cursor = mi_db.cursor(dictionary=dictionary, buffered=True)
    try:
        yield mi_db, mi_cursor
    finally:
        mi_cursor.close()
        mi_db.close()


def con_conexion(funcion):
    """Abre una conexión, se la pasa a la función como primer argumento
    (conn) y la cierra al terminar."""
    @wraps(funcion)
    def envoltura(*args, **kwargs):
        conn = obtener_conexion()
        try:
            return funcion(conn, *args, **kwargs)
        finally:
            conn.close()
    return envoltura
