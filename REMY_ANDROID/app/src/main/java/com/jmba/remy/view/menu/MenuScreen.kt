package com.jmba.remy.view.menu

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.jmba.remy.util.esCorreoInstitucional
import com.jmba.remy.util.normalizarCorreo
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelMenuDia
import com.jmba.remy.R
import com.jmba.remy.view.menu.EventoViewModel
import com.jmba.remy.view.menu.MenuViewModel

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.IconButton

@Composable
fun MenuScreen(
    viewModelMenu: MenuViewModel,
    viewModelEvento: EventoViewModel,
    onOpenDrawer: () -> Unit = {}
) {

    val lista by viewModelMenu.listaMenu.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModelMenu.visualiza()
    }

    MenuScreenContent(
        lista = lista,
        viewModelEvento = viewModelEvento,
        onOpenDrawer = onOpenDrawer
    )
}

@Composable
fun MenuScreenContent(
    lista: List<ModelMenuDia>,
    viewModelEvento: EventoViewModel,
    onOpenDrawer: () -> Unit
) {

    val menu = lista.firstOrNull()
    val context = LocalContext.current
    var correo by remember { mutableStateOf("") }
    val correoValido = esCorreoInstitucional(correo)
    var cantidad by remember { mutableStateOf(1) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
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
                text = stringResource(R.string.menu_del_dia),
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        if (lista.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 80.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    painter = painterResource(R.drawable.ic_calendar),
                    contentDescription = null,
                    tint = Color(0xFFB0BEC5),
                    modifier = Modifier.size(80.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = stringResource(R.string.sin_menu),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A3A5C)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.sin_menu_desc),
                    fontSize = 14.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 32.dp)
                )
            }
        } else {

            Column(modifier = Modifier.padding(16.dp)) {

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        painter = painterResource(R.drawable.ic_calendar),
                        contentDescription = null,
                        tint = Color(0xFF1A3A5C),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = stringResource(R.string.disponible_hoy),
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color(0xFF1A3A5C)
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        painter = painterResource(R.drawable.ic_schedule),
                        contentDescription = null,
                        tint = Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = stringResource(R.string.hora_menu),
                        color = Color.Gray,
                        fontSize = 14.sp
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                AsyncImage(
                    model = ConexionService.urlImagenes + menu?.img_plato_fuerte,
                    contentDescription = stringResource(R.string.plato),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp)
                        .clip(RoundedCornerShape(16.dp)),
                    contentScale = ContentScale.Crop
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    AsyncImage(
                        model = ConexionService.urlImagenes + menu?.img_bebida,
                        contentDescription = stringResource(R.string.bebida),
                        modifier = Modifier
                            .weight(1f)
                            .height(100.dp)
                            .clip(RoundedCornerShape(16.dp)),
                        contentScale = ContentScale.Crop
                    )
                    AsyncImage(
                        model = ConexionService.urlImagenes + menu?.img_entrada,
                        contentDescription = stringResource(R.string.entrada),
                        modifier = Modifier
                            .weight(1f)
                            .height(100.dp)
                            .clip(RoundedCornerShape(16.dp)),
                        contentScale = ContentScale.Crop
                    )
                    AsyncImage(
                        model = ConexionService.urlImagenes + menu?.img_postre,
                        contentDescription = stringResource(R.string.postre),
                        modifier = Modifier
                            .weight(1f)
                            .height(100.dp)
                            .clip(RoundedCornerShape(16.dp)),
                        contentScale = ContentScale.Crop
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = menu?.nombre ?: "",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF00304D)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = menu?.descripcion ?: "",
                    fontSize = 15.sp,
                    color = Color.DarkGray,
                    lineHeight = 22.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE9E8E8))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = stringResource(R.string.platos),
                                fontSize = 14.sp,
                                color = Color.Gray
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(vertical = 4.dp)
                            ) {
                                Icon(
                                    painter = painterResource(R.drawable.ic_menos),
                                    contentDescription = null,
                                    tint = Color(0xFF00304D),
                                    modifier = Modifier
                                        .size(32.dp)
                                        .padding(3.dp)
                                        .clickable { if (cantidad > 1) cantidad-- }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFF39A900), RoundedCornerShape(20.dp))
                                        .padding(horizontal = 24.dp, vertical = 4.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = cantidad.toString(),
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(
                                    painter = painterResource(R.drawable.ic_add),
                                    contentDescription = null,
                                    tint = Color(0xFF00304D),
                                    modifier = Modifier
                                        .size(32.dp)
                                        .padding(1.dp)
                                        .clickable { cantidad++ }
                                )
                            }
                            Text(
                                text = stringResource(R.string.dispo),
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                        }

                        val total = cantidad * (menu?.precio ?: 0)
                        Text(
                            text = stringResource(R.string.formato_precio, String.format("%,d", total).replace(',', '.')),
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF39a900)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE9E8E8))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                painter = painterResource(R.drawable.ic_acco),
                                contentDescription = null,
                                tint = Color(0xFF1A3A5C),
                                modifier = Modifier.size(30.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = stringResource(R.string.Correo_institucinal),
                                fontWeight = FontWeight.Medium,
                                color = Color.DarkGray,
                                fontSize = 16.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = correo,
                            onValueChange = { correo = it },
                            placeholder = {
                                Text(
                                    text = stringResource(R.string.ejemplo),
                                    color = Color.Gray,
                                    fontSize = 15.sp
                                )
                            },
                            isError = correo.isNotBlank() && !correoValido,
                            supportingText = { Text(stringResource(R.string.valid_correo), fontSize = 12.sp) },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF1A3A5C),
                                unfocusedBorderColor = Color.LightGray,
                                focusedContainerColor = Color.White,
                                unfocusedContainerColor = Color.White
                            ),
                            singleLine = true
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = { 
                        if (correo.isBlank()) {
                            Toast.makeText(context, context.getString(R.string.menu_ingrese_correo), Toast.LENGTH_SHORT).show()
                        } else if (!correoValido) {
                            Toast.makeText(context, context.getString(R.string.correo_no_institucional), Toast.LENGTH_LONG).show()
                        } else {
                            val total = cantidad * (menu?.precio ?: 0)
                            viewModelEvento.registrarReserva(context, normalizarCorreo(correo), cantidad, total)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(28.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF39A900))
                ) {
                    Text(
                        text = stringResource(R.string.reservar_menu),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}
