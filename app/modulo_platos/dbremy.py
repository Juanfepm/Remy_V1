import mysql.connector

servername = "localhost"
username = "root"
password = ""
dbname = "remy"

conn = mysql.connector.connect(
    host=servername,
    user=username,
    password=password,
    database=dbname
)

cursor = conn.cursor()
