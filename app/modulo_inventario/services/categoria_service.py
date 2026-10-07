from app.modulo_inventario.database import db
from app.modulo_inventario.models.categoria import CategoriaModel

class CategoriaService:
    @staticmethod
    def get_all():
        return [c.to_dict() for c in CategoriaModel.query.all()]

    @staticmethod
    def create(data):
        if not data.get('id_categoria') or not data.get('nombre'):
            raise ValueError('Los campos id_categoria y nombre son requeridos')
        nueva = CategoriaModel(
            id_categoria=data['id_categoria'],
            nombre=data['nombre'],
        )
        db.session.add(nueva)
        db.session.commit()
        return nueva.to_dict()
