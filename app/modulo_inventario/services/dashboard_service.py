from datetime import date, datetime, timedelta
from sqlalchemy import text
from app.modulo_inventario.database import db


class DashboardService:
    """Respaldo de solo lectura sobre remy_unificado para el dashboard.
    Se usa cuando el API Gateway de los otros modulos no responde.
    Reservas no tiene servicio propio, asi que siempre sale de aqui."""

    @staticmethod
    def get_eventos():
        # Misma informacion que GET /eventos del servicio de liderazgo (asignarLiderazgo)
        filas = db.session.execute(text("""
            SELECT e.id_evento, e.nombre_evento, e.franja_horaria, e.fecha_inicio, e.fecha_fin,
                   e.numero_personas,
                   COALESCE(CONCAT(uc.nombre, ' ', uc.apellido), 'Sin asignar') AS lider_cocina,
                   COALESCE(CONCAT(us.nombre, ' ', us.apellido), 'Sin asignar') AS lider_servicio
            FROM eventos e
            LEFT JOIN usuarios uc ON e.lider_cocina = uc.id_usuario
            LEFT JOIN usuarios us ON e.lider_servicio = us.id_usuario
            WHERE e.estado = 'activo'
            ORDER BY e.fecha_inicio ASC
        """)).mappings().all()

        return [{
            'id_evento': fila['id_evento'],
            'nombre_evento': fila['nombre_evento'],
            'franja_horaria': fila['franja_horaria'],
            'fecha_inicio': DashboardService._iso(fila['fecha_inicio']),
            'fecha_fin': DashboardService._iso(fila['fecha_fin']),
            'numero_personas': fila['numero_personas'],
            'lider_cocina': fila['lider_cocina'],
            'lider_servicio': fila['lider_servicio']
        } for fila in filas]

    @staticmethod
    def get_menu_resumen():
        # Misma forma que GET /programa/dashboard/menu-resumen del servicio de dashboard
        total_menus = db.session.execute(text(
            "SELECT COUNT(*) FROM menu WHERE estado = 'activo'"
        )).scalar() or 0
        total_platos = db.session.execute(text(
            "SELECT COUNT(*) FROM platos WHERE estado = 'activo'"
        )).scalar() or 0
        platos = db.session.execute(text("""
            SELECT p.id_plato, p.nombre AS plato_nombre, c.nombre AS categoria, p.descripcion
            FROM platos p
            INNER JOIN categorias_platos c ON p.categoria = c.id_categoria
            WHERE p.estado = 'activo'
            ORDER BY p.nombre ASC
        """)).mappings().all()

        return {
            'total_menus': int(total_menus),
            'total_platos': int(total_platos),
            'platos': [dict(plato) for plato in platos]
        }

    @staticmethod
    def get_reservas():
        # Reservas agrupadas por dia, con el menu programado para ese dia
        filas = db.session.execute(text("""
            SELECT DATE(r.fecha_reserva) AS dia,
                   COUNT(*) AS total_reservas,
                   COALESCE(SUM(r.cantidad_menus), 0) AS total_menus,
                   MIN(r.hora_reserva) AS primera_hora,
                   MAX(m.nombre) AS menu_del_dia
            FROM reservas_dia r
            LEFT JOIN programacion_dia pd ON pd.fecha_reserva = r.fecha_reserva
            LEFT JOIN menu m ON m.id_menu = pd.id_menu
            WHERE r.estado IS NULL OR r.estado NOT IN ('cancelada', 'cancelado')
            GROUP BY DATE(r.fecha_reserva)
            ORDER BY dia ASC
        """)).mappings().all()

        return [{
            'fecha': DashboardService._iso(fila['dia']),
            'hora': DashboardService._hora(fila['primera_hora']),
            'total_reservas': int(fila['total_reservas']),
            'total_menus': int(fila['total_menus']),
            'menu': fila['menu_del_dia']
        } for fila in filas]

    @staticmethod
    def _iso(valor):
        if isinstance(valor, (datetime, date)):
            return valor.isoformat()
        return valor

    @staticmethod
    def _hora(valor):
        # MySQL TIME llega como timedelta
        if isinstance(valor, timedelta):
            minutos = int(valor.total_seconds()) // 60
            return f'{minutos // 60:02d}:{minutos % 60:02d}'
        return str(valor) if valor else None
