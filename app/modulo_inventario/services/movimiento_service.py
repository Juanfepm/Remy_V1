from datetime import datetime
from decimal import Decimal, InvalidOperation

from app.modulo_inventario.database import db
from app.modulo_inventario.models.categoria import CategoriaModel
from app.modulo_inventario.models.entrada import EntradaModel
from app.modulo_inventario.models.ingredientes import IngredienteModel
from app.modulo_inventario.models.proveedor import ProveedorModel
from app.modulo_inventario.models.salida import SalidaModel


class MovimientoService:
    UNIT_INFO = {
        'kg': ('mass', Decimal('1000'), 'Kg'),
        'gr': ('mass', Decimal('1'), 'Gr'),
        'g': ('mass', Decimal('1'), 'Gr'),
        'l': ('volume', Decimal('1000'), 'L'),
        'ml': ('volume', Decimal('1'), 'mL'),
        'und': ('count', Decimal('1'), 'Und'),
        'unidad': ('count', Decimal('1'), 'Und'),
        'unidades': ('count', Decimal('1'), 'Und')
    }

    @staticmethod
    def create_entrada(data):
        ingrediente = MovimientoService._get_ingrediente(data)
        cantidad = MovimientoService._get_cantidad(data)

        # Validar proveedor para evitar error de Foreign Key en MySQL
        prov_id = data.get('id_proveedor')
        valid_prov = None
        if prov_id:
            prov_exists = ProveedorModel.query.get(str(prov_id))
            if prov_exists:
                valid_prov = prov_exists.id_proveedor

        entrada = EntradaModel(
            id_ingrediente=ingrediente.id_ingrediente,
            fecha_vencimiento=MovimientoService._parse_date(data.get('fecha_vencimiento')),
            fecha_hora=MovimientoService._parse_datetime(data.get('fecha_hora')),
            cantidad=cantidad,
            estado=data.get('estado', 'Activo'),
            unidad_medida=data.get('unidad_medida') or ingrediente.unidad,
            id_proveedor=valid_prov,
            proveedor_nombre=str(data.get('proveedor_nombre') or '').strip() or None,
            factura=data.get('factura')
        )
        ingrediente.stock = (ingrediente.stock or 0) + cantidad
        db.session.add(entrada)
        db.session.commit()
        return entrada.to_dict()

    @staticmethod
    def create_salida(data):
        ingrediente = MovimientoService._get_ingrediente(data)
        cantidad = MovimientoService._get_decimal_quantity(data.get('cantidad'))
        stock_unit = MovimientoService._get_unit_info(ingrediente.unidad)
        output_unit = MovimientoService._get_unit_info(data.get('unidad_medida') or ingrediente.unidad)
        if stock_unit[0] != output_unit[0]:
            raise ValueError('La unidad de salida debe ser compatible con la unidad del insumo')

        cantidad_stock = MovimientoService._convert_quantity(cantidad, output_unit, stock_unit).quantize(Decimal('0.001'))
        stock_actual = Decimal(str(ingrediente.stock or 0))
        if cantidad_stock > stock_actual:
            raise ValueError('La cantidad de salida supera el stock disponible')

        salida = SalidaModel(
            id_ingrediente=ingrediente.id_ingrediente,
            fecha_hora=MovimientoService._parse_datetime(data.get('fecha_hora')),
            cantidad=cantidad,
            unidad_medida=output_unit[2],
            motivo_salida=data.get('motivo_salida')
        )
        ingrediente.stock = (stock_actual - cantidad_stock).quantize(Decimal('0.001'))
        db.session.add(salida)
        db.session.commit()
        return salida.to_dict()

    @staticmethod
    def get_ultimos(limit=10):
        entradas = EntradaModel.query.order_by(EntradaModel.fecha_hora.desc()).limit(limit).all()
        salidas = SalidaModel.query.order_by(SalidaModel.fecha_hora.desc()).limit(limit).all()
        movimientos = []
        for entrada in entradas:
            movimientos.append(MovimientoService._serialize(entrada, 'entrada'))
        for salida in salidas:
            movimientos.append(MovimientoService._serialize(salida, 'salida'))
        return sorted(movimientos, key=lambda movimiento: movimiento['fecha_hora'] or '', reverse=True)[:limit]

    @staticmethod
    def get_entradas():
        entradas = EntradaModel.query.order_by(EntradaModel.fecha_hora.desc()).all()
        ingredientes_map = {i.id_ingrediente: i for i in IngredienteModel.query.all()}
        categorias_map = {c.id_categoria: c.nombre for c in CategoriaModel.query.all()}
        proveedores_map = {p.id_proveedor: p.nombre for p in ProveedorModel.query.all()}
        result = []
        for entrada in entradas:
            ing = ingredientes_map.get(entrada.id_ingrediente)
            cat_nombre = categorias_map.get(ing.categoria) if ing else 'Sin categoría'
            result.append({
                'id_entrada': entrada.id_entrada,
                'id_ingrediente': entrada.id_ingrediente,
                'nombre_ingrediente': ing.nombre if ing else entrada.id_ingrediente,
                'categoria': cat_nombre,
                'id_categoria': ing.categoria if ing else None,
                'unidad': entrada.unidad_medida or (ing.unidad if ing else ''),
                'cantidad': entrada.cantidad,
                'fecha_hora': entrada.fecha_hora.isoformat() if entrada.fecha_hora else None,
                'fecha_vencimiento': entrada.fecha_vencimiento.isoformat() if entrada.fecha_vencimiento else None,
                'estado': entrada.estado,
                'id_proveedor': entrada.id_proveedor,
                'proveedor': entrada.proveedor_nombre or proveedores_map.get(entrada.id_proveedor),
                'factura': entrada.factura
            })
        return result

    @staticmethod
    def get_salidas():
        salidas = SalidaModel.query.order_by(SalidaModel.fecha_hora.desc()).all()
        ingredientes_map = {i.id_ingrediente: i for i in IngredienteModel.query.all()}
        categorias_map = {c.id_categoria: c.nombre for c in CategoriaModel.query.all()}
        result = []
        for salida in salidas:
            ing = ingredientes_map.get(salida.id_ingrediente)
            cat_nombre = categorias_map.get(ing.categoria) if ing else 'Sin categoría'
            result.append({
                'id_salida': salida.id_salida,
                'id_ingrediente': salida.id_ingrediente,
                'nombre_ingrediente': ing.nombre if ing else salida.id_ingrediente,
                'categoria': cat_nombre,
                'id_categoria': ing.categoria if ing else None,
                'unidad': salida.unidad_medida or (ing.unidad if ing else ''),
                'cantidad': float(salida.cantidad) if salida.cantidad is not None else None,
                'fecha_hora': salida.fecha_hora.isoformat() if salida.fecha_hora else None,
                'motivo_salida': salida.motivo_salida
            })
        return result

    @staticmethod
    def _serialize(movimiento, tipo):
        ingrediente = IngredienteModel.query.get(movimiento.id_ingrediente)
        categoria = CategoriaModel.query.get(ingrediente.categoria) if ingrediente and ingrediente.categoria else None
        return {
            'tipo': tipo,
            'id_movimiento': movimiento.id_entrada if tipo == 'entrada' else movimiento.id_salida,
            'id_ingrediente': movimiento.id_ingrediente,
            'nombre_ingrediente': ingrediente.nombre if ingrediente else movimiento.id_ingrediente,
            'categoria': categoria.nombre if categoria else '',
            'unidad': getattr(movimiento, 'unidad_medida', None) or (ingrediente.unidad if ingrediente else ''),
            'cantidad': float(movimiento.cantidad) if movimiento.cantidad is not None else None,
            'fecha_hora': movimiento.fecha_hora.isoformat() if movimiento.fecha_hora else None,
            'proveedor': getattr(movimiento, 'proveedor_nombre', None) if tipo == 'entrada' else None,
            'motivo_salida': movimiento.motivo_salida if tipo == 'salida' else None
        }

    @staticmethod
    def _get_ingrediente(data):
        ingredient_id = data.get('id_ingrediente')
        if not ingredient_id:
            raise ValueError('El campo id_ingrediente es requerido')
        ingrediente = IngredienteModel.query.get(ingredient_id)
        if not ingrediente:
            raise ValueError('El ingrediente no existe')
        return ingrediente

    @staticmethod
    def _get_cantidad(data):
        try:
            cantidad = int(data.get('cantidad'))
        except (TypeError, ValueError):
            raise ValueError('La cantidad debe ser un numero entero')
        if cantidad <= 0:
            raise ValueError('La cantidad debe ser mayor que cero')
        return cantidad

    @staticmethod
    def _get_decimal_quantity(value):
        try:
            cantidad = Decimal(str(value))
        except (InvalidOperation, TypeError, ValueError):
            raise ValueError('La cantidad debe ser un numero valido')
        if not cantidad.is_finite() or cantidad <= 0:
            raise ValueError('La cantidad debe ser mayor que cero')
        return cantidad

    @staticmethod
    def _get_unit_info(value):
        unit = str(value or '').strip().lower()
        unit_info = MovimientoService.UNIT_INFO.get(unit)
        if not unit_info:
            raise ValueError('La unidad del insumo no es compatible con las salidas')
        return unit_info

    @staticmethod
    def _convert_quantity(cantidad, from_unit, to_unit):
        if from_unit[0] != to_unit[0]:
            raise ValueError('No se puede convertir entre unidades incompatibles')
        return cantidad * from_unit[1] / to_unit[1]

    @staticmethod
    def _parse_date(value):
        if not value:
            return None
        return datetime.strptime(value, '%Y-%m-%d').date()

    @staticmethod
    def _parse_datetime(value):
        if not value:
            return datetime.utcnow()
        return datetime.fromisoformat(value.replace('Z', '+00:00')).replace(tzinfo=None)
