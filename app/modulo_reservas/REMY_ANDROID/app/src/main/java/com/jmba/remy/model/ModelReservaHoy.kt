package com.jmba.remy.model

import kotlinx.serialization.Serializable

@Serializable
data class ModelReservaHoy (
    val idReserva   : String? = "",
    val correo      : String? = "",
    val cantMenus   : Int? = 0,
    val fechaReserva: String? = "",
    val estado      : String? = "",
    val precioMenu  : Int? = 0
) {
    val total: Int get() = (cantMenus ?: 0) * (precioMenu ?: 0)
    val totalFormateado: String get() = "%,d".format(total).replace(",", ".")
}
