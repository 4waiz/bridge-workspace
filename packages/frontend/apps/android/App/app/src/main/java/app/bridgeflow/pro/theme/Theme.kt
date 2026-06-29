package app.bridgeflow.pro.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable

object BridgeFlowTheme {
    val colors: BridgeFlowColorScheme
        @ReadOnlyComposable
        @Composable
        get() = LocalBridgeFlowColors.current

    val typography: BridgeFlowTypography
        @ReadOnlyComposable
        @Composable
        get() = LocalBridgeFlowTypography.current
}

@Composable
fun BridgeFlowTheme(
    mode: ThemeMode = ThemeMode.System,
    content: @Composable () -> Unit
) {
    val colors = when (mode) {
        ThemeMode.Light -> bridgeflowLightScheme
        ThemeMode.Dark -> bridgeflowDarkScheme
        ThemeMode.System -> if (isSystemInDarkTheme()) bridgeflowDarkScheme else bridgeflowLightScheme
    }

    CompositionLocalProvider(LocalBridgeFlowColors provides colors) {
        MaterialTheme {
            content()
        }
    }
}

enum class ThemeMode(name: String) {
    Light("light"),
    Dark("dark"),
    System("system");

    fun of(name: String) = when (name) {
        "light" -> Light
        "dark" -> Dark
        else -> System
    }
}