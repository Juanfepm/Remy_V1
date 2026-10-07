package com.jmba.remy.model

import kotlinx.serialization.Serializable


@Serializable
data class ModelEventoOperacion(
    val idEvento        : String? = "",
    val nombreEvento     : String? = "",
    val correo           : String? = "",
    val numeroPersonas   : Int? = 0,
    val total            : Int? = 0,
    val estado           : String? = "",
    val fechaInicio       : String? = ""
) {
    val totalFormateado: String get() = "%,d".format(total ?: 0).replace(",", ".")
}