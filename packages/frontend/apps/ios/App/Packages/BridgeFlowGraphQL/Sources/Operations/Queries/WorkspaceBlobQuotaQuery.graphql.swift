// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class WorkspaceBlobQuotaQuery: GraphQLQuery {
  public static let operationName: String = "workspaceBlobQuota"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query workspaceBlobQuota($id: String!) { workspace(id: $id) { __typename quota { __typename blobLimit humanReadable { __typename blobLimit } } } }"#
    ))

  public var id: String

  public init(id: String) {
    self.id = id
  }

  public var __variables: Variables? { ["id": id] }

  public struct Data: BridgeFlowGraphQL.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("workspace", Workspace.self, arguments: ["id": .variable("id")]),
    ] }

    /// Get workspace by id
    public var workspace: Workspace { __data["workspace"] }

    /// Workspace
    ///
    /// Parent Type: `WorkspaceType`
    public struct Workspace: BridgeFlowGraphQL.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.WorkspaceType }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("quota", Quota.self),
      ] }

      /// quota of workspace
      public var quota: Quota { __data["quota"] }

      /// Workspace.Quota
      ///
      /// Parent Type: `WorkspaceQuotaType`
      public struct Quota: BridgeFlowGraphQL.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.WorkspaceQuotaType }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("blobLimit", BridgeFlowGraphQL.SafeInt.self),
          .field("humanReadable", HumanReadable.self),
        ] }

        public var blobLimit: BridgeFlowGraphQL.SafeInt { __data["blobLimit"] }
        public var humanReadable: HumanReadable { __data["humanReadable"] }

        /// Workspace.Quota.HumanReadable
        ///
        /// Parent Type: `WorkspaceQuotaHumanReadableType`
        public struct HumanReadable: BridgeFlowGraphQL.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.WorkspaceQuotaHumanReadableType }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("blobLimit", String.self),
          ] }

          public var blobLimit: String { __data["blobLimit"] }
        }
      }
    }
  }
}
