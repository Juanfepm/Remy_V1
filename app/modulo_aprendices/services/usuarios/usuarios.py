from conexion import *

class Usuarios:

    def actualizar_aprendices_vencidos(self):
        sql = """
            UPDATE usuarios 
            SET estado = 'inactivo' 
            WHERE rol_usuario = 0 
            AND estado = 'activo' 
            AND fecha_fin_etapa_lectiva < CURDATE()
        """
        mi_cursor.execute(sql)
        mi_db.commit()
        return mi_cursor.rowcount

    def listar(self):
        self.actualizar_aprendices_vencidos()
        
        sql = "SELECT id_usuario, nombre, apellido, ficha FROM usuarios WHERE rol_usuario = 0 AND estado = 'activo'"
        mi_cursor.execute(sql)
        return mi_cursor.fetchall()

    def agregar(self, cedula, nombres, apellidos, correo, contrasena_cifrada, celular, fecha_fin_etapa_lectiva, ficha, rol):
        sql = """INSERT INTO usuarios (id_usuario, nombre, apellido, correo, contrasena, celular, fecha_fin_etapa_lectiva, ficha, rol_usuario, estado, fecha_creacion) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'activo', NOW())"""
        valores = (cedula, nombres, apellidos, correo, contrasena_cifrada, celular, fecha_fin_etapa_lectiva, ficha, rol)
        mi_cursor.execute(sql, valores)
        mi_db.commit()

    def consultar(self, cedula):
        self.actualizar_aprendices_vencidos()
        
        sql = "SELECT nombre, apellido, celular, ficha, fecha_fin_etapa_lectiva FROM usuarios WHERE id_usuario = %s AND estado = 'activo'"
        mi_cursor.execute(sql, (cedula,))
        return mi_cursor.fetchall()
    
    def modificar(self, cedula, nombres, apellidos, cifrada, contrasena, ficha, fecha):
        sql = """UPDATE usuarios SET nombre=%s, apellido=%s, contrasena=%s, celular=%s, ficha=%s, fecha_fin_etapa_lectiva=%s WHERE id_usuario=%s"""
        valores = (nombres, apellidos, cifrada, contrasena, ficha, fecha, cedula)
        mi_cursor.execute(sql, valores)
        mi_db.commit()

    def eliminar(self, cedula):
        sql = "UPDATE usuarios SET estado = 'inactivo' WHERE id_usuario = %s"
        mi_cursor.execute(sql, (cedula,))
        mi_db.commit()


mis_usuarios = Usuarios()