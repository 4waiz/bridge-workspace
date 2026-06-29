// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class ListUserAccessTokensQuery: GraphQLQuery {
  public static let operationName: String = "listUserAccessTokens"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query listUserAccessTokens { currentUser { __typename revealedAccessTokens { __typename id name createdAt expiresAt token } } }"#
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
        .field("revealedAccessTokens", [RevealedAccessToken].self),
      ] }

      public var revealedAccessTokens: [RevealedAccessToken] { __data["revealedAccessTokens"] }

      /// CurrentUser.RevealedAccessToken
      ///
      /// Parent Type: `RevealedAccessToken`
      public struct RevealedAccessToken: BridgeFlowGraphQL.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.RevealedAccessToken }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("id", String.self),
          .field("name", String.self),
          .field("createdAt", BridgeFlowGraphQL.DateTime.self),
          .field("expiresAt", BridgeFlowGraphQL.DateTime?.self),
          .field("token", String.self),
        ] }

        public var id: String { __data["id"] }
        public var name: String { __data["name"] }
        public var createdAt: BridgeFlowGraphQL.DateTime { __data["createdAt"] }
        public var expiresAt: BridgeFlowGraphQL.DateTime? { __data["expiresAt"] }
        public var token: String { __data["token"] }
      }
    }
  }
}
