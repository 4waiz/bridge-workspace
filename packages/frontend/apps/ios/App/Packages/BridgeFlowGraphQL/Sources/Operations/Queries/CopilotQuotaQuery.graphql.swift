// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class CopilotQuotaQuery: GraphQLQuery {
  public static let operationName: String = "copilotQuota"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query copilotQuota { currentUser { __typename copilot { __typename quota { __typename limit used } } } }"#
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
        .field("copilot", Copilot.self),
      ] }

      public var copilot: Copilot { __data["copilot"] }

      /// CurrentUser.Copilot
      ///
      /// Parent Type: `Copilot`
      public struct Copilot: BridgeFlowGraphQL.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.Copilot }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("quota", Quota.self),
        ] }

        /// Get the quota of the user in the workspace
        public var quota: Quota { __data["quota"] }

        /// CurrentUser.Copilot.Quota
        ///
        /// Parent Type: `CopilotQuota`
        public struct Quota: BridgeFlowGraphQL.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.CopilotQuota }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("limit", BridgeFlowGraphQL.SafeInt?.self),
            .field("used", BridgeFlowGraphQL.SafeInt.self),
          ] }

          public var limit: BridgeFlowGraphQL.SafeInt? { __data["limit"] }
          public var used: BridgeFlowGraphQL.SafeInt { __data["used"] }
        }
      }
    }
  }
}
