from conexion import *

class CargaMasivaAprendices:

    def comprobar_cedula(self, id_usuario):
        sql = "SELECT id_usuario FROM usuarios WHERE id_usuario = %s"
        mi_cursor.execute(sql, (id_usuario,))
        return mi_cursor.fetchone()

    def insertar_aprendiz(self, id_usuario, nombres, apellidos, correo, cifrada, telefono, ficha, fecha_fin, rol):
        sql = """INSERT INTO usuarios ( id_usuario, nombre, apellido, correo, contrasena, celular, ficha, fecha_fin_etapa_lectiva, rol_usuario, estado, fecha_creacion) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'activo', NOW())"""
        valores = (id_usuario, nombres, apellidos, correo, cifrada, telefono, ficha, fecha_fin, rol)
        mi_cursor.execute(sql, valores)
        mi_db.commit()


mi_cargaMasiva = CargaMasivaAprendices()