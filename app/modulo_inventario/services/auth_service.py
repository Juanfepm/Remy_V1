import os
from datetime import datetime, timezone, timedelta
from werkzeug.security import check_password_hash
from app.modulo_inventario.models.usuario import UsuarioModel

try:
    import jwt
    has_jwt = True
except ImportError:
    has_jwt = False

try:
    import bcrypt
    has_bcrypt = True
except ImportError:
    has_bcrypt = False

# Debe coincidir con la llave y duracion del API Gateway (modulo_aprendices/services/Api_Gateway.py)
LLAVE_SECRETA = os.getenv('JWT_SECRET', 'ADSO_2026')
DURACION_SESION = timedelta(minutes=30)

class AuthService:
    @staticmethod
    def autenticar(correo, contrasena):
        if not correo or not contrasena:
            raise ValueError("Correo y contraseña son requeridos")

        correo = str(correo).strip().lower()
        contrasena = str(contrasena).strip()

        # Buscar usuario por correo y activo
        usuario = UsuarioModel.query.filter(
            UsuarioModel.correo.ilike(correo)
        ).first()

        if not usuario:
            raise ValueError("Usuario no encontrado")

        if usuario.estado and usuario.estado.lower() != 'activo':
            raise ValueError("El usuario se encuentra inactivo")

        if not AuthService._verificar_contrasena(usuario.contrasena, contrasena):
            raise ValueError("Contraseña incorrecta")

        # Roles de remy_unificado (tabla roles): 1 = instructor, 2 = aprendiz, 0 = aprendiz por asignar
        redirect_url = "panel_instructor.html" if usuario.rol_usuario == 1 else "panel_aprendiz.html"

        return {
            "ok": True,
            "mensaje": "Inicio de sesión exitoso",
            "usuario": usuario.to_dict(),
            "rol_usuario": usuario.rol_usuario,
            "token": AuthService._generar_token(usuario),
            "redirect": redirect_url
        }

    @staticmethod
    def _verificar_contrasena(contrasena_db, contrasena):
        # Soporta hash bcrypt (usuarios creados desde modulo_aprendices), hash werkzeug o texto plano
        if not contrasena_db:
            return False
        try:
            if contrasena_db.startswith(('$2a$', '$2b$', '$2y$')):
                return has_bcrypt and bcrypt.checkpw(contrasena.encode('utf-8'), contrasena_db.encode('utf-8'))
            if contrasena_db.startswith(('scrypt:', 'pbkdf2:', 'argon2:')):
                return check_password_hash(contrasena_db, contrasena)
            return contrasena_db == contrasena
        except Exception:
            return contrasena_db == contrasena

    @staticmethod
    def _generar_token(usuario):
        # Mismo payload que el microservicio de login, para que el API Gateway acepte el token
        if not has_jwt:
            return None
        payload = {
            'correo': usuario.correo,
            'rol_usuario': usuario.rol_usuario,
            'exp': datetime.now(timezone.utc) + DURACION_SESION
        }
        return jwt.encode(payload, LLAVE_SECRETA, algorithm='HS256')
