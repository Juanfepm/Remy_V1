package com.jmba.remy.model

import kotlinx.serialization.Serializable

@Serializable
data class ModelEvento(
    var IdEvento: String? = null,
    var Estado: String? = null,
    var CorreoFk: String? = null,
    var FranjaHoraria: String? = null,
    var FechaInicio: String? = null,
    var FechaFin: String? = null,
    var NumeroPersonas: Int? = null,
    var Experiencia: String? = null,
    var IdMenuFk: String? = null,
    var TipoServicio: String? = null,
    var Asistentes: Int? = null,
    var CostoTotal: Int? = null
)

@Serializable
data class ModelDisponibilidad(
    var Fecha: String? = null,
    var Disponible: Boolean? = null
)
