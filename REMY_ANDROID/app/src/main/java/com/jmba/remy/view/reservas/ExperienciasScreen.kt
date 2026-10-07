package com.jmba.remy.view.reservas

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.jmba.remy.R
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelExperiencia
import java.text.NumberFormat
import java.util.Locale

// Overlay principal

@Composable
fun ExperienciasOverlay(
    viewModel   : ExperienciasViewModel,
    visible     : Boolean,
    onNoGracias : () -> Unit
) {
    val lista by viewModel.listaExperiencias.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) { viewModel.visualiza() }

    AnimatedVisibility(
        visible = visible,
        enter   = fadeIn() + slideInVertically(initialOffsetY = { it / 4 }),
        exit    = fadeOut() + slideOutVertically(targetOffsetY  = { it / 4 })
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.55f))
                .clickable(
                    indication = null,
                    interactionSource = remember { MutableInteractionSource() }
                ) { onNoGracias() }
        ) {
            Column(modifier = Modifier.fillMaxSize()) {

                Spacer(Modifier.height(72.dp))

                // Botón "No, gracias X"
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(end = 16.dp),
                    horizontalArrangement = Arrangement.End
                ) {
                    Surface(
                        onClick         = { onNoGracias() },
                        shape           = RoundedCornerShape(50),
                        color           = Color.White,
                        shadowElevation = 4.dp
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text       = stringResource(R.string.res_no_gracias),
                                fontSize   = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color      = Color.DarkGray
                            )
                            Spacer(Modifier.width(6.dp))
                            Icon(
                                imageVector        = Icons.Default.Close,
                                contentDescription = stringResource(R.string.cerrar),
                                modifier           = Modifier.size(16.dp),
                                tint               = Color.DarkGray
                            )
                        }
                    }
                }

                Spacer(Modifier.height(8.dp))

                // Lista de tarjetas
                LazyColumn(
                    contentPadding      = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp),
                    modifier            = Modifier.fillMaxSize()
                ) {
                    items(lista) { experiencia ->
                        ExperienciaCard(
                            experiencia = experiencia,
                            onAceptar   = { viewModel.seleccionar(it) }
                        )
                    }
                }
            }
        }
    }
}

// Tarjeta individual de experiencia

@Composable
fun ExperienciaCard(
    experiencia: ModelExperiencia,
    onAceptar  : (ModelExperiencia) -> Unit
) {
    val precioFormateado = experiencia.Precio?.let {
        NumberFormat.getNumberInstance(Locale("es", "CO")).format(it)
    } ?: "0"

    Card(
        modifier  = Modifier.fillMaxWidth(),
        shape     = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        colors    = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column {

            // Imagen con texto superpuesto
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(190.dp)
            ) {
                AsyncImage(
                    model              = "${ConexionService.urlImgExperiencias}${experiencia.ImgExperiencia}",
                    contentDescription = experiencia.Nombre,
                    contentScale       = ContentScale.Crop,
                    modifier           = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
                )

                // Degradado
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Black.copy(alpha = 0.25f),
                                    Color.Black.copy(alpha = 0.75f)
                                )
                            )
                        )
                )

                // Badge + título
                Column(
                    modifier            = Modifier
                        .fillMaxSize()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Surface(
                        shape = RoundedCornerShape(50),
                        color = Color(0xFFF4956A)
                    ) {
                        Text(
                            text       = stringResource(R.string.res_experiencia),
                            modifier   = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                            color      = Color.White,
                            fontSize   = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    Column {
                        Text(
                            text       = stringResource(R.string.res_deseas_agregar),
                            color      = Color.White,
                            fontSize   = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text       = stringResource(R.string.res_tu_reserva_experiencia),
                            color      = Color.White,
                            fontSize   = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text       = stringResource(R.string.res_de_experiencia, experiencia.Nombre ?: ""),
                            color      = Color(0xFFE8C46A),
                            fontSize   = 18.sp,
                            fontStyle  = FontStyle.Italic,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Descripción
            Text(
                text       = experiencia.Descripcion ?: "",
                modifier   = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                color      = Color(0xFF555555),
                fontSize   = 13.sp,
                lineHeight = 18.sp
            )

            // Precio + botón
            Row(
                modifier              = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, end = 16.dp, bottom = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment     = Alignment.CenterVertically
            ) {
                Text(
                    text       = stringResource(R.string.formato_precio, precioFormateado),
                    color      = Color(0xFF2E7D32),
                    fontSize   = 24.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Button(
                    onClick        = { onAceptar(experiencia) },
                    colors         = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32)),
                    shape          = RoundedCornerShape(50),
                    contentPadding = PaddingValues(horizontal = 28.dp, vertical = 12.dp)
                ) {
                    Text(
                        text       = stringResource(R.string.res_si_quiero),
                        color      = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize   = 15.sp
                    )
                }
            }
        }
    }
}
