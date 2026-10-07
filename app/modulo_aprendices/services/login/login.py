
from conexiones import *
import bcrypt

class Login:

    def login(self, correo, contrasena):

        if not correo or not contrasena:
            return {"status": "error","message": "Debe ingresar correo y contraseña"}

        sql = """SELECT rol_usuario, contrasena FROM usuarios WHERE correo=%s AND estado='activo'"""

        mi_cursor.execute(sql, (correo,))
        resultado = mi_cursor.fetchone()

        if resultado is None:
            return {"status": "error","message": "Usuario no encontrado o inactivo"}

        rol_db, contrasena_db = resultado

        if bcrypt.checkpw(contrasena.encode("utf-8"),contrasena_db.encode("utf-8")):
            return {"status": "success","rol_usuario": rol_db,"message": "Inicio de sesión exitoso - Bienvenido"}
        else:
            return {"status": "error","message": "Las credenciales ingresadas son incorrectas"}


mi_login = Login