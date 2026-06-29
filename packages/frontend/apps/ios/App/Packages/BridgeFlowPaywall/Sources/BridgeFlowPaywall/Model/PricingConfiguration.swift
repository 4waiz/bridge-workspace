//
//  PricingConfiguration.swift
//  BridgeFlowPaywall
//
//  Created by Claude Code on 9/29/25.
//

import Foundation

enum PricingConfiguration {
  static let proMonthly = ProductConfiguration(
    productIdentifier: "app.bridgeflow.pro.Monthly",
    revenueCatIdentifier: "app.bridgeflow.pro.Monthly",
    description: "Monthly",
    isDefaultSelected: false
  )

  static let proAnnual = ProductConfiguration(
    productIdentifier: "app.bridgeflow.pro.Annual",
    revenueCatIdentifier: "app.bridgeflow.pro.Annual",
    description: "Annual",
    badge: "Save 15%",
    isDefaultSelected: true
  )

  static let aiAnnual = ProductConfiguration(
    productIdentifier: "app.bridgeflow.pro.ai.Annual",
    revenueCatIdentifier: "app.bridgeflow.pro.ai.Annual",
    description: "",
    isDefaultSelected: true
  )
}

struct ProductConfiguration {
  let productIdentifier: String
  let revenueCatIdentifier: String
  let description: String
  let badge: String?
  let isDefaultSelected: Bool

  init(
    productIdentifier: String,
    revenueCatIdentifier: String,
    description: String,
    badge: String? = nil,
    isDefaultSelected: Bool = false
  ) {
    self.productIdentifier = productIdentifier
    self.revenueCatIdentifier = revenueCatIdentifier
    self.description = description
    self.badge = badge
    self.isDefaultSelected = isDefaultSelected
  }
}
