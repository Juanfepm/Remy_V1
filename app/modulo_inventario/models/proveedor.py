from app.modulo_inventario.database import db

class ProveedorModel(db.Model):
    __tablename__ = 'proveedores'

    id_proveedor = db.Column(db.String(12), primary_key=True)
    nombre = db.Column(db.String(40), nullable=False)
    telefono = db.Column(db.String(10), nullable=True)

    def to_dict(self):
        return {
            "id_proveedor": self.id_proveedor,
            "nombre": self.nombre,
            "telefono": self.telefono
        }
