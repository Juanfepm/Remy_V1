from app.db import conexion_bd
from app.roles import ROL_APRENDIZ


class Aprendices:

    def listar(self):
        with conexion_bd() as (mi_db, mi_cursor):
            sql = f""" SELECT id_usuario, nombre, apellido, ficha FROM usuarios WHERE rol_usuario = {ROL_APRENDIZ} AND estado = 'activo' """
            mi_cursor.execute(sql)
            return mi_cursor.fetchall()

    def consultar(self, id_usuario):
        with conexion_bd() as (mi_db, mi_cursor):
            sql = """SELECT id_usuario, nombre, apellido, correo, ficha, rol_usuario, estado FROM usuarios WHERE id_usuario=%s """
            mi_cursor.execute(sql, (id_usuario,))
            return mi_cursor.fetchall()

    def listar_disponibles(self, ficha=None):
        with conexion_bd() as (mi_db, mi_cursor):
            try:
                sql = f""" SELECT id_usuario, nombre, apellido, ficha FROM usuarios WHERE rol_usuario = {ROL_APRENDIZ} AND estado = 'activo' AND id_usuario NOT IN ( 
                    SELECT lider_cocina FROM eventos WHERE lider_cocina IS NOT NULL 
                    UNION 
                    SELECT lider_servicio FROM eventos WHERE lider_servicio IS NOT NULL 
                ) """
            
                if ficha:
                    sql += " AND ficha = %s"
                    mi_cursor.execute(sql, (ficha,))
                else:
                    mi_cursor.execute(sql)

                disponibles = mi_cursor.fetchall()

                if len(disponibles) < 2:
                    sql_todos = f""" SELECT id_usuario, nombre, apellido, ficha FROM usuarios WHERE rol_usuario = {ROL_APRENDIZ} AND estado = 'activo' """
                    if ficha:
                        sql_todos += " AND ficha = %s"
                        mi_cursor.execute(sql_todos, (ficha,))
                    else:
                        mi_cursor.execute(sql_todos)
                    return mi_cursor.fetchall(), True

                return disponibles, False

            except Exception as e:
                print(f"Error al listar aprendices disponibles: {e}")
                return [], False


mis_aprendices = Aprendices()