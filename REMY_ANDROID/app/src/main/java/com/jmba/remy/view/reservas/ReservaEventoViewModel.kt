package com.jmba.remy.view.reservas

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jmba.remy.R
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelEvento
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class ReservaEventoViewModel : ViewModel() {

    private val _disponible = MutableStateFlow(true)
    val disponible: StateFlow<Boolean> = _disponible.asStateFlow()

    private val _consultando = MutableStateFlow(false)
    val consultando: StateFlow<Boolean> = _consultando.asStateFlow()

    private val _guardando = MutableStateFlow(false)
    val guardando: StateFlow<Boolean> = _guardando.asStateFlow()

    fun getRetrofit(): Retrofit = Retrofit.Builder()
        .baseUrl(ConexionService.url)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    fun consultarDisponibilidad(fecha: String) {
        viewModelScope.launch {
            _consultando.value = true
            withContext(Dispatchers.IO) {
                try {
                    val datos = getRetrofit().create(ConexionService::class.java).consultaDisponibilidad(fecha)
                    withContext(Dispatchers.Main) {
                        _disponible.value = if (datos.isSuccessful) {
                            datos.body()?.Disponible ?: true
                        } else {
                            true
                        }
                        _consultando.value = false
                    }
                } catch (e: Exception) {
                    Log.e("dap", "No se pudo consultar la disponibilidad", e)
                    withContext(Dispatchers.Main) {
                        _disponible.value = true
                        _consultando.value = false
                    }
                }
            }
        }
    }

    fun crearReserva(context: Context, evento: ModelEvento, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            _guardando.value = true
            try {
                val respuesta = withContext(Dispatchers.IO) {
                    getRetrofit().create(ConexionService::class.java).insertaEvento(evento)
                }
                _guardando.value = false
                if (respuesta.isSuccessful) {
                    withContext(Dispatchers.Main) { onSuccess() }
                } else {
                    withContext(Dispatchers.Main) {
                        onError(context.getString(R.string.res_error_crear_reserva, respuesta.code()))
                    }
                }
            } catch (e: Exception) {
                Log.e("dap", "No se pudo crear la reserva", e)
                _guardando.value = false
                withContext(Dispatchers.Main) { onError(context.getString(R.string.res_error_conexion)) }
            }
        }
    }
}
