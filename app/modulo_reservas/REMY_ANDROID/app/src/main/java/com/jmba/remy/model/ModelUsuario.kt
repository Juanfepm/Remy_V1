package com.jmba.remy.model

import com.google.gson.annotations.SerializedName

data class ModelUsuario(
    @SerializedName("ok")        val ok: Boolean = false,
    @SerializedName("idUsuario") val idUsuario: String? = null,
    @SerializedName("nombre")    val nombre: String? = null,
    @SerializedName("correo")    val correo: String? = null,
    @SerializedName("rol")       val rol: Int = 0,
    @SerializedName("rolNombre") val rolNombre: String? = null,
    @SerializedName("ficha")     val ficha: String? = null,
    @SerializedName("mensaje")   val mensaje: String? = null
)
