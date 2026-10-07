from flask import Flask, jsonify, request
from flask_restful import Resource, Api
import os


SMTP_HOST = os.environ.get("REMY_SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("REMY_SMTP_PORT", 587))


REMITENTE = os.environ.get("REMY_CORREO_REMITENTE", "")
PASSWORD = os.environ.get("REMY_CORREO_PASSWORD", "")


PUERTO = int(os.environ.get("REMY_CORREO_PUERTO", 5090))


def hay_credenciales():
    return REMITENTE != "" and PASSWORD != ""


def falta_configuracion():
    return ("Faltan las credenciales del correo. Antes de arrancar el micro hay "
            "que exportar REMY_CORREO_REMITENTE y REMY_CORREO_PASSWORD "
            "(ver README.md).")
