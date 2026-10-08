"""
Traducción de consultarPlatos.php
Lista todos los platos de la base de datos.
"""
from app.db import con_conexion
import json

@con_conexion
def consultarPlatos(conn):
    cursor = conn.cursor()
    conn.commit()
    sql = "SELECT * FROM platos ORDER BY CASE WHEN estado='Activo' THEN 0 ELSE 1 END"
    cursor.execute(sql)
    columnas = [col[0] for col in cursor.description]
    resultado = cursor.fetchall()
    cursor.close()

    if resultado:
        response = [dict(zip(columnas, fila)) for fila in resultado]
    else:
        response = []

    return json.dumps(response, ensure_ascii=False, default=str)