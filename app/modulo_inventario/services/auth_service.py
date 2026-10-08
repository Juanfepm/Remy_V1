import bcrypt
from werkzeug.security import check_password_hash
from app.modulo_inventario.models.usuario import UsuarioModel
from app.roles import ROL_INSTRUCTOR

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

        # Verificar contraseña (bcrypt, que es lo que guardan aprendices y
        # reservas; también hash werkzeug o texto plano)
        valido = False
        if usuario.contrasena:
            try:
                if usuario.contrasena.startswith('$2'):
                    valido = bcrypt.checkpw(contrasena.encode('utf-8'), usuario.contrasena.encode('utf-8'))
                elif usuario.contrasena.startswith(('scrypt:', 'pbkdf2:', 'argon2:')):
                    valido = check_password_hash(usuario.contrasena, contrasena)
                elif usuario.contrasena == contrasena:
                    valido = True
                else:
                    # Intento de check_password_hash por si acaso
                    valido = check_password_hash(usuario.contrasena, contrasena)
            except Exception:
                valido = (usuario.contrasena == contrasena)

        if not valido:
            raise ValueError("Contraseña incorrecta")

        redirect_url = "panel_instructor.html" if usuario.rol_usuario == ROL_INSTRUCTOR else "panel_aprendiz.html"

        return {
            "ok": True,
            "mensaje": "Inicio de sesión exitoso",
            "usuario": usuario.to_dict(),
            "redirect": redirect_url
        }
