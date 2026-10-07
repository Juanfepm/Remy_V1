package com.jmba.remy.view.reservas

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
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
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.jmba.remy.R
import com.jmba.remy.conexion.ConexionService
import com.jmba.remy.model.ModelMenu

// Colores
private val ColorPrimarioLoc = Color(0xFF1A3A5C)
private val ColorVerdeLoc    = Color(0xFF39A900)
private val ColorFondoLoc    = Color(0xFFFAFAFA)
private val ColorTarjeta     = Color(0xFFFFFFFF)
private val ColorTituloCard  = Color(0xFF333333)
private val ColorDescCard    = Color(0xFF777777)
private val ColorTiemposCard = Color(0xFF999999)

// Utilidades
fun formatoPrecio(valor: Int?): String {
    if (valor == null) return "0"
    return String.format("%,d", valor).replace(',', '.')
}


// Screen
@Composable
fun ReservasScreen(
    viewModel  : ReservasViewModel     = viewModel(),
    onContinuar: (ModelMenu) -> Unit   = {},
    onOpenDrawer: () -> Unit           = {},
    vmExp: ExperienciasViewModel       = viewModel()
) {
    LaunchedEffect(Unit) { viewModel.visualiza() }

    val listaMenus by viewModel.listaMenus.collectAsStateWithLifecycle()
    var seleccionado by remember { mutableIntStateOf(-1) }

    val mostrarOverlay by vmExp.mostrarOverlay.collectAsStateWithLifecycle()
    val experienciaSeleccionada by vmExp.seleccionada.collectAsStateWithLifecycle()

    val vmReserva: ReservaEventoViewModel = viewModel()
    var mostrarReservaEvento by remember { mutableStateOf(false) }

    LaunchedEffect(experienciaSeleccionada) {
        if (experienciaSeleccionada != null && seleccionado >= 0) {
            mostrarReservaEvento = true
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {

        Scaffold(
            containerColor = Color.White,
            topBar = {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(ColorPrimarioLoc)
                        .padding(top = 45.dp, bottom = 20.dp)
                ) {
                    IconButton(
                        onClick = onOpenDrawer,
                        modifier = Modifier.align(Alignment.CenterStart).padding(start = 8.dp)
                    ) {
                        Icon(Icons.Default.Menu, contentDescription = null, tint = Color.White)
                    }

                    Text(
                        text = stringResource(R.string.nav_reservas),
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            },
            bottomBar = {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White)
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                ) {
                    Button(
                        onClick = {
                            if (seleccionado >= 0) {
                                vmExp.mostrarOverlay()
                            }
                        },
                        enabled  = seleccionado >= 0,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp),
                        shape    = RoundedCornerShape(12.dp),
                        colors   = ButtonDefaults.buttonColors(
                            containerColor = ColorVerdeLoc,
                            contentColor   = Color.White,
                            disabledContainerColor = Color.LightGray
                        )
                    ) {
                        Text(
                            text       = stringResource(R.string.res_continuar_reserva).uppercase(),
                            fontSize   = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .background(ColorFondoLoc)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text       = stringResource(R.string.res_selecciona_menu),
                            fontWeight = FontWeight.Bold,
                            fontSize   = 16.sp,
                            color      = ColorTituloCard
                        )
                        Text(
                            text     = stringResource(R.string.res_elige_menu),
                            fontSize = 13.sp,
                            color    = ColorDescCard
                        )
                    }
                }

                LazyColumn(
                    modifier       = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(bottom = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    itemsIndexed(listaMenus) { index, menu ->
                        MenuCard(
                            menu       = menu,
                            isSelected = seleccionado == index,
                            onClick    = { seleccionado = index }
                        )
                    }
                }
            }
        }

        ExperienciasOverlay(
            viewModel = vmExp,
            visible   = mostrarOverlay,
            onNoGracias = {
                vmExp.ocultarOverlay()
                if (seleccionado >= 0 && seleccionado < listaMenus.size) {
                    mostrarReservaEvento = true
                }
            }
        )

        if (mostrarReservaEvento && seleccionado >= 0 && seleccionado < listaMenus.size) {
            val menuElegido = listaMenus[seleccionado]
            ReservaEventoScreen(
                idMenu            = menuElegido.IdMenu.orEmpty(),
                precioMenu        = menuElegido.Precio ?: 0,
                experiencia       = experienciaSeleccionada?.Nombre?.take(64).orEmpty(),
                precioExperiencia = experienciaSeleccionada?.Precio ?: 0,
                viewModelReserva  = vmReserva,
                onGoCerrar = {
                    mostrarReservaEvento = false
                    vmExp.limpiarSeleccion()
                },
                onReservaCreada = {
                    onContinuar(menuElegido)
                    mostrarReservaEvento = false
                    vmExp.limpiarSeleccion()
                    seleccionado = -1
                }
            )
        }
    }
}

@Composable
fun MenuCard(
    menu      : ModelMenu,
    isSelected: Boolean,
    onClick   : () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .height(135.dp)
            .clickable { onClick() },
        shape    = RoundedCornerShape(16.dp),
        colors   = CardDefaults.cardColors(containerColor = ColorTarjeta),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(modifier = Modifier.fillMaxSize()) {
            // Imagen
            AsyncImage(
                model              = "${ConexionService.urlImagenes}${menu.ImgMenu}",
                contentDescription = menu.Nombre,
                contentScale       = ContentScale.Crop,
                modifier           = Modifier
                    .width(115.dp)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(topStart = 16.dp, bottomStart = 16.dp)),
                error = painterResource(R.drawable.ic_imagen_defecto)
            )

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(12.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Título y RadioButton
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text       = menu.Nombre ?: "",
                        fontWeight = FontWeight.Bold,
                        fontSize   = 16.sp,
                        color      = ColorTituloCard,
                        maxLines = 1,
                        modifier   = Modifier.weight(1f)
                    )
                    RadioButton(
                        selected = isSelected,
                        onClick  = null,
                        colors   = RadioButtonDefaults.colors(selectedColor = ColorVerdeLoc)
                    )
                }

                // Descripción
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text     = menu.Descripcion ?: "",
                    fontSize = 11.sp,
                    color    = ColorDescCard,
                    maxLines = 2,
                    lineHeight = 14.sp
                )

                // Tiempos y precio
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment     = Alignment.Bottom
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(bottom = 2.dp)
                    ) {
                        Icon(
                            painter = painterResource(R.mipmap.ic_bandejas_foreground),
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = ColorTiemposCard
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text     = stringResource(R.string.menu_tiempos, menu.TiemposMenu ?: 0),
                            fontSize = 11.sp,
                            color    = ColorTiemposCard
                        )
                    }
                    
                    Text(
                        text       = stringResource(R.string.menu_precio_formato, formatoPrecio(menu.Precio)),
                        fontWeight = FontWeight.ExtraBold,
                        fontSize   = 18.sp,
                        color      = ColorVerdeLoc
                    )
                }
            }
        }
    }
}
