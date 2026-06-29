//
//  SKUnit+AI.swift
//  BridgeFlowPaywall
//
//  Created by qaq on 9/18/25.
//

import Foundation

extension SKUnit {
  static let aiUnits: [SKUnit] = [
    SKUnit(
      category: SKUnitCategory.ai,
      primaryText: "BRIDGEFLOW AI",
      secondaryText: "A true multimodal AI copilot.",
      package: [
        SKUnitPackageOption(
          price: "...", // Will be populated from App Store
          description: "",
          isDefaultSelected: true,
          primaryTitle: "...", // Will be populated from App Store
          secondaryTitle: "",
          productIdentifier: "app.bridgeflow.pro.ai.Annual",
          revenueCatIdentifier: "app.bridgeflow.pro.ai.Annual"
        ),
      ]
    ),
  ]
}
