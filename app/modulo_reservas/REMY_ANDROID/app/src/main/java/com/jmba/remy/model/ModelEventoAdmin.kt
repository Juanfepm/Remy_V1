package com.jmba.remy.model

import kotlinx.serialization.Serializable

@Serializable
data class ModelEventoAdmin(
    val id_evento: String? = null,
    val estado: String? = null,
    val correo_fk: String? = null,
    val franja_horaria: String? = null,
    val fecha_inicio: String? = null,
    val fecha_fin: String? = null,
    val numero_personas: Int? = null,
    val experiencia: String? = null,
    val descripcion: String? = null,
    val id_menu_fk: String? = null,
    val costo_total: Int? = null,
    val tipo_servicio: String? = null,
    val asistentes: Int? = null,
    val imagen: String? = null
)
