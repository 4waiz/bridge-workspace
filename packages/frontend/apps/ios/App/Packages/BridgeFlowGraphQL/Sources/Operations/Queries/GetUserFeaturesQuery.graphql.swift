// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class GetUserFeaturesQuery: GraphQLQuery {
  public static let operationName: String = "getUserFeatures"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query getUserFeatures { currentUser { __typename id features } }"#
    ))

  public init() {}

  public struct Data: BridgeFlowGraphQL.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("currentUser", CurrentUser?.self),
    ] }

    /// Get current user
    public var currentUser: CurrentUser? { __data["currentUser"] }

    /// CurrentUser
    ///
    /// Parent Type: `UserType`
    public struct CurrentUser: BridgeFlowGraphQL.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.UserType }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", BridgeFlowGraphQL.ID.self),
        .field("features", [GraphQLEnum<BridgeFlowGraphQL.FeatureType>].self),
      ] }

      public var id: BridgeFlowGraphQL.ID { __data["id"] }
      /// Enabled features of a user
      public var features: [GraphQLEnum<BridgeFlowGraphQL.FeatureType>] { __data["features"] }
    }
  }
}
