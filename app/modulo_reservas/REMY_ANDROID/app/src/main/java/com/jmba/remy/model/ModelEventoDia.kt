package com.jmba.remy.model

data class ModelEventoDia(
    val id_evento: String? = null,
    val nombre: String? = null,
    val correo_fk: String? = null,
    val numero_personas: Int? = null,
    val fecha_inicio: String? = null,
    val franja_horaria: String? = null
)