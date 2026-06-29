package app.bridgeflow.pro

import android.webkit.WebView
import app.bridgeflow.pro.service.CookieStore
import app.bridgeflow.pro.utils.dataStore
import app.bridgeflow.pro.utils.get
import app.bridgeflow.pro.utils.getCurrentServerBaseUrl
import app.bridgeflow.pro.utils.logger.FileTree
import com.getcapacitor.Bridge
import com.getcapacitor.WebViewListener
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import okhttp3.Cookie
import okhttp3.HttpUrl.Companion.toHttpUrl
import timber.log.Timber

object AuthInitializer {

    fun initialize(bridge: Bridge) {
        bridge.addWebViewListener(object : WebViewListener() {
            override fun onPageLoaded(webView: WebView?) {
                bridge.removeWebViewListener(this)
                MainScope().launch(Dispatchers.IO) {
                    try {
                        val server = bridge.getCurrentServerBaseUrl().toHttpUrl()
                        val sessionCookieStr = BridgeFlowApp.context().dataStore
                            .get(server.host + CookieStore.BRIDGEFLOW_SESSION)
                        val userIdCookieStr = BridgeFlowApp.context().dataStore
                            .get(server.host + CookieStore.BRIDGEFLOW_USER_ID)
                        val csrfCookieStr = BridgeFlowApp.context().dataStore
                            .get(server.host + CookieStore.BRIDGEFLOW_CSRF_TOKEN)
                        if (sessionCookieStr.isEmpty() || userIdCookieStr.isEmpty() || csrfCookieStr.isEmpty()) {
                            Timber.i("[init] user has not signed in yet.")
                            return@launch
                        }
                        Timber.i("[init] user already signed in.")
                        val cookies = listOf(
                            Cookie.parse(server, sessionCookieStr)
                                ?: error("Parse session cookie fail:[ cookie = $sessionCookieStr ]"),
                            Cookie.parse(server, userIdCookieStr)
                                ?: error("Parse user id cookie fail:[ cookie = $userIdCookieStr ]"),
                            Cookie.parse(server, csrfCookieStr)
                                ?: error("Parse csrf token cookie fail:[ cookie = $csrfCookieStr ]"),
                        )
                        CookieStore.saveCookies(server.host, cookies)
                        FileTree.get()?.checkAndUploadOldLogs(server)
                    } catch (e: Exception) {
                        Timber.w(e, "[init] load persistent cookies fail.")
                    }
                }
            }
        })
    }

}
