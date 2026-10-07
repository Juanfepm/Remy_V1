package com.jmba.remy.view.menu

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelMenuDia
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MenuViewModel : ViewModel() {

    private val _listaMenu = MutableStateFlow<List<ModelMenuDia>>(emptyList())
    val listaMenu: StateFlow<List<ModelMenuDia>> = _listaMenu

    private val retrofit = Retrofit.Builder()
        .baseUrl(ConexionService.url)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ConexionService::class.java)

    fun visualiza() {
        viewModelScope.launch {
            try {
                val response = retrofit.consultaMenu()
                if (response.isSuccessful) {
                    val body = response.body()
                    Log.d("MenuViewModel", "Datos recibidos: $body")
                    _listaMenu.value = body ?: emptyList()
                } else {
                    Log.e("MenuViewModel", "Error en la respuesta: ${response.code()} ${response.message()}")
                    Log.e("MenuViewModel", "Cuerpo del error: ${response.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                Log.e("MenuViewModel", "Excepción al consultar menú", e)
            }
        }
    }
}