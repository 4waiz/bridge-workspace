import Foundation

final class AppConfigManager {
  struct AppConfig: Decodable {
    let bridgeflowVersion: String
  }

  static var bridgeflowVersion: String?

  static func getBridgeFlowVersion() -> String {
    if bridgeflowVersion == nil {
      let file = Bundle(for: AppConfigManager.self).url(forResource: "capacitor.config", withExtension: "json")!
      let data = try! Data(contentsOf: file)
      let config = try! JSONDecoder().decode(AppConfig.self, from: data)
      bridgeflowVersion = config.bridgeflowVersion
    }

    return bridgeflowVersion!
  }
}
