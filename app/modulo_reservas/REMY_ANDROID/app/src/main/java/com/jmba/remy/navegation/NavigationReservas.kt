package com.jmba.remy.navegation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

import com.jmba.remy.view.reservas.ReservasScreen
import com.jmba.remy.view.reservas.ReservasViewModel

@Composable
fun NavegationReservas(
    reservasController: ReservasViewModel,
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController    = navController,
        startDestination = "home"
    ) {
        composable("home") {
            ReservasScreen(
                viewModel   = reservasController,
                onContinuar = { menuSeleccionado ->
                }
            )
        }


    }
}
