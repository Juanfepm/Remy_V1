package com.jmba.remy.view.reservas

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelExperiencia
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class ExperienciasViewModel : ViewModel() {

    // Lista de experiencias cargadas desde backend
    private val _lista = MutableStateFlow<List<ModelExperiencia>>(emptyList())
    val listaExperiencias: StateFlow<List<ModelExperiencia>> = _lista.asStateFlow()

    // Estado de visibilidad del overlay
    private val _mostrarOverlay = MutableStateFlow(false)
    val mostrarOverlay: StateFlow<Boolean> = _mostrarOverlay.asStateFlow()

    // Experiencia seleccionada por el usuario
    private val _seleccionada = MutableStateFlow<ModelExperiencia?>(null)
    val seleccionada: StateFlow<ModelExperiencia?> = _seleccionada.asStateFlow()

    fun getRetrofit(): Retrofit = Retrofit.Builder()
        .baseUrl(ConexionService.url)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    fun visualiza() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val datos = getRetrofit()
                        .create(ConexionService::class.java)
                        .consultaExperiencias()
                    if (datos.isSuccessful) {
                        _lista.value = datos.body() ?: emptyList()
                    }
                } catch (e: Exception) {
                    Log.e("remy", "Error al cargar experiencias", e)
                }
            }
        }
    }

    fun mostrarOverlay() {
        _mostrarOverlay.value = true
    }

    fun ocultarOverlay() {
        _mostrarOverlay.value = false
    }

    fun seleccionar(experiencia: ModelExperiencia) {
        _seleccionada.value = experiencia
        _mostrarOverlay.value = false
    }

    fun limpiarSeleccion() {
        _seleccionada.value = null
    }
}