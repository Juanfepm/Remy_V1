import mysql.connector
from mysql.connector import Error

class ConexionService:
    def __init__(self):
        self.host = "localhost"
        self.user = "root"
        self.password = ""
        self.database = "remy"
        self.port = 3306

    def obtener_conexion(self):
        try:
            conexion = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port
            )
            if conexion.is_connected():
                return conexion
        except Error as e:
            print(f"Error al conectar a la base de datos MySQL: {e}")
            return None

    def cerrar_conexion(self, conexion):
        if conexion and conexion.is_connected():
            conexion.close()