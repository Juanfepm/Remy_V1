package com.jmba.remy.model

import com.google.gson.annotations.SerializedName

data class ModelMenu(
    @SerializedName("IdMenu")      var IdMenu: String? = null,
    @SerializedName("Nombre")      var Nombre: String? = null,
    @SerializedName("TiemposMenu") var TiemposMenu: Int? = null,
    @SerializedName("Precio")      var Precio: Int? = null,
    @SerializedName("Descripcion") var Descripcion: String? = null,
    @SerializedName("ImgMenu")     var ImgMenu: String? = null
)
