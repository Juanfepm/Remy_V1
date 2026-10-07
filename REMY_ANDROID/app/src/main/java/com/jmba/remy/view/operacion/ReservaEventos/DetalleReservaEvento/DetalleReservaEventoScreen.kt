package com.jmba.remy.view.operacion.ReservaEventos.DetalleReservaEvento

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.jmba.remy.R

@Composable
fun DetalleReservaEventoScreen(
    onGoCerrar: () -> Unit,
    detalleReservaEventoViewModel: DetalleReservaEventoViewModel = viewModel()
) {
    val openDialogCancelar = remember { mutableStateOf(false) }
    val openDialogEditar = remember { mutableStateOf(false) }
    val evento = detalleReservaEventoViewModel.data
    val context = LocalContext.current

    // Strings para los Toasts
    val msgCancelado = stringResource(R.string.op_toast_evento_cancelado)
    val msgErrorCancelar = stringResource(R.string.op_toast_error_cancelar)
    val msgActualizado = stringResource(R.string.op_toast_evento_actualizado)
    val msgErrorActualizar = stringResource(R.string.op_toast_error_actualizar)

    val azulOscuro = Color(0xFF00304D)

    Card(
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        modifier = Modifier
            .fillMaxWidth(0.95f)
            .padding(vertical = 16.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(32.dp)
                .fillMaxWidth()
        ) {
            // Cabecera: Título y botones de acción
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.op_detalle_evento),
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = azulOscuro,
                    modifier = Modifier.weight(1f)
                )

                IconButton(onClick = { openDialogEditar.value = true }) {
                    Icon(Icons.Default.Edit, contentDescription = stringResource(R.string.editar), tint = Color.DarkGray)
                }
                IconButton(onClick = { openDialogCancelar.value = true }) {
                    Icon(Icons.Default.Delete, contentDescription = stringResource(R.string.op_cancelar_evento), tint = Color.DarkGray)
                }
            }

            Spacer(modifier = Modifier.height(30.dp))

            if (evento == null) {
                Box(Modifier.fillMaxWidth().height(150.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = azulOscuro)
                }
            } else {
                // Separar fecha y hora
                val fechaPartes = evento.fechaInicio?.split(" ") ?: emptyList()
                val fecha = fechaPartes.getOrNull(0) ?: ""
                val hora = fechaPartes.getOrNull(1) ?: ""

                Text(stringResource(R.string.op_detalle_nombre, evento.nombreEvento ?: ""), fontSize = 20.sp, color = Color.Black)
                Spacer(Modifier.height(10.dp))
                Text(stringResource(R.string.op_detalle_fecha, fecha), fontSize = 20.sp, color = Color.Black)
                Spacer(Modifier.height(10.dp))
                Text(stringResource(R.string.op_detalle_hora, hora), fontSize = 20.sp, color = Color.Black)
                Spacer(Modifier.height(10.dp))
                Text(stringResource(R.string.op_detalle_personas, evento.numeroPersonas ?: 0), fontSize = 20.sp, color = Color.Black)
                Spacer(Modifier.height(10.dp))
                Text(stringResource(R.string.op_detalle_correo, evento.correo ?: ""), fontSize = 20.sp, color = Color.Black)
                
                Spacer(Modifier.height(35.dp))
                
                HorizontalDivider(color = Color.LightGray.copy(alpha = 0.5f), thickness = 1.dp)
                
                Spacer(Modifier.height(20.dp))
                
                Text(
                    text = stringResource(R.string.op_detalle_total, evento.totalFormateado),
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF39A900)
                )
            }
        }
    }

    // Dialogos internos
    if (openDialogCancelar.value) {
        AlertDialogCancelarEvento(
            onDismissRequest = { openDialogCancelar.value = false },
            onConfirmation = {
                openDialogCancelar.value = false
                detalleReservaEventoViewModel.cancelar(
                    detalleReservaEventoViewModel.idEvento,
                    onSuccess = {
                        Toast.makeText(context, msgCancelado, Toast.LENGTH_SHORT).show()
                        onGoCerrar()
                    },
                    onError = {
                        Toast.makeText(context, msgErrorCancelar, Toast.LENGTH_SHORT).show()
                    }
                )
            }
        )
    }

    if (openDialogEditar.value && evento != null) {
        AlertDialogEditarEvento(
            numeroPersonasActual = evento.numeroPersonas?.toString() ?: "",
            onDismissRequest = { openDialogEditar.value = false },
            onConfirmation = { nuevoNumero ->
                openDialogEditar.value = false
                detalleReservaEventoViewModel.editarNumeroPersonas(
                    detalleReservaEventoViewModel.idEvento,
                    nuevoNumero,
                    onSuccess = {
                        Toast.makeText(context, msgActualizado, Toast.LENGTH_SHORT).show()
                    },
                    onError = {
                        Toast.makeText(context, msgErrorActualizar, Toast.LENGTH_SHORT).show()
                    }
                )
            }
        )
    }
}

@Composable
fun AlertDialogCancelarEvento(
    onDismissRequest: () -> Unit,
    onConfirmation: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismissRequest,
        containerColor = Color.White,
        title = { Text(stringResource(R.string.op_cancelar_evento), color = Color(0xFF00304D)) },
        text = { Text(stringResource(R.string.op_confirmar_cancelar)) },
        confirmButton = {
            Button(
                onClick = onConfirmation,
                colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
            ) { Text(stringResource(R.string.op_si_cancelar), color = Color.White) }
        },
        dismissButton = {
            TextButton(onClick = onDismissRequest) { Text(stringResource(R.string.no), color = Color.Gray) }
        }
    )
}

@Composable
fun AlertDialogEditarEvento(
    numeroPersonasActual: String,
    onDismissRequest: () -> Unit,
    onConfirmation: (String) -> Unit
) {
    var numeroPersonas by remember { mutableStateOf(numeroPersonasActual) }

    AlertDialog(
        onDismissRequest = onDismissRequest,
        containerColor = Color.White,
        title = { Text(stringResource(R.string.op_editar_evento), color = Color(0xFF00304D), fontWeight = FontWeight.Bold) },
        text = {
            Column {
                OutlinedTextField(
                    value = numeroPersonas,
                    onValueChange = { numeroPersonas = it.filter { c -> c.isDigit() } },
                    label = { Text(stringResource(R.string.op_numero_personas)) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirmation(numeroPersonas) },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF39A900))
            ) { Text(stringResource(R.string.guardar), color = Color.White) }
        },
        dismissButton = {
            TextButton(onClick = { onDismissRequest() }) { Text(stringResource(R.string.cancelar), color = Color.Gray) }
        }
    )
}
