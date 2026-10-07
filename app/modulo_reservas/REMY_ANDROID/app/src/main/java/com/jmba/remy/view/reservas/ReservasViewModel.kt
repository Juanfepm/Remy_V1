package com.jmba.remy.view.reservas

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelMenu
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class ReservasViewModel : ViewModel() {

    private val _listaMenus = MutableStateFlow<List<ModelMenu>>(emptyList())
    val listaMenus: StateFlow<List<ModelMenu>> = _listaMenus.asStateFlow()

    fun getRetrofit(): Retrofit = Retrofit.Builder()
        .baseUrl(ConexionService.url)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    // Consulta todos los menús desde la base de datos (vía PHP)
    fun visualiza() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val datos = getRetrofit()
                        .create(ConexionService::class.java)
                        .consultaMenus()
                    if (datos.isSuccessful) {
                        _listaMenus.value = datos.body() ?: emptyList()
                    }
                } catch (e: Exception) {
                    Log.e("dap", "No se pudo conectar al backend", e)
                }
            }
        }
    }
}