// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct LicenseBody: BridgeFlowGraphQL.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment licenseBody on License { __typename expiredAt installedAt quantity recurring validatedAt variant }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.License }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("expiredAt", BridgeFlowGraphQL.DateTime?.self),
    .field("installedAt", BridgeFlowGraphQL.DateTime.self),
    .field("quantity", Int.self),
    .field("recurring", GraphQLEnum<BridgeFlowGraphQL.SubscriptionRecurring>.self),
    .field("validatedAt", BridgeFlowGraphQL.DateTime.self),
    .field("variant", GraphQLEnum<BridgeFlowGraphQL.SubscriptionVariant>?.self),
  ] }

  public var expiredAt: BridgeFlowGraphQL.DateTime? { __data["expiredAt"] }
  public var installedAt: BridgeFlowGraphQL.DateTime { __data["installedAt"] }
  public var quantity: Int { __data["quantity"] }
  public var recurring: GraphQLEnum<BridgeFlowGraphQL.SubscriptionRecurring> { __data["recurring"] }
  public var validatedAt: BridgeFlowGraphQL.DateTime { __data["validatedAt"] }
  public var variant: GraphQLEnum<BridgeFlowGraphQL.SubscriptionVariant>? { __data["variant"] }
}
