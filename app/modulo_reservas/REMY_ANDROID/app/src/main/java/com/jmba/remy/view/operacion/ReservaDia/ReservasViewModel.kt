package com.jmba.remy.view.operacion.ReservaDia

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelReservaHoy
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class ReservasViewModel : ViewModel() {

    private val _lista = MutableStateFlow<List<ModelReservaHoy>>(emptyList())
    val listaReservas: StateFlow<List<ModelReservaHoy>> = _lista.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    fun getRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl(ConexionService.Companion.url)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    fun visualiza() {
        viewModelScope.launch {
            _isRefreshing.value = true
            try {
                val response = withContext(Dispatchers.IO) {
                    getRetrofit().create(ConexionService::class.java).ConsultaReservasHoy()
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
}