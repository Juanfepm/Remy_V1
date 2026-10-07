package com.jmba.remy.view.operacion.ReservaAprendiz

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelReservaAprendiz
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class ReservaAprendizViewModel : ViewModel() {

    private val _lista = MutableStateFlow<List<ModelReservaAprendiz>>(emptyList())
    val listaReservas: StateFlow<List<ModelReservaAprendiz>> = _lista.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    fun getRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl(ConexionService.url)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    fun visualiza() {
        viewModelScope.launch {
            _isRefreshing.value = true
            try {
                val response = withContext(Dispatchers.IO) {
                    getRetrofit().create(ConexionService::class.java).consultaReservasAprendiz()
                }
                if (response.isSuccessful) {
                    _lista.value = response.body() ?: emptyList()
                } else {
                    Log.e("dap", "Error: ${response.code()} - ${response.message()}")
                }
            } catch (e: Exception) {
                Log.e("dap", "No se pudo conectar al backend", e)
            } finally {
                _isRefreshing.value = false
            }
        }
    }

    fun actualizarEstado(idReserva: String, nuevoEstado: String) {
        val listaActual = _lista.value
        val index = listaActual.indexOfFirst { it.idReserva == idReserva }
        if (index != -1) {
            val listaNueva = listaActual.toMutableList()
            listaNueva[index] = listaActual[index].copy(estado = nuevoEstado)
            _lista.value = listaNueva
        }

        viewModelScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    getRetrofit().create(ConexionService::class.java)
                        .actualizarEstadoReserva(idReserva, nuevoEstado)
                }
                if (!response.isSuccessful) {
                    Log.e("dap", "Error actualizando estado en servidor: ${response.code()}")
                    visualiza()
                }
            } catch (e: Exception) {
                Log.e("dap", "Error de conexión al actualizar", e)
                visualiza()
            }
        }
    }
}
