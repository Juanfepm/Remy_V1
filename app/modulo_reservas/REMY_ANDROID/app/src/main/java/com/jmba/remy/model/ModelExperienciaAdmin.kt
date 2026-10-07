package com.jmba.remy.model

import kotlinx.serialization.Serializable

@Serializable
data class ModelExperienciaAdmin(
    val id_experiencia: String? = null,
    val nombre: String? = null,
    val descripcion: String? = null,
    val precio: Int? = null,
    val img_experiencia: String? = null,
    val estado: String? = null
)