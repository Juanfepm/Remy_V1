package com.jmba.remy.view.menu

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
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
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jmba.remy.AppDestinations
import com.jmba.remy.R
import com.jmba.remy.model.ModelEventoDia
import kotlinx.coroutines.launch

@Composable
fun ReservasScreen(
    viewModelEvento: EventoViewModel,
    onOpenDrawer: () -> Unit
) {
    val lista by viewModelEvento.listaEvento.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModelEvento.visualiza()
    }

    ReservasScreenContent(
        lista = lista,
        onOpenDrawer = onOpenDrawer
    )
}

@Composable
fun DrawerItem(
    destination: AppDestinations,
    onNavigate: (AppDestinations) -> Unit,
    drawerState: DrawerState
) {
    val scope = rememberCoroutineScope()
    NavigationDrawerItem(
        label = { Text(stringResource(destination.label), fontWeight = FontWeight.Medium) },
        selected = false,
        onClick = {
            scope.launch { drawerState.close() }
            onNavigate(destination)
        },
        icon = { Icon(painterResource(destination.icon), contentDescription = null, modifier = Modifier.size(24.dp)) },
        modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding),
        colors = NavigationDrawerItemDefaults.colors(
            unselectedContainerColor = Color.Transparent,
            unselectedIconColor = Color(0xFF1A3A5C),
            unselectedTextColor = Color(0xFF1A3A5C)
        )
    )
}

@Composable
fun ReservasScreenContent(
    lista: List<ModelEventoDia>,
    onOpenDrawer: () -> Unit
) {

    val meses = listOf(
        "",
        stringResource(R.string.ene),
        stringResource(R.string.feb),
        stringResource(R.string.mar),
        stringResource(R.string.abr),
        stringResource(R.string.may),
        stringResource(R.string.jun),
        stringResource(R.string.jul),
        stringResource(R.string.ago),
        stringResource(R.string.sep),
        stringResource(R.string.oct),
        stringResource(R.string.nov),
        stringResource(R.string.dic)
    )

    val am = stringResource(R.string.am)
    val pm = stringResource(R.string.pm)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1A3A5C))
                .padding(top = 45.dp, bottom = 20.dp)
        ) {
            IconButton(
                onClick = onOpenDrawer,
                modifier = Modifier.align(Alignment.CenterStart).padding(start = 8.dp)
            ) {
                Icon(Icons.Default.Menu, contentDescription = null, tint = Color.White)
            }

            Text(
                text = stringResource(R.string.nav_programacion),
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {

            item {
                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = stringResource(R.string.bienvenido),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A3A5C)
                )
                Text(
                    text = stringResource(R.string.fecha_hoy),
                    fontSize = 13.sp,
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(IntrinsicSize.Min),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFE9E8E8)),
                        border = BorderStroke(1.dp, Color(0xFFE0E0E0))
                    ) {
                        Row(
                            modifier = Modifier
                                .padding(12.dp)
                                .fillMaxSize(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .background(Color(0xFFE8F5E9), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    painter = painterResource(R.drawable.ic_calendare),
                                    contentDescription = null,
                                    tint = Color(0xFF4CAF50),
                                    modifier = Modifier.size(26.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Column(verticalArrangement = Arrangement.Center) {
                                Text(
                                    text = stringResource(R.string.reservas_hoy),
                                    fontSize = 11.sp,
                                    lineHeight = 13.sp,
                                    color = Color.Gray,
                                    maxLines = 2
                                )
                                Text(
                                    text = stringResource(R.string.num_reservas_hoy),
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1A3A5C)
                                )
                            }
                        }
                    }

                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFE9E8E8)),
                        border = BorderStroke(1.dp, Color(0xFFE0E0E0))
                    ) {
                        Row(
                            modifier = Modifier
                                .padding(12.dp)
                                .fillMaxSize(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .background(Color(0xFFE8F5E9), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    painter = painterResource(R.drawable.ic_eventos),
                                    contentDescription = null,
                                    tint = Color(0xFF4CAF50),
                                    modifier = Modifier.size(26.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Column(verticalArrangement = Arrangement.Center) {
                                Text(
                                    text = stringResource(R.string.eventos_proximos),
                                    fontSize = 11.sp,
                                    lineHeight = 13.sp,
                                    color = Color.Gray,
                                    maxLines = 2
                                )
                                Text(
                                    text = stringResource(R.string.num_eventos_proximos),
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1A3A5C)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE9E8E8)),
                    border = BorderStroke(1.dp, Color(0xFFE0E0E0))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .background(Color(0xFFE8F5E9), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(R.drawable.ic_ingresos),
                                contentDescription = null,
                                tint = Color(0xFF4CAF50),
                                modifier = Modifier.size(26.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = stringResource(R.string.ingresos_mes),
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = stringResource(R.string.num_ingresos_mes),
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF1A3A5C)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = stringResource(R.string.proximos_eventos),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A3A5C)
                )

                Spacer(modifier = Modifier.height(8.dp))
            }

            if (lista.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            painter = painterResource(R.drawable.ic_calendare),
                            contentDescription = null,
                            tint = Color(0xFFB0BEC5),
                            modifier = Modifier.size(80.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = stringResource(R.string.sin_reservas),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1A3A5C)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = stringResource(R.string.sin_reservas_desc),
                            fontSize = 14.sp,
                            color = Color.Gray,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 32.dp)
                        )
                    }
                }
            } else {
                itemsIndexed(lista) { _, evento ->

                    val fechaCompleta = evento.fecha_inicio ?: ""
                    val partesEspacio = fechaCompleta.split(" ")
                    val fechaSolo = partesEspacio.getOrNull(0) ?: ""
                    val horaSolo = partesEspacio.getOrNull(1) ?: ""

                    val fechaPartes = fechaSolo.split("-")
                    val anio = fechaPartes.getOrNull(0) ?: ""
                    val mesNum = fechaPartes.getOrNull(1)?.toIntOrNull() ?: 0
                    val dia = fechaPartes.getOrNull(2) ?: ""
                    val mesAbbr = if (mesNum in 1..12) meses[mesNum] else ""

                    val horaPartes = horaSolo.split(":")
                    val horaHH = horaPartes.getOrNull(0)?.toIntOrNull() ?: 0
                    val minMM = horaPartes.getOrNull(1) ?: "00"
                    val amPm = if (horaHH >= 12) pm else am
                    val hora12 = when {
                        horaHH == 0 -> 12
                        horaHH > 12 -> horaHH - 12
                        else -> horaHH
                    }
                    val horaFormateada = if (horaSolo.isNotEmpty()) "$hora12:$minMM $amPm" else ""

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFE9E8E8)),
                        border = BorderStroke(1.dp, Color(0xFFE0E0E0))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(IntrinsicSize.Max)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .background(
                                        color = Color(0xFF1A3A5C),
                                        shape = RoundedCornerShape(
                                            topStart = 12.dp,
                                            bottomStart = 12.dp
                                        )
                                    )
                                    .width(75.dp)
                                    .padding(vertical = 12.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = dia,
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 22.sp
                                    )
                                    Text(
                                        text = mesAbbr,
                                        color = Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                    Text(
                                        text = anio,
                                        color = Color.White.copy(alpha = 0.8f),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(16.dp))

                            Column(
                                modifier = Modifier
                                    .weight(1f)
                                    .padding(vertical = 12.dp, horizontal = 4.dp)
                            ) {
                                Text(
                                    text = evento.nombre ?: "",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1A3A5C),
                                    modifier = Modifier.fillMaxWidth(),
                                    softWrap = true
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = evento.correo_fk ?: "",
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )
                                Text(
                                    text = pluralStringResource(R.plurals.menu_personas_count, evento.numero_personas ?: 0, evento.numero_personas ?: 0),
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )
                                Text(
                                    text = horaFormateada,
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )
                            }

                            Spacer(modifier = Modifier.width(8.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                }
            }
        }
    }
}
