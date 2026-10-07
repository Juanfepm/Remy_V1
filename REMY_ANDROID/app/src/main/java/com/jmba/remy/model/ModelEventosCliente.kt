package com.jmba.remy.model

import kotlinx.serialization.Serializable

@Serializable
data class ModelEventosCliente(
    val disponible_hoy: ModelEventoAdmin? = null,
    val proximos: List<ModelEventoAdmin> = emptyList()
)
