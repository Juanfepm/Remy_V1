import subprocess
import sys
import time

# Lista de microservicios o scripts relacionados con el módulo de platos
# Puedes ajustar los nombres o puertos según los servicios que maneje tu módulo
SERVICIOS = [
    {"nombre": "App Principal Platos", "comando": [sys.executable, "app/modulo_platos/app.py"]},
    {"nombre": "MicroServicio Platos", "comando": [sys.executable, "app/modulo_platos/services/platos/app.py"]},
    {"nombre": "MicroServicio Platos", "comando": [sys.executable, "app/modulo_platos/services/menus/app.py"]}
]

procesos = []

def iniciar_servicios():
    print("=== INICIANDO MICROSERVICIOS DEL MÓDULO DE PLATOS ===")
    try:
        for servicio in SERVICIOS:
            print(f"[+] Iniciando: {servicio['nombre']}...")
            p = subprocess.Popen(servicio["comando"])
            procesos.append(p)
            time.sleep(1) # Pequeña pausa entre servicios

        print("\n Todos los servicios del módulo de platos han sido lanzados.")
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