package app.bridgeflow.pro.utils.logger

import timber.log.Timber

class BridgeFlowDebugTree : Timber.DebugTree() {

    override fun createStackElementTag(element: StackTraceElement): String {
        return "BridgeFlow:${super.createStackElementTag(element)}:${element.lineNumber}"
    }
}