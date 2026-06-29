// The Swift Programming Language
// https://docs.swift.org/swift-book

import SwiftUI
import UIKit

public enum BridgeFlowColors: String, CaseIterable {
  case buttonPrimary = "bridgeflow.button.primary"
  case iconActivated = "bridgeflow.icon.activated"
  case iconPrimary = "bridgeflow.icon.primary"
  case layerBackgroundPrimary = "bridgeflow.layer.background.primary"
  case layerBackgroundSecondary = "bridgeflow.layer.background.secondary"
  case layerBorder = "bridgeflow.layer.border"
  case layerPureWhite = "bridgeflow.layer.pureWhite"
  case textEmphasis = "bridgeflow.text.emphasis"
  case textLink = "bridgeflow.text.link"
  case textListDotAndNumber = "bridgeflow.text.listDotAndNumber"
  case textPlaceholder = "bridgeflow.text.placeholder"
  case textPrimary = "bridgeflow.text.primary"
  case textPureWhite = "bridgeflow.text.pureWhite"
  case textSecondary = "bridgeflow.text.secondary"
  case textTertiary = "bridgeflow.text.tertiary"

  @available(iOS 13.0, *)
  public var color: Color {
    Color(rawValue, bundle: .module)
  }

  public var uiColor: UIColor {
    UIColor(named: rawValue, in: .module, compatibleWith: nil) ?? .clear
  }
}

public enum BridgeFlowIcons: String, CaseIterable {
  case arrowDown = "ArrowDown"
  case arrowUpBig = "ArrowUpBig"
  case box = "Box"
  case broom = "Broom"
  case bubble = "Bubble"
  case calendar = "Calendar"
  case camera = "Camera"
  case checkCircle = "CheckCircle"
  case close = "Close"
  case image = "Image"
  case more = "More"
  case page = "Page"
  case plus = "Plus"
  case settings = "Settings"
  case think = "Think"
  case tools = "Tools"
  case upload = "Upload"
  case web = "Web"

  @available(iOS 13.0, *)
  public var image: Image {
    Image(rawValue, bundle: .module)
  }

  @available(iOS 13.0, *)
  public var uiImage: UIImage {
    UIImage(named: rawValue, in: .module, with: .none) ?? UIImage()
  }
}
