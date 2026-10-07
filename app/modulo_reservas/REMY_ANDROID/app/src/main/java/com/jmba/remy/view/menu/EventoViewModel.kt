package com.jmba.remy.view.menu

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jmba.remy.R
import com.jmba.remy.conexion.ConexionService
import com.google.gson.Gson
import com.jmba.remy.model.ModelEventoDia
import com.jmba.remy.model.ModelRespuestaReserva
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class EventoViewModel : ViewModel() {

    private val _listaEvento = MutableStateFlow<List<ModelEventoDia>>(emptyList())
    val listaEvento: StateFlow<List<ModelEventoDia>> = _listaEvento

    private val retrofit = Retrofit.Builder()
        .baseUrl(ConexionService.url)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ConexionService::class.java)

    fun visualiza() {
        viewModelScope.launch {
            try {
                val response = retrofit.consultaEventos()
                if (response.isSuccessful) {
                    _listaEvento.value = response.body() ?: emptyList()
                } else {
                    Log.e("EventoViewModel", "Error en la respuesta: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("EventoViewModel", "Excepción al consultar eventos", e)
            }
        }
    }

    fun registrarReserva(context: Context, correo: String, cantidad: Int, total: Int) {
        viewModelScope.launch {
            try {
                val response = retrofit.registrarReserva(correo, cantidad, total)

                val cuerpo = if (response.isSuccessful) {
                    response.body()
                } else {
                    leerError(response.errorBody()?.string())
                }

                val mensaje = cuerpo?.mensaje
                    ?: context.getString(
                        if (response.isSuccessful) R.string.menu_reserva_exitosa
                        else R.string.menu_error_desconocido
                    )

                Toast.makeText(context, mensaje, Toast.LENGTH_SHORT).show()
                Log.d("EventoViewModel", "Respuesta servidor: ${response.code()} $cuerpo")
            } catch (e: Exception) {
                Log.e("EventoViewModel", "Error de conexión", e)
                Toast.makeText(context, context.getString(R.string.menu_error_red, e.message ?: ""), Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun leerError(cuerpo: String?): ModelRespuestaReserva? {
        if (cuerpo.isNullOrBlank()) return null
        return try {
            Gson().fromJson(cuerpo, ModelRespuestaReserva::class.java)
        } catch (e: Exception) {
            Log.e("EventoViewModel", "El error del servidor no venía en JSON: $cuerpo", e)
            null
        }
    }
}