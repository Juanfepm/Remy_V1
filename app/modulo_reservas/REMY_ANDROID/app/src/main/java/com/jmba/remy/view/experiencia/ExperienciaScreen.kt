package com.jmba.remy.view.experiencia

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.jmba.remy.R
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelExperienciaAdmin
import com.jmba.remy.view.admin_evento.EventoViewModel

val ColorAzulOscuroSena = Color(0xFF00304D)
val ColorVerdeSena = Color(0xFF39A900)
val ColorGrisClaroSena = Color(0xFFE9E8E8)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExperienciaScreen(
    viewModel: EventoViewModel,
    onBack: () -> Unit,
    onGoInsertar: () -> Unit,
    onOpenDrawer: () -> Unit = {}
) {
    val lista by viewModel.listaExperiencia.collectAsStateWithLifecycle()
    var searchQuery by remember { mutableStateOf("") }

    var isRefreshing by remember { mutableStateOf(false) }
    val pullState = rememberPullToRefreshState()

    var showDeleteDialog by remember { mutableStateOf(false) }
    var selectedIdToDelete by remember { mutableStateOf("") }
    
    var showEditDialog by remember { mutableStateOf(false) }
    var expParaEditar by remember { mutableStateOf<ModelExperienciaAdmin?>(null) }

    var showInsertDialog by remember { mutableStateOf(false) }

    val listaFiltrada = remember(lista, searchQuery) {
        lista.filter { it.nombre?.contains(searchQuery, ignoreCase = true) ?: true }
            .sortedByDescending { it.id_experiencia ?: "" }
    }

    LaunchedEffect(Unit) {
        viewModel.visualizaExperiencias()
    }

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
                    onClick = onBack,
                    modifier = Modifier.align(Alignment.CenterStart).padding(start = 8.dp)
                ) {
                    Icon(painterResource(id = R.drawable.ic_atras_admin), contentDescription = null, tint = Color.White)
                }

                Text(
                    text = stringResource(R.string.exp_titulo),
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showInsertDialog = true },
                containerColor = ColorVerdeSena,
                contentColor = Color.White,
                shape = CircleShape
            ) {
                Icon(Icons.Default.Add, contentDescription = stringResource(R.string.agregar), modifier = Modifier.size(36.dp))
            }
        }
    ) { padding ->
        PullToRefreshBox(
            state = pullState,
            isRefreshing = isRefreshing,
            onRefresh = {
                viewModel.visualizaExperiencias()
            },
            modifier = Modifier.padding(padding).fillMaxSize()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
            ) {
                // Buscador
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    placeholder = { Text(stringResource(R.string.exp_buscar)) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color.Gray) },
                    shape = RoundedCornerShape(12.dp)
                )

                if (listaFiltrada.isEmpty()) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_vacio),
                            contentDescription = stringResource(R.string.exp_vacio),
                            modifier = Modifier.size(120.dp),
                            alpha = 0.5f
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            stringResource(R.string.exp_sin_resultados),
                            color = Color.Gray,
                            fontSize = 16.sp,
                            textAlign = TextAlign.Center
                        )
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        contentPadding = PaddingValues(bottom = 80.dp)
                    ) {
                        items(listaFiltrada) { item ->
                            ExperienciaCard(
                                item = item,
                                onEdit = { 
                                    expParaEditar = item
                                    showEditDialog = true 
                                },
                                onDelete = { 
                                    selectedIdToDelete = item.id_experiencia ?: ""
                                    showDeleteDialog = true 
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text(stringResource(R.string.exp_confirmar_eliminacion)) },
            text = { Text(stringResource(R.string.exp_pregunta_eliminar)) },
            confirmButton = {
                Button(onClick = { viewModel.eliminarExp(selectedIdToDelete); showDeleteDialog = false }, colors = ButtonDefaults.buttonColors(containerColor = Color.Red)) {
                    Text(stringResource(R.string.exp_si_eliminar), color = Color.White)
                }
            },
            dismissButton = { TextButton(onClick = { showDeleteDialog = false }) { Text(stringResource(R.string.no), color = Color.Gray) } }
        )
    }

    if (showEditDialog && expParaEditar != null) {
        EditarExperienciaDialog(
            item = expParaEditar!!,
            titulo = stringResource(R.string.exp_editar),
            onDismiss = { showEditDialog = false },
            onConfirm = { actualizada -> viewModel.actualizarExp(actualizada); showEditDialog = false }
        )
    }

    if (showInsertDialog) {
        EditarExperienciaDialog(
            item = ModelExperienciaAdmin(),
            titulo = stringResource(R.string.exp_nueva),
            isInsert = true,
            onDismiss = { showInsertDialog = false },
            onConfirm = { nueva -> viewModel.insertarExp(nueva); showInsertDialog = false }
        )
    }
}

@Composable
fun EditarExperienciaDialog(
    item: ModelExperienciaAdmin, 
    titulo: String,
    isInsert: Boolean = false,
    onDismiss: () -> Unit, 
    onConfirm: (ModelExperienciaAdmin) -> Unit
) {
    var id by remember { mutableStateOf(item.id_experiencia ?: "") }
    var nombre by remember { mutableStateOf(item.nombre ?: "") }
    var desc by remember { mutableStateOf(item.descripcion ?: "") }
    var precio by remember { mutableStateOf(item.precio?.toString() ?: "") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(Modifier.padding(24.dp).verticalScroll(rememberScrollState()), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(titulo, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = ColorAzulOscuroSena)
                Spacer(Modifier.height(20.dp))
                
                if(isInsert) {
                    OutlinedTextField(id, { id = it }, label = { Text(stringResource(R.string.exp_label_id)) }, modifier = Modifier.fillMaxWidth())
                    Spacer(Modifier.height(12.dp))
                }

                OutlinedTextField(nombre, { nombre = it }, label = { Text(stringResource(R.string.exp_label_nombre)) }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(desc, { desc = it }, label = { Text(stringResource(R.string.exp_label_descripcion)) }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(precio, { precio = it }, label = { Text(stringResource(R.string.exp_label_precio)) }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(24.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedButton(onDismiss, Modifier.weight(1f)) { Text(stringResource(R.string.cancelar)) }
                    Button({
                        val imagenAsignada = when {
                            nombre.lowercase().contains("cafe") || nombre.lowercase().contains("café") -> "cafe.jpg"
                            nombre.lowercase().contains("vino") -> "vino.jpg"
                            nombre.lowercase().contains("queso") -> "quesos.jpg"
                            else -> "cafe.jpg"
                        }
                        onConfirm(item.copy(
                            id_experiencia = id,
                            nombre = nombre,
                            descripcion = desc,
                            precio = precio.toIntOrNull() ?: 0,
                            img_experiencia = if(isInsert) imagenAsignada else item.img_experiencia
                        ))
                    }, Modifier.weight(1f), colors = ButtonDefaults.buttonColors(ColorVerdeSena)) { Text(stringResource(R.string.guardar)) }
                }
            }
        }
    }
}

@Composable
fun ExperienciaCard(item: ModelExperienciaAdmin, onEdit: () -> Unit, onDelete: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = ColorGrisClaroSena),
        elevation = CardDefaults.cardElevation(2.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE0E0E0))
    ) {
        Row(Modifier.padding(12.dp).height(160.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                model = "${ConexionService.urlImgExperiencias}${item.img_experiencia}",
                contentDescription = null,
                modifier = Modifier
                    .fillMaxHeight()
                    .width(130.dp)
                    .clip(RoundedCornerShape(12.dp)),
                contentScale = ContentScale.Crop,
                error = painterResource(R.drawable.ic_imagen_defecto)
            )
            
            Spacer(Modifier.width(16.dp))

            Column(Modifier.fillMaxHeight().weight(1f), verticalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text(item.nombre ?: stringResource(R.string.exp_sin_nombre), fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.Black, maxLines = 1)
                    Spacer(Modifier.height(4.dp))
                    Text(item.descripcion ?: stringResource(R.string.exp_sin_descripcion), fontSize = 12.sp, color = Color.Gray, lineHeight = 16.sp, maxLines = 4)
                }
                
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = stringResource(R.string.formato_precio, String.format("%,d", item.precio ?: 0).replace(',', '.')), 
                        fontSize = 18.sp, 
                        fontWeight = FontWeight.Bold, 
                        color = ColorVerdeSena
                    )
                    
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .border(1.dp, Color(0xFFE0E0E0), RoundedCornerShape(8.dp))
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { onEdit() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Edit, null, tint = ColorVerdeSena, modifier = Modifier.size(16.dp))
                        }
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .border(1.dp, Color(0xFFE0E0E0), RoundedCornerShape(8.dp))
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { onDelete() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Delete, null, tint = Color.Red, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }
    }
}
