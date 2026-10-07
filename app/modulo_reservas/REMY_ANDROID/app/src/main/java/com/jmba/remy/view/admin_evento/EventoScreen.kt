package com.jmba.remy.view.admin_evento

import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.foundation.background
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.jmba.remy.R
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelEventoAdmin
import java.text.SimpleDateFormat
import java.util.*

val ColorGrisClaroSena = Color(0xFFE9E8E8)
val ColorAzulOscuroSena = Color(0xFF00304D)
val ColorVerdeSena = Color(0xFF39A900)

private val OPCIONES_TIPO = listOf(
    "Café"  to R.string.admin_tipo_cafe,
    "Vino"  to R.string.admin_tipo_vino,
    "Queso" to R.string.admin_tipo_queso
)
private val OPCIONES_FRANJA = listOf(
    "Mañana" to R.string.admin_jornada_manana,
    "Tarde"  to R.string.admin_jornada_tarde,
    "Noche"  to R.string.admin_jornada_noche
)
private val OPCIONES_CUPOS = listOf(
    "Con Cupos" to R.string.admin_cupos_con,
    "Agotados"  to R.string.admin_cupos_agotados
)

@Composable
private fun etiquetaFiltro(valor: String): String {
    val res = (OPCIONES_TIPO + OPCIONES_FRANJA + OPCIONES_CUPOS).firstOrNull { it.first == valor }?.second
    return if (res != null) stringResource(res) else valor
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventoScreen(
    viewModel: EventoViewModel,
    onBack: () -> Unit,
    onOpenDrawer: () -> Unit = {}
) {
    val lista by viewModel.listaEvento.collectAsStateWithLifecycle()
    var searchQuery by remember { mutableStateOf("") }
    val pullState = rememberPullToRefreshState()
    var showDeleteDialog by remember { mutableStateOf(false) }
    var selectedIdToDelete by remember { mutableStateOf("") }
    var showEditDialog by remember { mutableStateOf(false) }
    var eventoParaEditar by remember { mutableStateOf<ModelEventoAdmin?>(null) }
    var showInsertDialog by remember { mutableStateOf(false) }

    // Estados de Filtro
    var showFilterMenu by remember { mutableStateOf(false) }
    var filterType by remember { mutableStateOf("") }
    var filterFranja by remember { mutableStateOf("") }
    var filterCupos by remember { mutableStateOf("") }

    val listaFiltrada = remember(lista, searchQuery, filterType, filterFranja, filterCupos) {
        lista.filter {
            val matchesSearch = it.experiencia?.contains(searchQuery, ignoreCase = true) ?: true

            val matchesType = if (filterType.isEmpty()) true else {
                val exp = it.experiencia?.lowercase() ?: ""
                if (filterType == "Café") exp.contains("café") || exp.contains("cafe")
                else exp.contains(filterType.lowercase())
            }
            
            val matchesFranja = if (filterFranja.isEmpty()) true else it.franja_horaria == filterFranja
            
            val matchesCupos = when (filterCupos) {
                "Con Cupos" -> (it.numero_personas ?: 0) > (it.asistentes ?: 0)
                "Agotados" -> (it.numero_personas ?: 0) <= (it.asistentes ?: 0)
                else -> true
            }

            matchesSearch && matchesType && matchesFranja && matchesCupos
        }.sortedByDescending { it.fecha_inicio ?: "" }
    }

    LaunchedEffect(Unit) { viewModel.visualiza() }

    Scaffold(
        containerColor = Color.White,
        topBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ColorAzulOscuroSena)
                    .padding(top = 45.dp, bottom = 20.dp)
            ) {
                IconButton(
                    onClick = onOpenDrawer,
                    modifier = Modifier.align(Alignment.CenterStart).padding(start = 8.dp)
                ) {
                    Icon(Icons.Default.Menu, contentDescription = null, tint = Color.White)
                }

                Text(
                    text = stringResource(R.string.titulo_admin_eventos),
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showInsertDialog = true }, containerColor = ColorVerdeSena, contentColor = Color.White, shape = CircleShape) {
                Icon(Icons.Default.Add, null, modifier = Modifier.size(36.dp))
            }
        }
    ) { padding ->
        PullToRefreshBox(state = pullState, isRefreshing = false, onRefresh = { viewModel.visualiza() }, modifier = Modifier.padding(padding).fillMaxSize()) {
            Column(Modifier.padding(horizontal = 16.dp)) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
                    placeholder = { Text(stringResource(R.string.buscar_evento_admin)) },
                    leadingIcon = { Icon(Icons.Default.Search, null) },
                    trailingIcon = {
                        Box {
                            IconButton(onClick = { showFilterMenu = true }) {
                                Icon(Icons.Default.FilterList, stringResource(R.string.admin_filtro), tint = Color.Gray)
                            }
                            DropdownMenu(expanded = showFilterMenu, onDismissRequest = { showFilterMenu = false }) {
                                Text(stringResource(R.string.admin_filtro_tipo), fontWeight = FontWeight.Bold, fontSize = 12.sp, color = ColorVerdeSena)
                                OPCIONES_TIPO.forEach { (valor, etiqueta) ->
                                    DropdownMenuItem(text = { Text(stringResource(etiqueta)) }, onClick = { filterType = valor; showFilterMenu = false })
                                }
                                HorizontalDivider()
                                Text(stringResource(R.string.admin_filtro_jornada), fontWeight = FontWeight.Bold, fontSize = 12.sp, color = ColorVerdeSena)
                                OPCIONES_FRANJA.forEach { (valor, etiqueta) ->
                                    DropdownMenuItem(text = { Text(stringResource(etiqueta)) }, onClick = { filterFranja = valor; showFilterMenu = false })
                                }
                                HorizontalDivider()
                                Text(stringResource(R.string.admin_filtro_cupos), fontWeight = FontWeight.Bold, fontSize = 12.sp, color = ColorVerdeSena)
                                OPCIONES_CUPOS.forEach { (valor, etiqueta) ->
                                    DropdownMenuItem(text = { Text(stringResource(etiqueta)) }, onClick = { filterCupos = valor; showFilterMenu = false })
                                }
                            }
                        }
                    },
                    shape = RoundedCornerShape(12.dp)
                )
                
                // Chips para borrar filtros
                if (filterType.isNotEmpty() || filterFranja.isNotEmpty() || filterCupos.isNotEmpty()) {
                    Row(Modifier.padding(bottom = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (filterType.isNotEmpty()) InputChip(selected = true, onClick = { filterType = "" }, label = { Text(etiquetaFiltro(filterType)) }, trailingIcon = { Icon(Icons.Default.Delete, null, Modifier.size(14.dp)) })
                        if (filterFranja.isNotEmpty()) InputChip(selected = true, onClick = { filterFranja = "" }, label = { Text(etiquetaFiltro(filterFranja)) }, trailingIcon = { Icon(Icons.Default.Delete, null, Modifier.size(14.dp)) })
                        if (filterCupos.isNotEmpty()) InputChip(selected = true, onClick = { filterCupos = "" }, label = { Text(etiquetaFiltro(filterCupos)) }, trailingIcon = { Icon(Icons.Default.Delete, null, Modifier.size(14.dp)) })
                    }
                }

                LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp), contentPadding = PaddingValues(bottom = 80.dp)) {
                    items(listaFiltrada) { evento ->
                        EventoCard(item = evento, onEdit = { eventoParaEditar = evento; showEditDialog = true }, onDelete = { selectedIdToDelete = evento.id_evento ?: ""; showDeleteDialog = true })
                    }
                }
            }
        }
    }

    if (showDeleteDialog) {
        AlertDialog(onDismissRequest = { showDeleteDialog = false }, title = { Text(stringResource(R.string.eliminar)) }, text = { Text(stringResource(R.string.admin_borrar_evento)) },
            confirmButton = { Button(onClick = { viewModel.eliminar(selectedIdToDelete); showDeleteDialog = false }, colors = ButtonDefaults.buttonColors(containerColor = Color.Red)) { Text(stringResource(R.string.eliminar), color = Color.White) } },
            dismissButton = { TextButton(onClick = { showDeleteDialog = false }) { Text(stringResource(R.string.no)) } }
        )
    }

    if (showEditDialog && eventoParaEditar != null) {
        EditarEventoDialog(item = eventoParaEditar!!, titulo = stringResource(R.string.editar), onDismiss = { showEditDialog = false }, onConfirm = { viewModel.actualizar(it); showEditDialog = false })
    }

    if (showInsertDialog) {
        EditarEventoDialog(item = ModelEventoAdmin(), titulo = stringResource(R.string.admin_nuevo_evento), isInsert = true, onDismiss = { showInsertDialog = false }, onConfirm = { viewModel.insertar(it); showInsertDialog = false })
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditarEventoDialog(item: ModelEventoAdmin, titulo: String, isInsert: Boolean = false, onDismiss: () -> Unit, onConfirm: (ModelEventoAdmin) -> Unit) {
    var id by remember { mutableStateOf(item.id_evento ?: "") }
    var exp by remember { mutableStateOf(item.experiencia ?: "") }
    var fechaOnly by remember { mutableStateOf(item.fecha_inicio?.take(10) ?: SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) }
    var horaInicioOnly by remember { mutableStateOf(if (item.fecha_inicio?.length ?: 0 >= 16) item.fecha_inicio!!.substring(11, 16) else "09:00") }
    var horaFinOnly by remember { mutableStateOf(if (item.fecha_fin?.length ?: 0 >= 16) item.fecha_fin!!.substring(11, 16) else "11:00") }
    var franja by remember { mutableStateOf(item.franja_horaria ?: "Tarde") }
    var personas by remember { mutableStateOf(item.numero_personas?.toString() ?: "") }

    val opcionesFranja = OPCIONES_FRANJA
    var expanded by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(shape = RoundedCornerShape(24.dp)) {
            Column(Modifier.padding(24.dp).verticalScroll(rememberScrollState()), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(titulo, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(16.dp))
                if(isInsert) OutlinedTextField(id, { id = it }, label = { Text(stringResource(R.string.admin_label_id)) }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(exp, { exp = it }, label = { Text(stringResource(R.string.admin_label_nombre_exp)) }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(fechaOnly, { fechaOnly = it }, label = { Text(stringResource(R.string.admin_label_fecha)) }, modifier = Modifier.fillMaxWidth())
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(horaInicioOnly, { horaInicioOnly = it }, label = { Text(stringResource(R.string.admin_label_inicio)) }, modifier = Modifier.weight(1f))
                    OutlinedTextField(horaFinOnly, { horaFinOnly = it }, label = { Text(stringResource(R.string.admin_label_fin)) }, modifier = Modifier.weight(1f))
                }
                ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = !expanded }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
                    OutlinedTextField(value = etiquetaFiltro(franja), onValueChange = {}, readOnly = true, label = { Text(stringResource(R.string.admin_label_franja)) }, trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) }, modifier = Modifier.menuAnchor().fillMaxWidth())
                    ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                        opcionesFranja.forEach { (valor, etiqueta) -> DropdownMenuItem(text = { Text(stringResource(etiqueta)) }, onClick = { franja = valor; expanded = false }) }
                    }
                }
                OutlinedTextField(personas, { personas = it }, label = { Text(stringResource(R.string.personas)) }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(24.dp))
                Row(Modifier.fillMaxWidth(), Arrangement.spacedBy(12.dp)) {
                    TextButton(onDismiss, Modifier.weight(1f)) { Text(stringResource(R.string.cerrar)) }
                    Button({ 
                        val img = when {
                            exp.lowercase().contains("vino") -> "vino.jpg"
                            exp.lowercase().contains("queso") -> "quesos.jpg"
                            else -> "cafe.jpg"
                        }
                        onConfirm(item.copy(id_evento = id, experiencia = exp, fecha_inicio = "$fechaOnly $horaInicioOnly:00", fecha_fin = "$fechaOnly $horaFinOnly:00", franja_horaria = franja, numero_personas = personas.toIntOrNull() ?: 0, imagen = img))
                    }, Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = ColorVerdeSena)) { Text(stringResource(R.string.guardar)) }
                }
            }
        }
    }
}

@Composable
fun EventoCard(item: ModelEventoAdmin, onEdit: () -> Unit, onDelete: () -> Unit) {
    Card(Modifier.fillMaxWidth(), RoundedCornerShape(20.dp), CardDefaults.cardColors(containerColor = ColorGrisClaroSena), border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE0E0E0))) {
        Row(Modifier.padding(12.dp).height(IntrinsicSize.Min), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(model = "${ConexionService.urlImgExperiencias}${item.imagen}", contentDescription = null, modifier = Modifier.size(130.dp).clip(RoundedCornerShape(12.dp)), contentScale = ContentScale.Crop, error = painterResource(R.drawable.ic_imagen_defecto))
            Spacer(Modifier.width(12.dp))
            Column(Modifier.fillMaxHeight().weight(1f), Arrangement.SpaceBetween) {
                Column {
                    Text(item.experiencia ?: "", fontSize = 18.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(painterResource(R.drawable.ic_calendario), null, Modifier.size(14.dp), tint = Color.Gray)
                        Spacer(Modifier.width(6.dp))
                        Text(formatFecha(item.fecha_inicio), fontSize = 13.sp, color = Color.Gray)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(painterResource(R.drawable.ic_reloj), null, Modifier.size(14.dp), tint = Color.Gray)
                        Spacer(Modifier.width(6.dp))
                        Text(stringResource(R.string.admin_horario_franja, formatHoraReal(item.fecha_inicio, item.fecha_fin), item.franja_horaria ?: ""), fontSize = 13.sp, color = Color.Gray)
                    }
                    Text(buildAnnotatedString { append(stringResource(R.string.cupos)); withStyle(style = SpanStyle(color = ColorVerdeSena, fontWeight = FontWeight.Bold)) { append("${item.asistentes ?: 0}/${item.numero_personas ?: 0}") } }, fontSize = 14.sp)
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Box(Modifier.size(32.dp).border(1.dp, Color(0xFFE0E0E0), RoundedCornerShape(8.dp)).clip(RoundedCornerShape(8.dp)).clickable { onEdit() }, Alignment.Center) { Icon(Icons.Default.Edit, null, tint = ColorVerdeSena, modifier = Modifier.size(16.dp)) }
                        Box(Modifier.size(32.dp).border(1.dp, Color(0xFFE0E0E0), RoundedCornerShape(8.dp)).clip(RoundedCornerShape(8.dp)).clickable { onDelete() }, Alignment.Center) { Icon(Icons.Default.Delete, null, tint = Color.Red, modifier = Modifier.size(16.dp)) }
                    }
                }
            }
        }
    }
}

@Composable
fun formatFecha(fechaRaw: String?): String {
    if (fechaRaw == null || fechaRaw.length < 10) return fechaRaw ?: ""
    val patronFecha = stringResource(R.string.formato_fecha_larga)
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val outputFormat = SimpleDateFormat(patronFecha, Locale.getDefault())
        val date = inputFormat.parse(fechaRaw.take(10))
        outputFormat.format(date!!)
    } catch (e: Exception) { fechaRaw.take(10) }
}

fun formatHoraReal(inicio: String?, fin: String?): String {
    if (inicio == null || inicio.length < 16) return ""
    return try {
        val sdfInput = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
        val sdfOutput = SimpleDateFormat("h:mm", Locale.getDefault())
        val sdfAmPm = SimpleDateFormat("a", Locale.getDefault())
        
        val dateInicio = sdfInput.parse(inicio.substring(0, 16))
        val horaInicio = sdfOutput.format(dateInicio!!)
        
        if (fin != null && fin.length >= 16) {
            val dateFin = sdfInput.parse(fin.substring(0, 16))
            val horaFin = sdfOutput.format(dateFin!!)
            val ampm = sdfAmPm.format(dateFin).lowercase()
            "$horaInicio - $horaFin $ampm"
        } else {
            val ampm = sdfAmPm.format(dateInicio).lowercase()
            "$horaInicio $ampm"
        }
    } catch (e: Exception) {
        ""
    }
}
