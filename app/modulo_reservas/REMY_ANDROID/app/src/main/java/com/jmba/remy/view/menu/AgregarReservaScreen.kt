package com.jmba.remy.view.menu

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.IconButton
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.widget.Toast
import com.jmba.remy.util.esCorreoInstitucional
import com.jmba.remy.util.normalizarCorreo
import com.jmba.remy.R

import com.jmba.remy.view.menu.EventoViewModel

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu

@Composable
fun AgregarReservaScreen(
    viewModel: EventoViewModel,
    onOpenDrawer: () -> Unit = {}
) {
    val context = LocalContext.current
    var correo by remember { mutableStateOf("") }
    val correoValido = esCorreoInstitucional(correo)
    var cantidad by remember { mutableStateOf(1) }
    val precioUnitario = 14000
    val total = cantidad * precioUnitario

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        // Encabezado
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
                text = stringResource(R.string.agregar_reserva),
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        Column(modifier = Modifier.padding(16.dp)) {
            // Card Datos de la reserva
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFE9E8E8))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .border(1.dp, Color(0xFF004D40), RoundedCornerShape(8.dp))
                                .padding(4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(R.drawable.ic_calendare),
                                contentDescription = null,
                                tint = Color(0xFF004D40)
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = stringResource(R.string.datos_reserva),
                            color = Color(0xFF1A3A5C),
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Text(text = stringResource(R.string.correoInstitucional), color = Color(0xFF1A3A5C), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Input personalizado
                    BasicTextField(
                        value = correo,
                        onValueChange = { correo = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White, RoundedCornerShape(12.dp))
                            .border(
                                1.dp,
                                if (correo.isNotBlank() && !correoValido) Color(0xFFC62828) else Color(0xFF4CAF50),
                                RoundedCornerShape(12.dp)
                            )
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        decorationBox = { innerTextField ->
                            if (correo.isEmpty()) {
                                Text(text = stringResource(R.string.ejemplo), color = Color.LightGray)
                            }
                            innerTextField()
                        }
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = stringResource(R.string.valid_correo),
                        color = if (correo.isNotBlank() && !correoValido) Color(0xFFC62828) else Color.Gray,
                        fontSize = 12.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))
                    Text(text = stringResource(R.string.cant_menus), color = Color(0xFF1A3A5C), fontSize = 14.sp, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.CenterHorizontally))
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = { if (cantidad > 1) cantidad-- },
                            shape = CircleShape,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A3A5C)),
                            modifier = Modifier.size(40.dp),
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp)
                        ) {
                            Text(stringResource(R.string.contador_menos), color = Color.White, fontSize = 20.sp)
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Box(
                            modifier = Modifier
                                .width(100.dp)
                                .background(Color.LightGray, RoundedCornerShape(20.dp))
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = cantidad.toString(), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Button(
                            onClick = { cantidad++ },
                            shape = CircleShape,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A3A5C)),
                            modifier = Modifier.size(40.dp),
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp)
                        ) {
                            Text(stringResource(R.string.contador_mas), color = Color.White, fontSize = 20.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = stringResource(R.string.valor_por_menu) + stringResource(R.string.menu_precio_ejemplo),
                        color = Color(0xFF1A3A5C),
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Card Resumen
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
                            tint = Color(0xFF4CAF50),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = stringResource(R.string.resumen_reserva),
                            color = Color(0xFF1A3A5C),
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(text = stringResource(R.string.menus_seleccionados), color = Color.Black)
                        Text(text = cantidad.toString(), fontWeight = FontWeight.Bold, color = Color(0xFF1A3A5C))
                    }
                    Spacer(modifier = Modifier.height(20.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(text = stringResource(R.string.valor_unitario), color = Color.Black)
                        Text(text = stringResource(R.string.menu_precio_ejemplo), fontWeight = FontWeight.Bold, color = Color(0xFF1A3A5C))
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF39A900), RoundedCornerShape(16.dp))
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = stringResource(R.string.total), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text(text = stringResource(R.string.formato_precio, String.format("%,d", total).replace(',', '.')), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
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
                        viewModel.registrarReserva(context, normalizarCorreo(correo), cantidad, total)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(28.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF39A900))
            ) {
                Text(
                    text = stringResource(R.string.registrar_reserva),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}
