import subprocess
import sys
import time

# Lista de microservicios o scripts relacionados con el módulo de platos
# Puedes ajustar los nombres o puertos según los servicios que maneje tu módulo
SERVICIOS = [
    {"nombre": "App Principal Aprendices", "comando": [sys.executable, "app/modulo_aprendices/principal.py"]},
    {"nombre": "MicroServicio Api Gateway", "comando": [sys.executable, "app/modulo_aprendices/services/Api_gateway.py"]},
    {"nombre": "MicroServicio Asignar Liderazgo", "comando": [sys.executable, "app/modulo_aprendices/services/asignarLiderazgo/app.py"]},
    {"nombre": "MicroServicio Carga Masiva Aprendices", "comando": [sys.executable, "app/modulo_aprendices/services/cargaMasivaAprendices/app.py"]},
    {"nombre": "MicroServicio Dashboard", "comando": [sys.executable, "app/modulo_aprendices/services/dashboard/app.py"]},
    {"nombre": "MicroServicio Login", "comando": [sys.executable, "app/modulo_aprendices/services/login/app.py"]},
    {"nombre": "MicroServicio Usuarios", "comando": [sys.executable, "app/modulo_aprendices/services/usuarios/app.py"]},
]

procesos = []

def iniciar_servicios():
    print("=== INICIANDO MICROSERVICIOS DEL MÓDULO DE APRENDICES ===")
    try:
        for servicio in SERVICIOS:
            print(f"[+] Iniciando: {servicio['nombre']}...")
            p = subprocess.Popen(servicio["comando"])
            procesos.append(p)
            time.sleep(1) # Pequeña pausa entre servicios

        print("\n Todos los servicios del módulo de aprendices han sido lanzados.")
        print("Presiona Ctrl + C en esta terminal para detenerlos todos a la vez.\n")

        # Mantener el script principal vivo esperando los procesos
        for p in procesos:
            p.wait()

    except KeyboardInterrupt:
        print("\n[!] Deteniendo todos los microservicios...")
        for p in procesos:
            p.terminate()
            p.wait()
        print(" Todos los servicios se han detenido correctamente.")

if __name__ == "__main__":
    iniciar_servicios()