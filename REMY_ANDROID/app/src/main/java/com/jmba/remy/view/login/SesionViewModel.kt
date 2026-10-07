package com.jmba.remy.view.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelUsuario
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class SesionViewModel : ViewModel() {

    private val _usuario = MutableStateFlow<ModelUsuario?>(null)
    val usuario: StateFlow<ModelUsuario?> = _usuario

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    private val _cargando = MutableStateFlow(false)
    val cargando: StateFlow<Boolean> = _cargando

    private val retrofit = Retrofit.Builder()
        .baseUrl(ConexionService.url)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ConexionService::class.java)

    val esInstructor: Boolean get() = _usuario.value?.rol == 1
    val esAprendiz: Boolean get() = _usuario.value?.rol == 2
    val haySesion: Boolean get() = _usuario.value != null

    fun entrar(correo: String, password: String, alEntrar: (ModelUsuario) -> Unit) {
        _error.value = null
        _cargando.value = true
        viewModelScope.launch {
            try {
                val resp = retrofit.login(correo.trim().lowercase(), password)
                val cuerpo = resp.body()
                if (resp.isSuccessful && cuerpo != null && cuerpo.ok) {
                    _usuario.value = cuerpo
                    _cargando.value = false
                    alEntrar(cuerpo)
                } else {
                    val msg = cuerpo?.mensaje ?: leerMensajeError(resp.errorBody()?.string())
                    _error.value = msg ?: "No se pudo iniciar sesión."
                    _cargando.value = false
                }
            } catch (e: Exception) {
                _error.value = "No se pudo conectar con el servidor."
                _cargando.value = false
            }
        }
    }

    fun limpiarError() { _error.value = null }

    fun salir() {
        _usuario.value = null
        _error.value = null
    }

    private fun leerMensajeError(cuerpo: String?): String? {
        if (cuerpo.isNullOrBlank()) return null
        return try { Gson().fromJson(cuerpo, ModelUsuario::class.java)?.mensaje } catch (e: Exception) { null }
    }
}
