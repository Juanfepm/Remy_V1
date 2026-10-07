from app.modulo_inventario.database import db

class CategoriaModel(db.Model):
    __tablename__ = 'categoria_ingredientes'

    id_categoria = db.Column(db.String(12), primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id_categoria": self.id_categoria,
            "nombre": self.nombre
        }
