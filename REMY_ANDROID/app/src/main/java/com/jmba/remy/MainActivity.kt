package com.jmba.remy

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
import androidx.compose.foundation.layout.*
import androidx.compose.ui.graphics.Color
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.PreviewScreenSizes
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch

import com.jmba.remy.navegation.NavegationOperacion
import com.jmba.remy.navegation.NavegationReservas
import com.jmba.remy.ui.theme.REMYTheme
import com.jmba.remy.view.menu.AgregarReservaScreen
import com.jmba.remy.view.menu.MenuScreen
import com.jmba.remy.view.reservas.ReservasScreen as ReservasClienteScreen
import com.jmba.remy.view.menu.ReservasScreen as ProgramacionScreen
import com.jmba.remy.view.menu.ReservasScreen
import com.jmba.remy.view.operacion.ReservaAprendiz.ReservaAprendizScreen
import com.jmba.remy.view.operacion.ReservaDia.ReservasScreen as ReservasDiaScreen
import com.jmba.remy.view.reservas.ReservasViewModel
import com.jmba.remy.view.reservas.ExperienciasViewModel
import com.jmba.remy.view.admin_evento.EventoViewModel as EventoAdminViewModel
import com.jmba.remy.view.menu.EventoViewModel as EventoDiaViewModel
import com.jmba.remy.view.menu.MenuViewModel
import com.jmba.remy.view.experiencia.ExperienciaScreen
import com.jmba.remy.view.admin_evento.EventoScreen
import com.jmba.remy.view.cliente_evento.EventoClienteScreen
import com.jmba.remy.view.operacion.ReservaEventos.ReservaEventosScreen as ReservaEventosListScreen
import com.jmba.remy.view.operacion.ReservaEventos.DetalleReservaEvento.DetalleReservaEventoScreen
import com.jmba.remy.view.login.SesionViewModel
import com.jmba.remy.view.login.LoginScreen

class MainActivity : ComponentActivity() {

    // ViewModels
    private val reservasController: ReservasViewModel by viewModels()
    private val experienciasController: ExperienciasViewModel by viewModels()
    private val menuController: MenuViewModel by viewModels()
    private val eventoDiaController: EventoDiaViewModel by viewModels()
    private val eventoAdminController: EventoAdminViewModel by viewModels()
    private val sesionController: SesionViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            REMYTheme {
                REMYApp(
                    reservasController     = reservasController,
                    experienciasController = experienciasController,
                    menuController         = menuController,
                    eventoDiaController    = eventoDiaController,
                    eventoAdminController  = eventoAdminController,
                    sesionController       = sesionController
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@PreviewScreenSizes
@Composable
fun REMYApp(
    reservasController: ReservasViewModel = viewModel(),
    experienciasController: ExperienciasViewModel = viewModel(),
    menuController: MenuViewModel = viewModel(),
    eventoDiaController: EventoDiaViewModel = viewModel(),
    eventoAdminController: EventoAdminViewModel = viewModel(),
    sesionController: SesionViewModel = viewModel()
) {
    var currentDestination by rememberSaveable { mutableStateOf(AppDestinations.MENU) }
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    val usuario by sesionController.usuario.collectAsState()

    // Manejo del botón atrás del sistema
    BackHandler(enabled = currentDestination != AppDestinations.MENU) {
        currentDestination = AppDestinations.MENU
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(
                drawerContainerColor = Color.White,
                modifier = Modifier.width(300.dp)
            ) {
                Spacer(Modifier.height(45.dp))

                // Item del menu lateral
                val itemCajon: @Composable (AppDestinations) -> Unit = { destination ->
                    NavigationDrawerItem(
                        icon = {
                            Icon(
                                painter = painterResource(destination.icon),
                                contentDescription = null,
                                modifier = Modifier.size(24.dp)
                            )
                        },
                        label = {
                            Text(
                                text = stringResource(destination.label),
                                fontWeight = FontWeight.Medium,
                                fontSize = 14.sp
                            )
                        },
                        selected = destination == currentDestination,
                        onClick = {
                            currentDestination = destination
                            scope.launch { drawerState.close() }
                        },
                        modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding),
                        colors = NavigationDrawerItemDefaults.colors(
                            selectedContainerColor = Color(0xFFE9E8E8),
                            selectedIconColor = Color(0xFF1A3A5C),
                            selectedTextColor = Color(0xFF1A3A5C),
                            unselectedContainerColor = Color.Transparent,
                            unselectedIconColor = Color(0xFF1A3A5C),
                            unselectedTextColor = Color(0xFF1A3A5C)
                        )
                    )
                }

                // Encabezado
                val tituloSeccion: @Composable (Int) -> Unit = { textoRes ->
                    Text(
                        text = stringResource(textoRes),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF7A8794),
                        modifier = Modifier.padding(start = 28.dp, top = 10.dp, bottom = 4.dp)
                    )
                }

                // Interfaces del cliente
                tituloSeccion(R.string.drawer_grupo_cliente)
                AppDestinations.entries
                    .filter { it.showInDrawer && it.grupo == GrupoMenu.CLIENTE }
                    .forEach { itemCajon(it) }

                HorizontalDivider(
                    color = Color(0xFFE9E8E8),
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp)
                )

                // Gestion
                val u = usuario
                if (u == null) {
                    NavigationDrawerItem(
                        icon = { Icon(painterResource(R.drawable.ic_person), null, Modifier.size(24.dp)) },
                        label = { Text(stringResource(R.string.nav_iniciar_sesion), fontWeight = FontWeight.Medium, fontSize = 14.sp) },
                        selected = currentDestination == AppDestinations.LOGIN,
                        onClick = { currentDestination = AppDestinations.LOGIN; scope.launch { drawerState.close() } },
                        modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding),
                        colors = NavigationDrawerItemDefaults.colors(
                            selectedContainerColor = Color(0xFFE9E8E8),
                            selectedIconColor = Color(0xFF1A3A5C), selectedTextColor = Color(0xFF1A3A5C),
                            unselectedContainerColor = Color.Transparent,
                            unselectedIconColor = Color(0xFF1A3A5C), unselectedTextColor = Color(0xFF1A3A5C)
                        )
                    )
                } else {
                    tituloSeccion(R.string.drawer_grupo_gestion)
                    Text(
                        text = stringResource(if (u.rol == 1) R.string.sesion_rol_instructor else R.string.sesion_rol_aprendiz),
                        fontSize = 11.sp, color = Color(0xFF39A900),
                        modifier = Modifier.padding(start = 28.dp, bottom = 6.dp)
                    )
                    AppDestinations.entries
                        .filter { it.showInDrawer && it.grupo == GrupoMenu.ADMIN && (u.rol == 1 || !it.soloInstructor) }
                        .forEach { itemCajon(it) }

                    HorizontalDivider(color = Color(0xFFE9E8E8), modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp))
                    NavigationDrawerItem(
                        icon = { Icon(painterResource(R.drawable.ic_close), null, Modifier.size(24.dp)) },
                        label = { Text(stringResource(R.string.nav_cerrar_sesion), fontWeight = FontWeight.Medium, fontSize = 14.sp) },
                        selected = false,
                        onClick = { sesionController.salir(); currentDestination = AppDestinations.MENU; scope.launch { drawerState.close() } },
                        modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding),
                        colors = NavigationDrawerItemDefaults.colors(
                            unselectedContainerColor = Color.Transparent,
                            unselectedIconColor = Color(0xFF1A3A5C), unselectedTextColor = Color(0xFF1A3A5C)
                        )
                    )
                }

            }
        }
    ) {
        val overlayVisible by experienciasController.mostrarOverlay.collectAsState()
        val showBottomBar = currentDestination in listOf(AppDestinations.MENU, AppDestinations.RESERVAS, AppDestinations.EVENTOS_CLIENTE) && !overlayVisible
        
        Scaffold(
            containerColor = Color.White,
            bottomBar = {
                if (showBottomBar) {
                    NavigationBar(
                        containerColor = Color.White,
                        tonalElevation = 8.dp
                    ) {
                        NavigationBarItem(
                            icon = { Icon(painterResource(R.drawable.ic_eventos), contentDescription = null, modifier = Modifier.size(32.dp)) },
                            label = { Text(stringResource(R.string.nav_menu_dia), fontSize = 12.sp) },
                            selected = currentDestination == AppDestinations.MENU,
                            onClick = { currentDestination = AppDestinations.MENU },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFF39A900),
                                selectedTextColor = Color(0xFF39A900),
                                unselectedIconColor = Color.Gray,
                                unselectedTextColor = Color.Gray,
                                indicatorColor = Color.Transparent
                            )
                        )
                        NavigationBarItem(
                            icon = { Icon(painterResource(R.drawable.ic_calendario), contentDescription = null, modifier = Modifier.size(26.dp)) },
                            label = { Text(stringResource(R.string.nav_reservas), fontSize = 12.sp) },
                            selected = currentDestination == AppDestinations.RESERVAS,
                            onClick = { currentDestination = AppDestinations.RESERVAS },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFF39A900),
                                selectedTextColor = Color(0xFF39A900),
                                unselectedIconColor = Color.Gray,
                                unselectedTextColor = Color.Gray,
                                indicatorColor = Color.Transparent
                            )
                        )
                        NavigationBarItem(
                            icon = { Icon(painterResource(R.drawable.ic_estrella), contentDescription = null, modifier = Modifier.size(26.dp)) },
                            label = { Text(stringResource(R.string.cliente_bar_eventos), fontSize = 12.sp) },
                            selected = currentDestination == AppDestinations.EVENTOS_CLIENTE,
                            onClick = { currentDestination = AppDestinations.EVENTOS_CLIENTE },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFF39A900),
                                selectedTextColor = Color(0xFF39A900),
                                unselectedIconColor = Color.Gray,
                                unselectedTextColor = Color.Gray,
                                indicatorColor = Color.Transparent
                            )
                        )
                    }
                }
            }
        ) { innerPadding ->
            Box(modifier = Modifier.padding(innerPadding)) {
                val onBackToMenu = { currentDestination = AppDestinations.MENU }

                val u = usuario
                val bloqueado = currentDestination.grupo == GrupoMenu.ADMIN &&
                        currentDestination != AppDestinations.LOGIN &&
                        (u == null || (u.rol != 1 && currentDestination.soloInstructor))

                if (currentDestination == AppDestinations.LOGIN || bloqueado) {
                    LoginScreen(
                        sesion = sesionController,
                        onOpenDrawer = { scope.launch { drawerState.open() } },
                        onExito = { usr ->
                            currentDestination = if (usr.rol == 1) AppDestinations.PROGRAMACION else AppDestinations.RESERVAS_DIA
                        }
                    )
                } else when (currentDestination) {
                    AppDestinations.MENU         -> MenuScreen(menuController, eventoDiaController, onOpenDrawer = { scope.launch { drawerState.open() } })
                    AppDestinations.RESERVAS     -> ReservasClienteScreen(reservasController, onOpenDrawer = { scope.launch { drawerState.open() } }, vmExp = experienciasController)
                    AppDestinations.EVENTOS_ADMIN -> EventoScreen(eventoAdminController, onBack = onBackToMenu, onOpenDrawer = { scope.launch { drawerState.open() } })
                    AppDestinations.PROGRAMACION -> ProgramacionScreen(eventoDiaController, onOpenDrawer = { scope.launch { drawerState.open() } })
                    AppDestinations.AGREGAR      -> AgregarReservaScreen(eventoDiaController, onOpenDrawer = { scope.launch { drawerState.open() } })
                    AppDestinations.OPERACION    -> NavegationOperacion(onOpenDrawer = { scope.launch { drawerState.open() } })
                    AppDestinations.APRENDIZ     -> ReservaAprendizScreen(onBackClick = onBackToMenu, onOpenDrawer = { scope.launch { drawerState.open() } })
                    AppDestinations.RESERVAS_DIA -> ReservasDiaScreen(onBackClick = onBackToMenu, onOpenDrawer = { scope.launch { drawerState.open() } })
                    AppDestinations.EXPERIENCIAS -> ExperienciaScreen(eventoAdminController, onBack = onBackToMenu, onGoInsertar = { }, onOpenDrawer = { scope.launch { drawerState.open() } })
                    AppDestinations.EVENTOS_CLIENTE -> EventoClienteScreen(eventoAdminController, onOpenDrawer = { scope.launch { drawerState.open() } })
                    AppDestinations.DETALLE_RESERVA -> DetalleReservaEventoScreen(onGoCerrar = { currentDestination = AppDestinations.OPERACION })
                    AppDestinations.LOGIN -> { }
                }
            }
        }
    }
}

enum class GrupoMenu { CLIENTE, ADMIN }

enum class AppDestinations(
    @StringRes val label: Int,
    @DrawableRes val icon: Int,
    val grupo: GrupoMenu = GrupoMenu.ADMIN,
    val soloInstructor: Boolean = false,   // true = solo el instructor; el aprendiz no lo ve
    val showInDrawer: Boolean = true
) {
    // Cliente
    MENU(R.string.nav_menu_dia, R.drawable.ic_menu, GrupoMenu.CLIENTE),
    RESERVAS(R.string.nav_reservas, R.drawable.ic_reservas, GrupoMenu.CLIENTE),
    EVENTOS_CLIENTE(R.string.cliente_titulo, R.drawable.ic_eventos, GrupoMenu.CLIENTE),

    // Aprendiz
    RESERVAS_DIA(R.string.title, R.drawable.ic_calendare),
    OPERACION(R.string.ReservasEventos, R.drawable.ic_reservas),
    AGREGAR(R.string.nav_agregar, R.drawable.ic_add),
    APRENDIZ(R.string.titulo_aprendiz, R.drawable.ic_person),

    // Instructor
    PROGRAMACION(R.string.nav_programacion, R.drawable.ic_calendar, soloInstructor = true),
    EVENTOS_ADMIN(R.string.titulo_admin_eventos, R.drawable.ic_eventos, soloInstructor = true),
    EXPERIENCIAS(R.string.exp_titulo, R.drawable.ic_favorite, soloInstructor = true),

    // Login
    LOGIN(R.string.login_titulo, R.drawable.ic_person, GrupoMenu.CLIENTE, showInDrawer = false),

    // Ocultos
    DETALLE_RESERVA(R.string.op_detalle_evento, R.drawable.ic_search, showInDrawer = false),
}
