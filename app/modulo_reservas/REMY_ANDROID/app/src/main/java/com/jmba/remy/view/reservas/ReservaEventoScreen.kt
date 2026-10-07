package com.jmba.remy.view.reservas

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBackIosNew
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.jmba.remy.R
import com.jmba.remy.util.esCorreoInstitucional
import com.jmba.remy.util.normalizarCorreo
import com.jmba.remy.model.ModelEvento
import java.text.NumberFormat
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

private val ColorPrimario   = Color(0xFF00304D)
private val ColorVerdeExp   = Color(0xFF2E7D32)
private val ColorVerdeFondo = Color(0xFFE8F5E9)
private val ColorFondo      = Color(0xFFF5F5F5)
private val ColorError      = Color(0xFFC62828)
private val ColorErrorFondo = Color(0xFFFDECEA)

// Reglas de negocio del evento
private const val MIN_PERSONAS = 20
private const val MAX_PERSONAS = 40
private const val DIAS_ANTICIPACION = 8L

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReservaEventoScreen(
    idMenu: String,
    precioMenu: Int,
    experiencia: String,
    precioExperiencia: Int = 0,
    viewModelReserva: ReservaEventoViewModel = viewModel(),
    onGoCerrar: () -> Unit,
    onReservaCreada: () -> Unit
) {
    val disponible by viewModelReserva.disponible.collectAsStateWithLifecycle()
    val guardando by viewModelReserva.guardando.collectAsStateWithLifecycle()
    val context = LocalContext.current

    val fechaMinima = remember { LocalDate.now().plusDays(DIAS_ANTICIPACION) }

    var fechaBase by remember { mutableStateOf(fechaMinima) }
    var fechaSeleccionada by remember { mutableStateOf(fechaMinima) }

    val horasDisponibles = remember {
        listOf(
            R.string.res_hora_11am to "11:00",
            R.string.res_hora_12pm to "12:00",
            R.string.res_hora_1pm  to "13:00",
            R.string.res_hora_2pm  to "14:00"
        )
    }
    var horaSeleccionada by remember { mutableStateOf(horasDisponibles[1]) }
    var numeroPersonas by remember { mutableIntStateOf(MIN_PERSONAS) }
    var correo by remember { mutableStateOf("") }

    val diasVisibles = remember(fechaBase) { (0..3).map { fechaBase.plusDays(it.toLong()) } }

    LaunchedEffect(fechaSeleccionada) {
        viewModelReserva.consultarDisponibilidad(fechaSeleccionada.format(DateTimeFormatter.ISO_LOCAL_DATE))
    }

    val total = (precioMenu * numeroPersonas) + precioExperiencia

    val correoValido = esCorreoInstitucional(correo)
    val puedeReservar = disponible && !guardando && correoValido

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.titulo), color = Color.White, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ColorPrimario)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(ColorFondo)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { onGoCerrar() }
            ) {
                Icon(
                    Icons.Default.ArrowBackIosNew,
                    contentDescription = stringResource(R.string.volver),
                    tint = ColorVerdeExp,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(Modifier.width(6.dp))
                Text(
                    stringResource(R.string.res_completa_datos),
                    color = ColorVerdeExp,
                    fontSize = 14.sp
                )
            }

            Spacer(Modifier.height(12.dp))

            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(20.dp)) {

                    // Día
                    SeccionTitulo(Icons.Default.CalendarMonth, stringResource(R.string.res_pregunta_dia))
                    Spacer(Modifier.height(4.dp))
                    Text(
                        stringResource(R.string.res_minimo_dias, DIAS_ANTICIPACION.toInt()),
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                    Spacer(Modifier.height(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                        IconButton(
                            onClick = { fechaBase = fechaBase.minusDays(1) },
                            enabled = fechaBase > fechaMinima
                        ) {
                            Icon(
                                Icons.Default.ChevronLeft,
                                contentDescription = stringResource(R.string.res_dias_anteriores),
                                tint = if (fechaBase > fechaMinima) Color.Black else Color.LightGray
                            )
                        }
                        Row(
                            modifier = Modifier
                                .weight(1f)
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            diasVisibles.forEach { dia ->
                                DiaCard(
                                    dia = dia,
                                    seleccionado = dia == fechaSeleccionada,
                                    onClick = { fechaSeleccionada = dia }
                                )
                            }
                        }
                        IconButton(onClick = { fechaBase = fechaBase.plusDays(1) }) {
                            Icon(Icons.Default.ChevronRight, contentDescription = stringResource(R.string.res_dias_siguientes))
                        }
                    }

                    if (!disponible) {
                        Spacer(Modifier.height(10.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(ColorErrorFondo)
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.ErrorOutline,
                                contentDescription = null,
                                tint = ColorError,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                stringResource(R.string.res_dia_ocupado),
                                fontSize = 12.sp,
                                color = ColorError
                            )
                        }
                    }

                    Spacer(Modifier.height(20.dp))

                    // Hora
                    SeccionTitulo(Icons.Default.Schedule, stringResource(R.string.res_selecciona_hora))
                    Spacer(Modifier.height(12.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        horasDisponibles.forEach { hora ->
                            HoraChip(
                                hora = stringResource(hora.first),
                                seleccionada = hora == horaSeleccionada,
                                onClick = { horaSeleccionada = hora }
                            )
                        }
                    }

                    Spacer(Modifier.height(20.dp))

                    // Número de personas (20 a 40)
                    SeccionTitulo(Icons.Default.Groups, stringResource(R.string.res_pregunta_personas))
                    Spacer(Modifier.height(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = { if (numeroPersonas > MIN_PERSONAS) numeroPersonas-- },
                            enabled = numeroPersonas > MIN_PERSONAS,
                            modifier = Modifier
                                .size(36.dp)
                                .border(1.dp, Color.LightGray, CircleShape)
                        ) { Icon(Icons.Default.Remove, contentDescription = stringResource(R.string.res_restar_persona)) }

                        Text(
                            numeroPersonas.toString(),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )

                        IconButton(
                            onClick = { if (numeroPersonas < MAX_PERSONAS) numeroPersonas++ },
                            enabled = numeroPersonas < MAX_PERSONAS,
                            modifier = Modifier
                                .size(36.dp)
                                .border(1.dp, Color.LightGray, CircleShape)
                        ) { Icon(Icons.Default.Add, contentDescription = stringResource(R.string.res_sumar_persona)) }

                        Spacer(Modifier.width(12.dp))

                        Column {
                            Text(stringResource(R.string.res_rango_permitido), fontSize = 12.sp, color = Color.Gray)
                            Text(stringResource(R.string.res_rango_personas, MIN_PERSONAS, MAX_PERSONAS), fontSize = 12.sp, fontWeight = FontWeight.Medium)
                        }
                    }

                    Spacer(Modifier.height(20.dp))

                    // Correo institucional
                    SeccionTitulo(Icons.Default.Person, stringResource(R.string.res_correo_institucional))
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = correo,
                        onValueChange = { correo = it },
                        placeholder = { Text(stringResource(R.string.placeholderCorreo)) },
                        singleLine = true,
                        isError = correo.isNotBlank() && !correoValido,
                        supportingText = { Text(stringResource(R.string.valid_correo)) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // Resumen de la reserva
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = ColorVerdeFondo),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = ColorVerdeExp,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(stringResource(R.string.res_tu_reserva), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(stringResource(R.string.res_total), fontSize = 13.sp, color = Color.Gray)
                    }
                    Text(formatearPrecio(total), fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
            }

            Spacer(Modifier.height(16.dp))

            // Botón de confirmación
            Button(
                onClick = {
                    if (correo.isBlank()) {
                        Toast.makeText(context, context.getString(R.string.res_toast_ingresa_correo), Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    if (!correoValido) {
                        Toast.makeText(context, context.getString(R.string.correo_no_institucional), Toast.LENGTH_LONG).show()
                        return@Button
                    }
                    if (!disponible) {
                        Toast.makeText(context, context.getString(R.string.res_toast_dia_ocupado), Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    val horaCodigo = LocalTime.parse(horaSeleccionada.second)
                    val evento = ModelEvento(
                        CorreoFk = normalizarCorreo(correo),
                        FranjaHoraria = horaSeleccionada.second,
                        FechaInicio = fechaSeleccionada
                            .atTime(horaCodigo)
                            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                        NumeroPersonas = numeroPersonas,
                        Experiencia = experiencia.ifBlank { null },
                        IdMenuFk = idMenu,
                        TipoServicio = "evento",
                        Asistentes = numeroPersonas,
                        CostoTotal = total
                    )
                    viewModelReserva.crearReserva(
                        context,
                        evento,
                        onSuccess = {
                            Toast.makeText(context, context.getString(R.string.res_toast_reserva_creada), Toast.LENGTH_SHORT).show()
                            onReservaCreada()
                        },
                        onError = { mensaje ->
                            Toast.makeText(context, mensaje, Toast.LENGTH_SHORT).show()
                            viewModelReserva.consultarDisponibilidad(
                                fechaSeleccionada.format(DateTimeFormatter.ISO_LOCAL_DATE)
                            )
                        }
                    )
                },
                enabled = puedeReservar,
                colors = ButtonDefaults.buttonColors(
                    containerColor = ColorVerdeExp,
                    disabledContainerColor = Color(0xFFBDBDBD)
                ),
                shape = RoundedCornerShape(28.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Text(stringResource(if (guardando) R.string.res_guardando else R.string.res_reservar_evento), color = Color.White, fontSize = 16.sp)
            }
        }
    }
}

@Composable
private fun SeccionTitulo(icon: ImageVector, texto: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, tint = ColorVerdeExp, modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(6.dp))
        Text(texto, fontWeight = FontWeight.Bold, fontSize = 14.sp)
    }
}

@Composable
private fun DiaCard(dia: LocalDate, seleccionado: Boolean, onClick: () -> Unit) {
    val fondo = if (seleccionado) ColorVerdeExp else Color.White
    val texto = if (seleccionado) Color.White else Color.Black
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(fondo)
            .border(1.dp, if (seleccionado) ColorVerdeExp else Color.LightGray, RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(vertical = 10.dp, horizontal = 12.dp)
    ) {
        Text(
            dia.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale("es")).replaceFirstChar { it.uppercase() },
            fontSize = 11.sp,
            color = texto
        )
        Text(dia.dayOfMonth.toString(), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = texto)
        Text(
            dia.month.getDisplayName(TextStyle.SHORT, Locale("es")).uppercase(),
            fontSize = 9.sp,
            color = texto
        )
    }
}

@Composable
private fun HoraChip(hora: String, seleccionada: Boolean, onClick: () -> Unit) {
    val borde = if (seleccionada) ColorVerdeExp else Color.LightGray
    val fondo = if (seleccionada) ColorVerdeFondo else Color.White
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(fondo)
            .border(1.dp, borde, RoundedCornerShape(10.dp))
            .clickable { onClick() }
            .padding(vertical = 10.dp, horizontal = 14.dp)
    ) {
        Text(hora, fontSize = 13.sp, color = if (seleccionada) ColorVerdeExp else Color.Black)
    }
}

@Composable
private fun formatearPrecio(valor: Int): String {
    val formato = NumberFormat.getNumberInstance(Locale("es", "CO"))
    return stringResource(R.string.formato_precio, formato.format(valor))
}
