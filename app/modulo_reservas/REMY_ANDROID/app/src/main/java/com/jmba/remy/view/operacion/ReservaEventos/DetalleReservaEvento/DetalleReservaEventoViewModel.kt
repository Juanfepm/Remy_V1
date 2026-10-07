package com.jmba.remy.view.operacion.ReservaEventos.DetalleReservaEvento

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelEventoOperacion
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class DetalleReservaEventoViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    val idEvento: String = checkNotNull(savedStateHandle["idEvento"])
    var data by mutableStateOf<ModelEventoOperacion?>(null)

    init {
        consultaId(idEvento)
    }

    fun getRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl(ConexionService.url)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    fun consultaId(idEvento: String) {
        viewModelScope.launch {
            try {
                val datos = withContext(Dispatchers.IO) {
                    getRetrofit().create(ConexionService::class.java)
                        .consultaEventoId(idEvento)
                }
                withContext(Dispatchers.Main) { data = datos.body() }
            } catch (e: Exception) {
            }
        }
    }

    fun cancelar(idEvento: String, onSuccess: () -> Unit, onError: () -> Unit) {
        viewModelScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    getRetrofit().create(ConexionService::class.java)
                        .cancelarEvento(idEvento, "cancelado")
                }
                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) onSuccess() else onError()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) { onError() }
            }
        }
    }

    fun editarNumeroPersonas(idEvento: String, nuevoNumero: String, onSuccess: () -> Unit, onError: () -> Unit) {
        viewModelScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    getRetrofit().create(ConexionService::class.java)
                        .actualizarEventoOperacion(idEvento, nuevoNumero)
                }
                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        val nuevoNumero = nuevoNumero.toIntOrNull() ?: data?.numeroPersonas
                        data = data?.copy(numeroPersonas = nuevoNumero)
                        onSuccess()
                    } else onError()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) { onError() }
            }
        }
    }
}
