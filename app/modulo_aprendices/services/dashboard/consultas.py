from conexiones import get_connection


class Consultas:

    def listar_eventos(self):
        try:
            conexion = get_connection()
            cursor = conexion.cursor(dictionary=True)
            sql = """ SELECT id_evento, nombre_evento, fecha_inicio, fecha_fin FROM eventos WHERE estado = 'activo' ORDER BY fecha_inicio ASC LIMIT 5 """
            cursor.execute(sql)
            resultados = cursor.fetchall()
            return resultados
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            if 'conexion' in locals() and conexion: conexion.close()

    def lista_lideres(self):
        try:
            conexion = get_connection()
            cursor = conexion.cursor()
            sql = """ 
                SELECT 
                    e.nombre_evento, 
                    e.fecha_inicio, 
                    e.numero_personas, 
                    CONCAT(u1.nombre, ' ', u1.apellido) AS lider_cocina, 
                    CONCAT(u2.nombre, ' ', u2.apellido) AS lider_servicio 
                FROM eventos e
                LEFT JOIN usuarios u1 ON e.lider_cocina = u1.id_usuario
                LEFT JOIN usuarios u2 ON e.lider_servicio = u2.id_usuario
                WHERE e.estado = 'activo'
                ORDER BY e.fecha_inicio ASC LIMIT 5
            """
            cursor.execute(sql)
            resultados = cursor.fetchall()
            return resultados
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            if 'conexion' in locals() and conexion: conexion.close()

    def inventario(self):
        try:
            conexion = get_connection()
            cursor = conexion.cursor()
            sql=""" SELECT nombre, stock, unidad FROM inventario WHERE stock < stock_minimo"""
            cursor.execute(sql)
            resultados = cursor.fetchall()
            return resultados
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            if 'conexion' in locals() and conexion: conexion.close()

    def cantidad_menu(self):
        try:
            conexion = get_connection()
            cursor = conexion.cursor(dictionary=True)
            sql = """ SELECT COUNT(*) AS total_menus FROM menu WHERE estado = 'activo'; """
            cursor.execute(sql)
            resultado = cursor.fetchone()
            if resultado is None:
                return 0
            return resultado['total_menus'] if isinstance(resultado, dict) else resultado[0]
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            if 'conexion' in locals() and conexion: conexion.close()

    def cantidad_platos(self):
        try:
            conexion = get_connection()
            cursor = conexion.cursor(dictionary=True)
            sql = """ SELECT COUNT(*) AS total_platos FROM platos WHERE estado = 'activo'; """
            cursor.execute(sql)
            resultado = cursor.fetchone()
            if resultado is None:
                return 0
            return resultado['total_platos'] if isinstance(resultado, dict) else resultado[0]
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            if 'conexion' in locals() and conexion: conexion.close()

    def info_platos(self):
        try:
            conexion = get_connection()
            cursor = conexion.cursor(dictionary=True) 
            sql = """ SELECT p.id_plato,
                p.nombre AS plato_nombre, 
                c.nombre AS categoria, p.descripcion
                FROM platos p
                INNER JOIN categorias_platos c ON p.categoria = c.id_categoria
                WHERE p.estado = 'activo';"""
            cursor.execute(sql)
            resultado = cursor.fetchall()
            return resultado
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            if 'conexion' in locals() and conexion: conexion.close()


Mi_dash = Consultas()