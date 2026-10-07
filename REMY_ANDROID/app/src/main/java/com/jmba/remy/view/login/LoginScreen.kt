package com.jmba.remy.view.login

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jmba.remy.R
import com.jmba.remy.model.ModelUsuario
import com.jmba.remy.util.esCorreoInstitucional

private val NAVY = Color(0xFF1A3A5C)
private val VERDE = Color(0xFF39A900)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    sesion: SesionViewModel,
    onOpenDrawer: () -> Unit = {},
    onExito: (ModelUsuario) -> Unit = {}
) {
    var correo by remember { mutableStateOf("") }
    var clave by remember { mutableStateOf("") }
    var errorLocal by remember { mutableStateOf<String?>(null) }

    val cargando by sesion.cargando.collectAsState()
    val errorServidor by sesion.error.collectAsState()

    val msgCorreoInvalido = stringResource(R.string.login_correo_invalido)
    val msgPasswordVacio = stringResource(R.string.login_password_vacio)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        // Encabezado
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(NAVY)
                .padding(top = 45.dp, bottom = 20.dp)
        ) {
            IconButton(
                onClick = onOpenDrawer,
                modifier = Modifier.align(Alignment.CenterStart).padding(start = 8.dp)
            ) {
                Icon(Icons.Default.Menu, contentDescription = null, tint = Color.White)
            }
            Text(
                text = stringResource(R.string.login_titulo),
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(24.dp))
            Text(
                text = stringResource(R.string.login_subtitulo),
                color = NAVY,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = stringResource(R.string.login_ayuda),
                color = Color(0xFF5C6873),
                fontSize = 13.sp
            )

            Spacer(Modifier.height(28.dp))

            OutlinedTextField(
                value = correo,
                onValueChange = { correo = it; errorLocal = null; sesion.limpiarError() },
                label = { Text(stringResource(R.string.login_correo_label)) },
                placeholder = { Text(stringResource(R.string.login_correo_placeholder)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = VERDE, focusedLabelColor = VERDE),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(14.dp))

            OutlinedTextField(
                value = clave,
                onValueChange = { clave = it; errorLocal = null; sesion.limpiarError() },
                label = { Text(stringResource(R.string.login_password_label)) },
                placeholder = { Text(stringResource(R.string.login_password_placeholder)) },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = VERDE, focusedLabelColor = VERDE),
                modifier = Modifier.fillMaxWidth()
            )

            val mensajeError = errorLocal ?: errorServidor
            if (mensajeError != null) {
                Spacer(Modifier.height(12.dp))
                Text(text = mensajeError, color = Color(0xFFC62828), fontSize = 13.sp)
            }

            Spacer(Modifier.height(24.dp))

            Button(
                onClick = {
                    if (!esCorreoInstitucional(correo)) {
                        errorLocal = null
                        sesion.limpiarError()
                        errorLocal = msgCorreoInvalido
                    } else if (clave.isBlank()) {
                        errorLocal = msgPasswordVacio
                    } else {
                        errorLocal = null
                        sesion.entrar(correo, clave) { onExito(it) }
                    }
                },
                enabled = !cargando,
                shape = RoundedCornerShape(28.dp),
                colors = ButtonDefaults.buttonColors(containerColor = VERDE),
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                Text(
                    text = if (cargando) stringResource(R.string.login_entrando) else stringResource(R.string.login_entrar),
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }

            Spacer(Modifier.height(20.dp))
            Text(
                text = stringResource(R.string.login_nota_publico),
                color = Color(0xFF5C6873),
                fontSize = 12.sp
            )
        }
    }
}
