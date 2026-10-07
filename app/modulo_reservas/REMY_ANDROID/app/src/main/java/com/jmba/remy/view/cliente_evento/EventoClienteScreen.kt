package com.jmba.remy.view.cliente_evento

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.jmba.remy.R
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelEventoAdmin
import com.jmba.remy.view.admin_evento.EventoViewModel
import java.text.SimpleDateFormat
import java.util.*

val ColorVerdeSena = Color(0xFF39A900)
val ColorAzulOscuroSena = Color(0xFF00304D)
val ColorFondoGris = Color(0xFFF8F9FA)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventoClienteScreen(
    viewModel: EventoViewModel,
    onOpenDrawer: () -> Unit = {}
) {
    val data by viewModel.eventosCliente.collectAsStateWithLifecycle()
    var refreshing by remember { mutableStateOf(false) }
    val pullState = rememberPullToRefreshState()
    var mostrarTodos by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { viewModel.visualizaEventosCliente() }

    Scaffold(
        topBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ColorAzulOscuroSena)
                    .padding(top = 45.dp, bottom = 20.dp)
            ) {
                if (mostrarTodos) {
                    IconButton(
                        onClick = { mostrarTodos = false },
                        modifier = Modifier.align(Alignment.CenterStart).padding(start = 8.dp)
                    ) {
                        Icon(painterResource(R.drawable.ic_atras_admin), null, tint = Color.White)
                    }
                } else {
                    IconButton(
                        onClick = onOpenDrawer,
                        modifier = Modifier.align(Alignment.CenterStart).padding(start = 8.dp)
                    ) {
                        Icon(Icons.Default.Menu, contentDescription = null, tint = Color.White)
                    }
                }

                Text(
                    text = stringResource(R.string.cliente_titulo),
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        },
        bottomBar = {
        }
    ) { padding ->
        PullToRefreshBox(
            state = pullState,
            isRefreshing = refreshing,
            onRefresh = { viewModel.visualizaEventosCliente() },
            modifier = Modifier.padding(padding).fillMaxSize().background(Color.White)
        ) {
            if (mostrarTodos) {
                val todosLosEventos = remember(data) { 
                    val lista = mutableListOf<ModelEventoAdmin>()
                    data.disponible_hoy?.let { lista.add(it) }
                    lista.addAll(data.proximos)
                    lista
                }
                LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    items(todosLosEventos) { evento -> EventoHoyCard(evento) }
                }
            } else {
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(ColorVerdeSena))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(stringResource(R.string.cliente_disponible_hoy), fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    data.disponible_hoy?.let { hoy ->
                        EventoHoyCard(hoy)
                    } ?: Text(stringResource(R.string.cliente_sin_eventos_hoy), color = Color.Gray, modifier = Modifier.padding(vertical = 10.dp))

                    Spacer(modifier = Modifier.height(24.dp))

                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text(stringResource(R.string.cliente_proximos_eventos), fontSize = 16.sp, color = Color.Gray)
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { mostrarTodos = true }) {
                            Text(stringResource(R.string.cliente_ver_todos), color = ColorVerdeSena, fontSize = 14.sp)
                            Icon(Icons.Default.ChevronRight, null, tint = ColorVerdeSena, modifier = Modifier.size(18.dp))
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp), modifier = Modifier.height(280.dp)) {
                        items(data.proximos) { evento -> ProximoEventoCard(item = evento) }
                    }
                }
            }
        }
    }
}

@Composable
fun EventoHoyCard(evento: ModelEventoAdmin) {
    val iconoRes = when {
        evento.experiencia?.lowercase()?.contains("cafe") == true || evento.experiencia?.lowercase()?.contains("café") == true -> R.drawable.ic_cafe
        evento.experiencia?.lowercase()?.contains("vino") == true -> R.drawable.ic_vino
        evento.experiencia?.lowercase()?.contains("queso") == true -> R.drawable.ic_queso
        else -> R.drawable.ic_reloj
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(4.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            AsyncImage(
                model = "${ConexionService.urlImgExperiencias}${evento.imagen}",
                contentDescription = null,
                modifier = Modifier.fillMaxWidth().height(140.dp), 
                contentScale = ContentScale.Crop
            )
            
            Column(modifier = Modifier.padding(16.dp)) {
                // Título centrado con Icono
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                    Surface(modifier = Modifier.size(36.dp), shape = CircleShape, color = Color(0xFFF0F9F0)) {
                        Icon(painterResource(iconoRes), null, tint = ColorVerdeSena, modifier = Modifier.padding(8.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(evento.experiencia ?: "", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color.Black)
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = Color(0xFFEEEEEE))
                Spacer(modifier = Modifier.height(12.dp))

                // Fila de 3 items: Fecha, Hora, Cupos
                Row(
                    modifier = Modifier.fillMaxWidth(), 
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    InfoDetalleItemVertical(R.drawable.ic_calendario, formatFechaC(evento.fecha_inicio), formatDayName(evento.fecha_inicio))
                    VerticalDivider(modifier = Modifier.height(24.dp), color = Color(0xFFEEEEEE))
                    InfoDetalleItemVertical(R.drawable.ic_reloj, formatHoraRangeC(evento.fecha_inicio, evento.fecha_fin), stringResource(R.string.cliente_horario))
                    VerticalDivider(modifier = Modifier.height(24.dp), color = Color(0xFFEEEEEE))
                    val disponibles = (evento.numero_personas ?: 0) - (evento.asistentes ?: 0)
                    InfoDetalleItemVertical(R.drawable.ic_account_box, stringResource(R.string.cliente_cupos, disponibles), stringResource(R.string.cliente_disponibles))
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Descripción y Precio lado a lado
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        evento.descripcion ?: "", 
                        modifier = Modifier.weight(1f).padding(end = 16.dp), 
                        fontSize = 12.sp, color = Color.Gray, maxLines = 3, lineHeight = 16.sp
                    )
                    Column(horizontalAlignment = Alignment.End) {
                        Text(stringResource(R.string.cliente_precio_por_persona), fontSize = 11.sp, color = Color.Gray)
                        Text(stringResource(R.string.formato_precio, String.format("%,d", evento.costo_total ?: 0).replace(',', '.')), fontWeight = FontWeight.Bold, fontSize = 18.sp, color = ColorVerdeSena)
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Button(
                    onClick = { },
                    modifier = Modifier.fillMaxWidth().height(44.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ColorVerdeSena),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(painterResource(R.drawable.ic_calendario), null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.cliente_reservar_evento), fontSize = 14.sp)
                }
            }
        }
    }
}

@Composable
fun InfoDetalleItemVertical(iconRes: Int, text: String, subtext: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(painterResource(iconRes), null, modifier = Modifier.size(20.dp), tint = ColorVerdeSena)
        Spacer(modifier = Modifier.width(6.dp))
        Column(verticalArrangement = Arrangement.Center) {
            Text(
                text = text, 
                fontSize = 11.sp, 
                fontWeight = FontWeight.Bold, 
                color = Color.Gray, 
                maxLines = 1,
                lineHeight = 12.sp
            )
            Text(
                text = subtext, 
                fontSize = 10.sp, 
                color = Color.LightGray,
                lineHeight = 10.sp
            )
        }
    }
}

@Composable
fun ProximoEventoCard(item: ModelEventoAdmin) {
    val iconoRes = when {
        item.experiencia?.lowercase()?.contains("cafe") == true || item.experiencia?.lowercase()?.contains("café") == true -> R.drawable.ic_cafe
        item.experiencia?.lowercase()?.contains("vino") == true -> R.drawable.ic_vino
        item.experiencia?.lowercase()?.contains("queso") == true -> R.drawable.ic_queso
        else -> R.drawable.ic_reloj
    }

    Card(
        modifier = Modifier.width(150.dp).shadow(2.dp, RoundedCornerShape(12.dp)),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column {
            Box(modifier = Modifier.height(100.dp)) {
                AsyncImage(
                    model = "${ConexionService.urlImgExperiencias}${item.imagen}",
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp)),
                    contentScale = ContentScale.Crop
                )
                Surface(
                    modifier = Modifier.align(Alignment.BottomStart).padding(6.dp).size(26.dp),
                    shape = CircleShape,
                    color = Color.White,
                    tonalElevation = 2.dp
                ) {
                    Icon(painterResource(iconoRes), null, tint = ColorVerdeSena, modifier = Modifier.padding(4.dp))
                }
            }
            Column(Modifier.padding(8.dp)) {
                Text(item.experiencia ?: "", fontWeight = FontWeight.Bold, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(painterResource(R.drawable.ic_calendario), null, modifier = Modifier.size(12.dp), tint = ColorVerdeSena)
                    Spacer(Modifier.width(4.dp))
                    Text(formatFechaC(item.fecha_inicio), fontSize = 10.sp, color = Color.Gray)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(painterResource(R.drawable.ic_reloj), null, modifier = Modifier.size(12.dp), tint = ColorVerdeSena)
                    Spacer(Modifier.width(4.dp))
                    Text(formatHoraRangeC(item.fecha_inicio, item.fecha_fin), fontSize = 10.sp, color = Color.Gray)
                }
                
                Spacer(modifier = Modifier.height(4.dp))
                Text(stringResource(R.string.formato_precio, String.format("%,d", item.costo_total ?: 0).replace(',', '.')), color = ColorVerdeSena, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}

fun formatFechaC(fechaRaw: String?): String {
    if (fechaRaw.isNullOrBlank()) return "--"
    return try {
        val cleanDate = fechaRaw.split(" ")[0]
        val input = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val output = SimpleDateFormat("dd MMM yyyy", Locale("es", "ES"))
        output.format(input.parse(cleanDate)!!).replace(".", "")
    } catch (e: Exception) {
        fechaRaw.take(10)
    }
}

fun formatDayName(fechaRaw: String?): String {
    if (fechaRaw.isNullOrBlank()) return "--"
    return try {
        val cleanDate = fechaRaw.split(" ")[0]
        val input = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val output = SimpleDateFormat("EEEE", Locale("es", "ES"))
        output.format(input.parse(cleanDate)!!).replaceFirstChar { it.uppercase() }
    } catch (e: Exception) {
        "--"
    }
}

fun formatHoraRangeC(inicio: String?, fin: String?): String {
    if (inicio.isNullOrBlank()) return "--"
    return try {
        val sdfInput = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US)
        val sdfTime = SimpleDateFormat("h:mm", Locale.US)
        val sdfAmPm = SimpleDateFormat("a", Locale.US)
        
        val dateIn = sdfInput.parse(inicio.substring(0, 16))!!
        val hIn = sdfTime.format(dateIn)
        
        if (!fin.isNullOrBlank() && fin.length >= 16) {
            val dateOut = sdfInput.parse(fin.substring(0, 16))!!
            val hOut = sdfTime.format(dateOut)
            val apOut = sdfAmPm.format(dateOut).lowercase()

            "$hIn-$hOut $apOut"
        } else {
            val apIn = sdfAmPm.format(dateIn).lowercase()
            "$hIn $apIn"
        }
    } catch (e: Exception) {
        "--"
    }
}
