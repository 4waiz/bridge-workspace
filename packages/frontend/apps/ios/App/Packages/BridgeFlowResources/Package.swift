// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "BridgeFlowResources",
  products: [
    .library(
      name: "BridgeFlowResources",
      targets: ["BridgeFlowResources"]
    ),
  ],
  targets: [
    .target(
      name: "BridgeFlowResources",
      resources: [
        .process("Resources/Icons.xcassets"),
        .process("Resources/Colors.xcassets"),
      ]
    ),
  ]
)
