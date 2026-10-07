package com.jmba.remy.view.admin_evento

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelEventoAdmin
import com.jmba.remy.model.ModelEventosCliente
import com.jmba.remy.model.ModelExperienciaAdmin
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class EventoViewModel : ViewModel() {
    private val _lista = MutableStateFlow<List<ModelEventoAdmin>>(emptyList())
    val listaEvento: StateFlow<List<ModelEventoAdmin>> = _lista.asStateFlow()
    private val _listaExp = MutableStateFlow<List<ModelExperienciaAdmin>>(emptyList())
    val listaExperiencia: StateFlow<List<ModelExperienciaAdmin>> = _listaExp.asStateFlow()
    private val _eventosCliente = MutableStateFlow<ModelEventosCliente>(ModelEventosCliente())
    val eventosCliente: StateFlow<ModelEventosCliente> = _eventosCliente.asStateFlow()
    fun getRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl(ConexionService.url)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    fun visualizaEventosCliente() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val respuesta = getRetrofit().create(ConexionService::class.java).consultaEventosCliente()
                    if (respuesta.isSuccessful) {
                        _eventosCliente.value = respuesta.body() ?: ModelEventosCliente()
                    }
                } catch (e: Exception) {
                    Log.e("dap", "Error eventos cliente: ${e.message}")
                }
            }
        }
    }
    fun visualizaExperiencias() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val respuesta = getRetrofit().create(ConexionService::class.java).consultaExperiencia()
                    if (respuesta.isSuccessful) {
                        _listaExp.value = respuesta.body() ?: emptyList()
                    } else {
                        Log.e("dap", "Error en la respuesta del servidor")
                    }
                } catch (e: Exception) {
                    Log.e("dap", "Error de conexión: ${e.message}")
                }
            }
        }
    }

    fun visualiza() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val datos = getRetrofit().create(ConexionService::class.java).consultaEvento()
                    if (datos.isSuccessful) {
                        _lista.value = datos.body() ?: emptyList()
                    } else {
                        Log.e("dap", "Error: No se encontró información de eventos")
                    }
                } catch (e: Exception) {
                    Log.e("dap", "No se pudo conectar al backend", e)
                }
            }
        }
    }

    fun eliminar(id: String) {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val respuesta = getRetrofit().create(ConexionService::class.java).eliminarEvento(id)
                    if (respuesta.isSuccessful) {
                        visualiza()
                    }
                } catch (e: Exception) {
                    Log.e("dap", "Error al eliminar", e)
                }
            }
        }
    }

    fun eliminarExp(id: String) {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val respuesta = getRetrofit().create(ConexionService::class.java).eliminarExperiencia(id)
                    if (respuesta.isSuccessful) {
                        visualizaExperiencias()
                    }
                } catch (e: Exception) {
                    Log.e("dap", "Error al eliminar experiencia", e)
                }
            }
        }
    }

    fun actualizar(evento: ModelEventoAdmin) {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val respuesta = getRetrofit().create(ConexionService::class.java).actualizarEvento(evento)
                    if (respuesta.isSuccessful) {
                        visualiza()
                    }
                } catch (e: Exception) {
                    Log.e("dap", "Error al actualizar", e)
                }
            }
        }
    }

    fun insertar(evento: ModelEventoAdmin) {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val respuesta = getRetrofit().create(ConexionService::class.java).insertarEvento(evento)
                    if (respuesta.isSuccessful) {
                        visualiza()
                    }
                } catch (e: Exception) {
                    Log.e("dap", "Error al insertar", e)
                }
            }
        }
    }

    fun actualizarExp(experiencia: ModelExperienciaAdmin) {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val respuesta = getRetrofit().create(ConexionService::class.java).actualizarExperiencia(experiencia)
                    if (respuesta.isSuccessful) {
                        visualizaExperiencias()
                    }
                } catch (e: Exception) {
                    Log.e("dap", "Error al actualizar experiencia", e)
                }
            }
        }
    }

    fun insertarExp(experiencia: ModelExperienciaAdmin) {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val respuesta = getRetrofit().create(ConexionService::class.java).insertarExperiencia(experiencia)
                    if (respuesta.isSuccessful) {
                        visualizaExperiencias()
                    }
                } catch (e: Exception) {
                    Log.e("dap", "Error al insertar experiencia", e)
                }
            }
        }
    }
}