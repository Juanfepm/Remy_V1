package com.jmba.remy.model

import com.google.gson.annotations.SerializedName
import kotlinx.serialization.Serializable

data class ModelReservaAprendiz(
    val idReserva     : String? = "",
    val correo        : String? = "",
    val cantMenus     : Int?    = 0,
    val estado        : String? = "",
    val precioMenu    : Int?    = 0,
    val total         : Int?    = 0
) {
    val totalCalculado: Int get() = if ((total ?: 0) > 0) total!! else (cantMenus ?: 0) * (precioMenu ?: 0)
    val totalFormateado: String get() = "%,d".format(totalCalculado).replace(",", ".")
}