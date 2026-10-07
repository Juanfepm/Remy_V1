package com.jmba.remy.model

import com.google.gson.annotations.SerializedName

data class ModelRespuestaReserva(
    @SerializedName("ok")            val ok: Boolean = false,
    @SerializedName("idReserva")     val idReserva: Int? = null,
    @SerializedName("cantidad")      val cantidad: Int? = null,
    @SerializedName("mensaje")       val mensaje: String? = null,
    @SerializedName("correoEnviado") val correoEnviado: Boolean = false,
    @SerializedName("correoDetalle") val correoDetalle: String? = null
)
