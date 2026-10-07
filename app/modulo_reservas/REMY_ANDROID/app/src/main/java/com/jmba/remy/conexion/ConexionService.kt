package com.jmba.remy.conexion

import com.jmba.remy.model.ModelDisponibilidad
import com.jmba.remy.model.ModelEvento
import com.jmba.remy.model.ModelEventoAdmin
import com.jmba.remy.model.ModelEventoDia
import com.jmba.remy.model.ModelEventoOperacion
import com.jmba.remy.model.ModelEventosCliente
import com.jmba.remy.model.ModelExperiencia
import com.jmba.remy.model.ModelExperienciaAdmin
import com.jmba.remy.model.ModelMenu
import com.jmba.remy.model.ModelMenuDia
import com.jmba.remy.model.ModelReservaAprendiz
import com.jmba.remy.model.ModelRespuestaReserva
import com.jmba.remy.model.ModelReservaHoy
import com.jmba.remy.model.ModelUsuario
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface ConexionService {
    companion object {

        // IP para emulador: 10.0.2.2 | IP para celular físico: la del servidor XAMPP
        var url: String = "http://10.86.105.54/remy_backend/"

        // Carpeta de imágenes de menús/platos: htdocs/remy_backend/img_menu/
        val urlImagenes: String get() = url + "img_menu/"

        // Carpeta de imágenes de experiencias: htdocs/remy_backend/img_exp/
        val urlImgExperiencias: String get() = url + "img_exp/"
    }

    // Login
    @FormUrlEncoded
    @POST("login.php")
    suspend fun login(
        @Field("correo") correo: String,
        @Field("password") password: String
    ): Response<ModelUsuario>

    // Reservas
    @GET("consulta_Menus.php")
    suspend fun consultaMenus(): Response<List<ModelMenu>>

    @GET("consultaExperiencias.php")
    suspend fun consultaExperiencias(): Response<List<ModelExperiencia>>

    @GET("consulta_cupo.php")
    suspend fun consultaDisponibilidad(@Query("fecha") fecha: String): Response<ModelDisponibilidad>

    @POST("crear_evento.php")
    suspend fun insertaEvento(@Body data: ModelEvento): Response<ModelEvento>

    // Eventos y experiencias
    @GET("consultaEventosCliente.php")
    suspend fun consultaEventosCliente(): Response<ModelEventosCliente>

    @GET("consultaExperiencia.php")
    suspend fun consultaExperiencia(): Response<List<ModelExperienciaAdmin>>

    @GET("consultaEvento.php")
    suspend fun consultaEvento(): Response<List<ModelEventoAdmin>>

    @POST("insertarEvento.php")
    suspend fun insertarEvento(@Body evento: ModelEventoAdmin): Response<Any>

    @DELETE("eliminarEvento.php")
    suspend fun eliminarEvento(@Query("id") id: String): Response<Any>

    @POST("actualizarEvento.php")
    suspend fun actualizarEvento(@Body evento: ModelEventoAdmin): Response<Any>

    @POST("actualizarExperiencia.php")
    suspend fun actualizarExperiencia(@Body experiencia: ModelExperienciaAdmin): Response<Any>

    @POST("insertarExperiencia.php")
    suspend fun insertarExperiencia(@Body experiencia: ModelExperienciaAdmin): Response<Any>

    @DELETE("eliminarExperiencia.php")
    suspend fun eliminarExperiencia(@Query("id") id: String): Response<Any>

    // Operacion
    @GET(value = "listar_reservas_hoy.php")
    suspend fun ConsultaReservasHoy(): Response<List<ModelReservaHoy>>

    @GET(value = "listar_eventos.php")
    suspend fun ConsultaEventos(): Response<List<ModelEventoOperacion>>

    @GET(value = "listar_reservas_aprendiz.php")
    suspend fun consultaReservasAprendiz(): Response<List<ModelReservaAprendiz>>

    @POST(value = "actualizar_estado_reserva.php")
    suspend fun actualizarEstadoReserva(
        @Query("id_reserva") idReserva: String,
        @Query("estado")     estado   : String
    ): Response<ResponseBody>

    @GET(value = "listar_evento_id.php")
    suspend fun consultaEventoId(@Query("id_evento") idEvento: String): Response<ModelEventoOperacion>

    @POST(value = "cancelar_evento.php")
    suspend fun cancelarEvento(
        @Query("id_evento") idEvento: String,
        @Query("estado")    estado  : String
    ): Response<ResponseBody>

    @POST(value = "actualizar_evento.php")
    suspend fun actualizarEventoOperacion(
        @Query("id_evento") idEvento: String,
        @Query("numero_personas") numeroPersonas: String
    ): Response<ResponseBody>

    // Menu del dia
    @GET("consultaMenu.php")
    suspend fun consultaMenu(): Response<List<ModelMenuDia>>

    @GET("consultaeventos.php")
    suspend fun consultaEventos(): Response<List<ModelEventoDia>>

    @FormUrlEncoded
    @POST("registrarReserva.php")
    suspend fun registrarReserva(
        @Field("correo") correo: String,
        @Field("cantidad") cantidad: Int,
        @Field("total") total: Int
    ): Response<ModelRespuestaReserva>
}
