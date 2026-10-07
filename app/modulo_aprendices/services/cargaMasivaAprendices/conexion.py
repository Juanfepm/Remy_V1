import mysql.connector

mi_db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="remy"
)


mi_cursor = mi_db.cursor()