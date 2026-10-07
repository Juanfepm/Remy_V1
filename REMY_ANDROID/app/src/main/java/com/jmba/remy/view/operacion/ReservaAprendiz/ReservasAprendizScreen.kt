package com.jmba.remy.view.operacion.ReservaAprendiz

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.pullrefresh.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.jmba.remy.model.ModelReservaAprendiz
import com.jmba.remy.view.operacion.ReservaAprendiz.ReservaAprendizViewModel

import com.jmba.remy.R
import com.jmba.remy.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun ReservaAprendizScreen(
    viewModel: ReservaAprendizViewModel = viewModel(),
    onBackClick: () -> Unit = {},
    onOpenDrawer: () -> Unit = {}
) {
    val reservas by viewModel.listaReservas.collectAsState()
    val isRefreshing by viewModel.isRefreshing.collectAsState()

    var busqueda by remember { mutableStateOf("") }

    val reservasFiltradas = remember(busqueda, reservas) {
        val filtradas = if (busqueda.isBlank()) reservas
        else reservas.filter {
            it.correo?.contains(busqueda, ignoreCase = true) ?: false
        }
        // Ordenar: pendientes arriba, entregadas abajo
        filtradas.sortedWith(compareBy<ModelReservaAprendiz> { 
            it.estado?.equals("entregada", ignoreCase = true) == true 
        }.thenBy { it.correo })
    }

    val patronFecha = stringResource(R.string.formato_fecha_completa)
    val fechaHoy = remember(patronFecha) {
        SimpleDateFormat(patronFecha, Locale.getDefault()).format(Date())
    }

    val pullRefreshState = rememberPullRefreshState(
        refreshing = isRefreshing,
        onRefresh = { viewModel.visualiza() }
    )

    LaunchedEffect(Unit) {
        viewModel.visualiza()
    }

    Scaffold(
        containerColor = Color.White,
        topBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(AzulOscuro)
                    .padding(top = 45.dp, bottom = 20.dp)
            ) {
                IconButton(
                    onClick = onOpenDrawer,
                    modifier = Modifier.align(Alignment.CenterStart).padding(start = 8.dp)
                ) {
                    Icon(Icons.Default.Menu, contentDescription = null, tint = Color.White)
                }

                Text(
                    text = stringResource(R.string.titulo_aprendiz),
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        }
    ) { padding ->

        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .pullRefresh(pullRefreshState)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(start = 16.dp, end = 16.dp, top = 2.dp, bottom = 8.dp)
            ) {
                // Buscador
                OutlinedTextField(
                    value = busqueda,
                    onValueChange = { busqueda = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    placeholder = { Text(stringResource(R.string.buscar_por_correo), fontSize = 14.sp) },
                    leadingIcon = {
                        Icon(
                            painter = painterResource(R.drawable.ic_search),
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    shape = RoundedCornerShape(50),
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedContainerColor = Color(0xFFF5F5F5),
                        focusedContainerColor = Color.White,
                        unfocusedBorderColor = Color.Transparent,
                        focusedBorderColor = AzulOscuro
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Fecha + Contador
                val totalReservas = reservas.size
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = fechaHoy,
                        color = AzulTexto,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(R.drawable.ic_person),
                            contentDescription = null,
                            tint = Color(0xFF39A900),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = pluralStringResource(R.plurals.op_reservas_count, totalReservas, totalReservas),
                            color = Color(0xFF39A900),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Lista
                if (reservasFiltradas.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize().padding(bottom = 50.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                painter = painterResource(R.drawable.sin_reservas),
                                contentDescription = null,
                                modifier = Modifier.size(80.dp),
                                tint = Color.LightGray.copy(alpha = 0.5f)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = stringResource(R.string.op_sin_reservas_registradas),
                                color = Color.Gray,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = stringResource(R.string.op_sin_resultados_hoy),
                                color = Color.LightGray,
                                fontSize = 13.sp,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 32.dp)
                            )
                        }
                    }
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(reservasFiltradas, key = { it.idReserva ?: it.hashCode() }) { reserva ->
                            ReservaAprendizCard(
                                reserva = reserva,
                                onEstadoChange = { nuevoEstado ->
                                    viewModel.actualizarEstado(reserva.idReserva ?: "", nuevoEstado)
                                }
                            )
                        }
                    }
                }
            }

            PullRefreshIndicator(
                refreshing = isRefreshing,
                state = pullRefreshState,
                modifier = Modifier.align(Alignment.TopCenter),
                contentColor = AzulOscuro
            )
        }
    }
}

@Composable
fun ReservaAprendizCard(
    reserva: ModelReservaAprendiz,
    onEstadoChange: (String) -> Unit
) {
    val entregada = reserva.estado?.equals("entregada", ignoreCase = true) == true

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFE9E8E8)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(12.dp)) {

            // Fila superior: correo + total
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = (reserva.correo ?: "").chunked(35).joinToString("\n"),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = AzulTexto
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = pluralStringResource(R.plurals.op_menus_del_dia, reserva.cantMenus ?: 0, reserva.cantMenus ?: 0),
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
                Column(
                    horizontalAlignment = Alignment.End,
                    modifier = Modifier.padding(end = 4.dp)
                ) {
                    Text(
                        text = stringResource(R.string.total_operacion),
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = stringResource(R.string.formato_precio, reserva.totalFormateado),
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF39A900)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(color = Color.LightGray, thickness = 0.5.dp)
            Spacer(modifier = Modifier.height(8.dp))

            // Fila inferior: chip estado + checkbox
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        onEstadoChange(if (entregada) "pendiente" else "entregada")
                    },
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Chip estado
                Surface(
                    shape = RoundedCornerShape(50),
                    color = if (entregada) Color(0xFFE8F5E9) else Color(0xFFFFF3E0)
                ) {
                    Text(
                        text = stringResource(if (entregada) R.string.op_estado_entregada else R.string.op_estado_pendiente),
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (entregada) Color(0xFF2E7D32) else Color(0xFFE65100)
                    )
                }

                // Checkbox + label
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = stringResource(R.string.op_marcar_entregada),
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Checkbox(
                        checked = entregada,
                        onCheckedChange = null,
                        colors = CheckboxDefaults.colors(
                            checkedColor = Color(0xFF39A900),
                            uncheckedColor = Color.Gray
                        )
                    )
                }
            }
        }
    }
}
