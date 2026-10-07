from app.modulo_inventario.database import db
from datetime import datetime

class EntradaModel(db.Model):
    __tablename__ = 'entradas'

    id_entrada = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_ingrediente = db.Column(db.String(3), db.ForeignKey('ingredientes.id_ingrediente'), nullable=False)
    fecha_vencimiento = db.Column(db.Date, nullable=True)
    fecha_hora = db.Column(db.DateTime, default=datetime.utcnow)
    cantidad = db.Column(db.Integer, nullable=True)
    estado = db.Column(db.String(50), nullable=True)
    unidad_medida = db.Column(db.String(10), nullable=True)
    id_proveedor = db.Column(db.String(12), db.ForeignKey('proveedores.id_proveedor'), nullable=True)
    proveedor_nombre = db.Column(db.String(100), nullable=True)
    factura = db.Column(db.String(20), nullable=True)

    def to_dict(self):
        return {
            "id_entrada": self.id_entrada,
            "id_ingrediente": self.id_ingrediente,
            "fecha_vencimiento": self.fecha_vencimiento.isoformat() if self.fecha_vencimiento else None,
            "fecha_hora": self.fecha_hora.isoformat() if self.fecha_hora else None,
            "cantidad": self.cantidad,
            "estado": self.estado,
            "unidad_medida": self.unidad_medida,
            "id_proveedor": self.id_proveedor,
            "proveedor_nombre": self.proveedor_nombre,
            "factura": self.factura
        }
