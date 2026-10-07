package com.jmba.remy.util

private val PATRON_CORREO_INSTITUCIONAL = Regex(
    "^[A-Za-z0-9._%+-]+@(soy\\.sena\\.edu\\.co|sena\\.edu\\.co)$",
    RegexOption.IGNORE_CASE
)

fun esCorreoInstitucional(correo: String): Boolean =
    PATRON_CORREO_INSTITUCIONAL.matches(correo.trim())

fun normalizarCorreo(correo: String): String = correo.trim().lowercase()
