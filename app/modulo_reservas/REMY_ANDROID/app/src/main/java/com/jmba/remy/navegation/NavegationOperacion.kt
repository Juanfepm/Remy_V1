package com.jmba.remy.navegation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.compose.ui.window.DialogProperties
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.dialog
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.jmba.remy.view.operacion.ReservaEventos.DetalleReservaEvento.DetalleReservaEventoScreen
import com.jmba.remy.view.operacion.ReservaEventos.ReservaEventosScreen

@Composable
fun NavegationOperacion(
    navController: NavHostController = rememberNavController(),
    onOpenDrawer: () -> Unit = {}
) {
    NavHost(navController = navController, startDestination = "eventos") {
        composable("eventos") {
            ReservaEventosScreen(
                onEventoClick = { idEvento ->
                    navController.navigate("detalle/$idEvento")
                },
                onOpenDrawer = onOpenDrawer
            )
        }
        dialog(
            route = "detalle/{idEvento}",
            arguments = listOf(navArgument("idEvento") { }),
            dialogProperties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            DetalleReservaEventoScreen(
                onGoCerrar = { navController.popBackStack() }
            )
        }
    }
}
