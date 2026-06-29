// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class GetWorkspacesQuery: GraphQLQuery {
  public static let operationName: String = "getWorkspaces"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query getWorkspaces { workspaces { __typename id initialized team owner { __typename id } } }"#
    ))

  public init() {}

  public struct Data: BridgeFlowGraphQL.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("workspaces", [Workspace].self),
    ] }

    /// Get all accessible workspaces for current user
    public var workspaces: [Workspace] { __data["workspaces"] }

    /// Workspace
    ///
    /// Parent Type: `WorkspaceType`
    public struct Workspace: BridgeFlowGraphQL.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.WorkspaceType }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", BridgeFlowGraphQL.ID.self),
        .field("initialized", Bool.self),
        .field("team", Bool.self),
        .field("owner", Owner.self),
      ] }

      public var id: BridgeFlowGraphQL.ID { __data["id"] }
      /// is current workspace initialized
      public var initialized: Bool { __data["initialized"] }
      /// if workspace is team workspace
      public var team: Bool { __data["team"] }
      /// Owner of workspace
      public var owner: Owner { __data["owner"] }

      /// Workspace.Owner
      ///
      /// Parent Type: `UserType`
      public struct Owner: BridgeFlowGraphQL.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.UserType }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("id", BridgeFlowGraphQL.ID.self),
        ] }

        public var id: BridgeFlowGraphQL.ID { __data["id"] }
      }
    }
  }
}
