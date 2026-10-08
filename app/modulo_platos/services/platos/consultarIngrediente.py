"""
Traducción de consultarIngrediente.php
Trae los ingredientes de un plato específico desde plato_ingrediente.
"""
from app.db import con_conexion
import json

@con_conexion
def consultarTodosIngredientes(conn) -> str:
    sql = """
        SELECT 
            id_ingrediente, 
            nombre, 
            unidad_minima AS unidad 
        FROM ingredientes
    """
    try:
        cursor = conn.cursor()
        cursor.execute(sql)
        resultado = cursor.fetchall()
        cursor.close()

        ingredientes = []
        for row in resultado:
            ingredientes.append({
                "id_ingrediente": row[0],
                "nombre":         row[1] if row[1] else "Sin nombre",
                "unidad":         row[2] if row[2] else "gr"
            })

        return json.dumps(ingredientes, ensure_ascii=False)
    except Exception as e:
        print(f"Error al consultar lista general de ingredientes: {e}")
        return json.dumps([])

@con_conexion
def consultarIngrediente(conn, id_plato: str) -> str:
    if not id_plato:
        return json.dumps([])

    sql = """
        SELECT
            i.id_ingrediente,
            i.nombre,
            i.stock AS stock_general,
            pi.cantidad AS cantidad_receta,
            i.unidad_minima AS unidad
        FROM plato_ingrediente pi
        INNER JOIN ingredientes i ON pi.id_ingrediente = i.id_ingrediente
        WHERE pi.id_plato = %s
    """
    try:
        cursor = conn.cursor()
        cursor.execute(sql, (str(id_plato).strip(),))
        resultado = cursor.fetchall()
        cursor.close()

        ingredientes = []
        for row in resultado:
            ingredientes.append({
                "id_ingrediente": row[0],
                "nombre":         row[1] if row[1] else "Sin nombre",
                "stock":          float(row[2]) if row[2] is not None else 0,
                "cantidad":       float(row[3]) if row[3] is not None else 0,
                "unidad":         row[4] if row[4] else ""
            })

        return json.dumps(ingredientes, ensure_ascii=False)
    except Exception as e:
        print(f"Error al consultar ingredientes para el plato {id_plato}: {e}")
        return json.dumps([])

    