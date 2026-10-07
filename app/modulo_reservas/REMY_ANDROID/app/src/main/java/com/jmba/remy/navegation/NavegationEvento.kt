package com.jmba.remy.navegation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.jmba.remy.view.admin_evento.EventoScreen
import com.jmba.remy.view.admin_evento.EventoViewModel
import com.jmba.remy.view.cliente_evento.EventoClienteScreen
import com.jmba.remy.view.experiencia.ExperienciaScreen

@Composable
fun NavegationEvento(
    viewModelEvento: EventoViewModel
) {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "experiencias") {

        composable("eventos") {
            EventoClienteScreen(viewModel = viewModelEvento)
        }
        composable("administrador/evento") {
            EventoScreen(
                viewModel = viewModelEvento,
                onBack = { navController.popBackStack() }
            )
        }
        composable("experiencias") {
            ExperienciaScreen(
                viewModel = viewModelEvento,
                onBack = { navController.popBackStack() },
                onGoInsertar = { }
            )
        }
    }
}
