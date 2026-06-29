// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class GetCurrentUserFeaturesQuery: GraphQLQuery {
  public static let operationName: String = "getCurrentUserFeatures"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query getCurrentUserFeatures { currentUser { __typename id name email emailVerified avatarUrl features } }"#
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
        .field("name", String.self),
        .field("email", String.self),
        .field("emailVerified", Bool.self),
        .field("avatarUrl", String?.self),
        .field("features", [GraphQLEnum<BridgeFlowGraphQL.FeatureType>].self),
      ] }

      public var id: BridgeFlowGraphQL.ID { __data["id"] }
      /// User name
      public var name: String { __data["name"] }
      /// User email
      public var email: String { __data["email"] }
      /// User email verified
      public var emailVerified: Bool { __data["emailVerified"] }
      /// User avatar url
      public var avatarUrl: String? { __data["avatarUrl"] }
      /// Enabled features of a user
      public var features: [GraphQLEnum<BridgeFlowGraphQL.FeatureType>] { __data["features"] }
    }
  }
}
