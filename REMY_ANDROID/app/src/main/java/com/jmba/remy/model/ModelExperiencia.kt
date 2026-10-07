package com.jmba.remy.model

import com.google.gson.annotations.SerializedName

data class ModelExperiencia(
    @SerializedName("IdExperiencia")  var IdExperiencia: String? = null,
    @SerializedName("Nombre")         var Nombre: String? = null,
    @SerializedName("Descripcion")    var Descripcion: String? = null,
    @SerializedName("Precio")         var Precio: Int? = null,
    @SerializedName("ImgExperiencia") var ImgExperiencia: String? = null
)
