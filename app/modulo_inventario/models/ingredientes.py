from app.modulo_inventario.database import db

class IngredienteModel(db.Model):
    __tablename__ = 'ingredientes'

    id_ingrediente = db.Column(db.String(16), primary_key=True)
    categoria = db.Column(db.String(12), db.ForeignKey('categoria_ingredientes.id_categoria'), nullable=False)
    nombre = db.Column(db.String(256), nullable=False)
    stock = db.Column(db.Numeric(10, 3), default=0)
    unidad = db.Column(db.String(10), nullable=True)
    unidad_minima = db.Column(db.String(10), nullable=True)
    descripcion = db.Column(db.Text, nullable=True)
    stock_minimo = db.Column(db.Numeric(10, 3), default=0)

    def to_dict(self):
        return {
            "id_ingrediente": self.id_ingrediente,
            "categoria": self.categoria,
            "nombre": self.nombre,
            "stock": self.stock,
            "unidad": self.unidad,
            "unidad_minima": self.unidad_minima,
            "descripcion": self.descripcion,
            "stock_minimo": self.stock_minimo
        }
