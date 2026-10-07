from datetime import datetime
from app.modulo_inventario.database import db

class UsuarioModel(db.Model):
    __tablename__ = 'usuarios'

    id_usuario = db.Column(db.String(15), primary_key=True)
    nombre = db.Column(db.String(40), nullable=True)
    apellido = db.Column(db.String(40), nullable=True)
    correo = db.Column(db.String(64), nullable=True)
    rol_usuario = db.Column(db.Integer, nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    contrasena = db.Column(db.String(255), nullable=True)
    ficha = db.Column(db.String(8), nullable=True)
    estado = db.Column(db.String(10), default='activo')

    def to_dict(self):
        return {
            'id_usuario': self.id_usuario,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'correo': self.correo,
            'rol_usuario': self.rol_usuario,
            'ficha': self.ficha,
            'estado': self.estado,
            'rol_nombre': 'Aprendiz' if self.rol_usuario == 1 else ('Instructor' if self.rol_usuario == 2 else 'Usuario')
        }
