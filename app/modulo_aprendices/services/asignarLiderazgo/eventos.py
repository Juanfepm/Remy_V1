from conexion import *


class Eventos:

    def actualizar_eventos_vencidos(self):
        sql = """
            UPDATE eventos 
            SET estado = 'inactivo'
            WHERE fecha_fin < NOW() AND estado = 'activo'
        """
        mi_cursor.execute(sql)
        mi_db.commit()
        return mi_cursor.rowcount

    def listar(self, solo_sin_lideres=False):
        self.actualizar_eventos_vencidos()

        condicion_filtro = ""
        if solo_sin_lideres:
            condicion_filtro = """ AND (e.lider_cocina IS NULL OR e.lider_cocina = '' OR e.lider_cocina = '0') AND (e.lider_servicio IS NULL OR e.lider_servicio = '' OR e.lider_servicio = '0') """
            
        sql = f"""
            SELECT 
                e.id_evento,
                e.nombre_evento,
                e.estado,
                e.correo_fk,
                e.franja_horaria,
                e.fecha_inicio,
                e.fecha_fin,
                e.numero_personas,
                e.experiencia,
                e.id_menu_fk,
                e.fecha_creacion,
                e.fecha_modificacion,
                e.usuario_modificacion,
                COALESCE(CONCAT(u_cocina.nombre, ' ', u_cocina.apellido), 'Sin asignar') AS lider_cocina,
                COALESCE(CONCAT(u_servicio.nombre, ' ', u_servicio.apellido), 'Sin asignar') AS lider_servicio,
                e.costo_total
            FROM eventos e
            LEFT JOIN usuarios u_cocina ON e.lider_cocina = u_cocina.id_usuario
            LEFT JOIN usuarios u_servicio ON e.lider_servicio = u_servicio.id_usuario
            WHERE e.estado = 'activo' {condicion_filtro}
            ORDER BY e.fecha_inicio ASC
        """

        mi_cursor.execute(sql)
        resultados = mi_cursor.fetchall()
        return resultados

    def consultar(self, id_evento):
        self.actualizar_eventos_vencidos()

        sql = """ 
                SELECT 
                    e.id_evento,
                    e.nombre_evento,
                    e.estado,
                    e.correo_fk,
                    e.franja_horaria,
                    e.fecha_inicio,
                    e.fecha_fin,
                    e.numero_personas,
                    e.experiencia,
                    e.id_menu_fk,
                    e.fecha_creacion,
                    e.fecha_modificacion,
                    e.usuario_modificacion,
                    COALESCE(CONCAT(u_cocina.nombre, ' ', u_cocina.apellido), 'Sin asignar') AS lider_cocina,
                    COALESCE(CONCAT(u_servicio.nombre, ' ', u_servicio.apellido), 'Sin asignar') AS lider_servicio,
                    e.costo_total,
                    COALESCE(m.nombre, 'Sin asignar') AS nombre_menu,
                    COALESCE(m.tiempos_menu, 'N/A') AS tiempos_menu,
                    COALESCE(m.descripcion, 'Sin descripción') AS descripcion_menu
                FROM eventos e
                LEFT JOIN usuarios u_cocina ON e.lider_cocina = u_cocina.id_usuario
                LEFT JOIN usuarios u_servicio ON e.lider_servicio = u_servicio.id_usuario
                LEFT JOIN menu m ON e.id_menu_fk = m.id_menu
                WHERE e.id_evento = %s AND e.estado = 'activo'
            """
        mi_cursor.execute(sql, (id_evento,))
        return mi_cursor.fetchall()

    def asignar_lideres(self, id_evento, lider_cocina, lider_servicio):
        sql = """ UPDATE eventos SET lider_cocina=%s, lider_servicio=%s, fecha_modificacion=NOW() WHERE id_evento=%s"""
        valores = (lider_cocina, lider_servicio, id_evento)
        mi_cursor.execute(sql, valores)
        mi_db.commit()


mis_eventos = Eventos()