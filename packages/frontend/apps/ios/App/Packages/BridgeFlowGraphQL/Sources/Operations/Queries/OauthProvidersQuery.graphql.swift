// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class OauthProvidersQuery: GraphQLQuery {
  public static let operationName: String = "oauthProviders"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query oauthProviders { serverConfig { __typename oauthProviders } }"#
    ))

  public init() {}

  public struct Data: BridgeFlowGraphQL.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("serverConfig", ServerConfig.self),
    ] }

    /// server config
    public var serverConfig: ServerConfig { __data["serverConfig"] }

    /// ServerConfig
    ///
    /// Parent Type: `ServerConfigType`
    public struct ServerConfig: BridgeFlowGraphQL.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.ServerConfigType }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("oauthProviders", [GraphQLEnum<BridgeFlowGraphQL.OAuthProviderType>].self),
      ] }

      public var oauthProviders: [GraphQLEnum<BridgeFlowGraphQL.OAuthProviderType>] { __data["oauthProviders"] }
    }
  }
}
