from app.modulo_inventario.database import db
from app.modulo_inventario.models.ingredientes import IngredienteModel

class IngredienteService:
    @staticmethod
    def get_all():
        return [i.to_dict() for i in IngredienteModel.query.all()]

    @staticmethod
    def create(data):
        required = ('nombre', 'categoria')
        missing = [field for field in required if not data.get(field)]
        if missing:
            raise ValueError(f'Faltan campos requeridos: {", ".join(missing)}')

        ingredient_id = data.get('id_ingrediente') or IngredienteService._next_id()
        nuevo = IngredienteModel(
            id_ingrediente=ingredient_id,
            nombre=data['nombre'],
            categoria=data['categoria'],
            stock=data.get('stock', 0),
            unidad=data.get('unidad'),
            unidad_minima=data.get('unidad_minima'),
            descripcion=data.get('descripcion'),
            stock_minimo=data.get('stock_minimo', 0)
        )
        db.session.add(nuevo)
        db.session.commit()
        return nuevo.to_dict()

    @staticmethod
    def get_by_id(ingredient_id):
        return IngredienteModel.query.get_or_404(ingredient_id)

    @staticmethod
    def update(ingredient_id, data):
        ingrediente = IngredienteService.get_by_id(ingredient_id)
        allowed = ('nombre', 'categoria', 'stock', 'unidad', 'unidad_minima', 'descripcion', 'stock_minimo')
        for field in allowed:
            if field in data:
                setattr(ingrediente, field, data[field])
        db.session.commit()
        return ingrediente.to_dict()

    @staticmethod
    def delete(ingredient_id):
        ingrediente = IngredienteService.get_by_id(ingredient_id)
        db.session.delete(ingrediente)
        db.session.commit()

    @staticmethod
    def get_agotados():
        return [i.to_dict() for i in IngredienteModel.query.filter(IngredienteModel.stock <= 0).all()]

    @staticmethod
    def get_bajo_stock():
        return [i.to_dict() for i in IngredienteModel.query.filter(
            IngredienteModel.stock > 0,
            IngredienteModel.stock <= IngredienteModel.stock_minimo
        ).all()]

    @staticmethod
    def _next_id():
        ids = [int(ingredient.id_ingrediente) for ingredient in IngredienteModel.query.all()
               if str(ingredient.id_ingrediente).isdigit()]
        return f'{max(ids, default=0) + 1:03d}'
