from app.db import obtener_conexion
import bcrypt

class Login:

    def login(self, correo, contrasena):

        if not correo or not contrasena:
            return {"status": "error","message": "Debe ingresar correo y contraseña"}

        mi_db = None
        mi_cursor = None
        try:
            mi_db = obtener_conexion()
            mi_cursor = mi_db.cursor()

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
        except Exception as e:
            return {"status": "error", "message": f"Error de base de datos: {str(e)}"}
        finally:
            if mi_cursor:
                mi_cursor.close()
            if mi_db:
                mi_db.close()


mi_login = Login()