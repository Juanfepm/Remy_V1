package com.jmba.remy.view.operacion.ReservaEventos


import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
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
import com.jmba.remy.model.ModelEventoOperacion
import com.jmba.remy.R
import com.jmba.remy.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun ReservaEventosScreen(
    viewModel: ReservaEventosViewModel = viewModel(),
    onEventoClick: (String) -> Unit = {},
    onOpenDrawer: () -> Unit = {}
) {
    val eventos by viewModel.listaEventos.collectAsState()
    val isRefreshing by viewModel.isRefreshing.collectAsState()

    var busqueda by remember { mutableStateOf("") }

    val eventosFiltrados = remember(busqueda, eventos) {
        if (busqueda.isBlank()) eventos
        else eventos.filter {
            (it.nombreEvento?.contains(busqueda, ignoreCase = true) ?: false) ||
                    (it.correo?.contains(busqueda, ignoreCase = true) ?: false)
        }
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
                    Icon(Icons.Default.Menu, contentDescription = null, tint = Blanco)
                }

                Text(
                    text = stringResource(R.string.ReservasEventos),
                    color = Blanco,
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
                    .padding(horizontal = 16.dp, vertical = 8.dp)
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

                // Lista
                if (eventosFiltrados.isEmpty()) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(stringResource(R.string.op_sin_eventos), color = Color.Gray)
                    }
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        items(eventosFiltrados) { evento ->
                            EventoCard(
                                evento = evento,
                                onClick = { onEventoClick(evento.idEvento ?: "") }
                            )
                        }
                    }
                }
            }

            PullRefreshIndicator(
                refreshing = isRefreshing,
                state = pullRefreshState,
                modifier = Modifier.align(Alignment.TopCenter)
            )
        }
    }
}

@Composable
fun EventoCard(
    evento: ModelEventoOperacion,
    onClick: () -> Unit = {}
) {
    val fechaFormateada = remember(evento.fechaInicio) {
        try {
            // Extraer solo la fecha y formatear a dd/MM/yyyy
            val soloFecha = evento.fechaInicio?.split(" ")?.get(0) ?: ""
            val partes = soloFecha.split("-")
            if (partes.size == 3) {
                "${partes[2]}/${partes[1]}/${partes[0]}"
            } else {
                soloFecha
            }
        } catch (e: Exception) {
            evento.fechaInicio ?: ""
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0XFFE9E8E8)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = evento.nombreEvento ?: "",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = Color.Black
                )
                Text(
                    text = fechaFormateada,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = AzulTexto
                )
                Text(
                    text = pluralStringResource(R.plurals.op_personas_count, evento.numeroPersonas ?: 0, evento.numeroPersonas ?: 0),
                    fontSize = 13.sp,
                    color = Color.Gray
                )
                Text(
                    text = (evento.correo ?: "").chunked(35).joinToString("\n"),
                    fontSize = 13.sp,
                    color = AzulTexto
                )
            }

            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = stringResource(R.string.op_total_label),
                    fontSize = 13.sp,
                    color = Color.Gray
                )
                Text(
                    text = stringResource(R.string.formato_precio, evento.totalFormateado),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF39A900)
                )
            }
        }
    }
}
