from app.modulo_inventario.database import db
from datetime import datetime

class SalidaModel(db.Model):
    __tablename__ = 'salidas'

    id_salida = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_ingrediente = db.Column(db.String(3), db.ForeignKey('ingredientes.id_ingrediente'), nullable=False)
    fecha_hora = db.Column(db.DateTime, default=datetime.utcnow)
    cantidad = db.Column(db.Numeric(10, 3), nullable=True)
    unidad_medida = db.Column(db.String(10), nullable=True)
    motivo_salida = db.Column(db.String(60), nullable=True)

    def to_dict(self):
        return {
            "id_salida": self.id_salida,
            "id_ingrediente": self.id_ingrediente,
            "fecha_hora": self.fecha_hora.isoformat() if self.fecha_hora else None,
            "cantidad": float(self.cantidad) if self.cantidad is not None else None,
            "unidad_medida": self.unidad_medida,
            "motivo_salida": self.motivo_salida
        }
