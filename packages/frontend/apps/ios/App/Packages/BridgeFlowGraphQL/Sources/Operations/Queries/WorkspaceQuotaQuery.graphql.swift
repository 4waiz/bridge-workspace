// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class WorkspaceQuotaQuery: GraphQLQuery {
  public static let operationName: String = "workspaceQuota"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query workspaceQuota($id: String!) { workspace(id: $id) { __typename quota { __typename name blobLimit storageQuota usedStorageQuota historyPeriod memberLimit memberCount overcapacityMemberCount humanReadable { __typename name blobLimit storageQuota historyPeriod memberLimit memberCount overcapacityMemberCount } } } }"#
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
          .field("name", String.self),
          .field("blobLimit", BridgeFlowGraphQL.SafeInt.self),
          .field("storageQuota", BridgeFlowGraphQL.SafeInt.self),
          .field("usedStorageQuota", BridgeFlowGraphQL.SafeInt.self),
          .field("historyPeriod", BridgeFlowGraphQL.SafeInt.self),
          .field("memberLimit", Int.self),
          .field("memberCount", Int.self),
          .field("overcapacityMemberCount", Int.self),
          .field("humanReadable", HumanReadable.self),
        ] }

        public var name: String { __data["name"] }
        public var blobLimit: BridgeFlowGraphQL.SafeInt { __data["blobLimit"] }
        public var storageQuota: BridgeFlowGraphQL.SafeInt { __data["storageQuota"] }
        public var usedStorageQuota: BridgeFlowGraphQL.SafeInt { __data["usedStorageQuota"] }
        public var historyPeriod: BridgeFlowGraphQL.SafeInt { __data["historyPeriod"] }
        public var memberLimit: Int { __data["memberLimit"] }
        public var memberCount: Int { __data["memberCount"] }
        public var overcapacityMemberCount: Int { __data["overcapacityMemberCount"] }
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
            .field("name", String.self),
            .field("blobLimit", String.self),
            .field("storageQuota", String.self),
            .field("historyPeriod", String.self),
            .field("memberLimit", String.self),
            .field("memberCount", String.self),
            .field("overcapacityMemberCount", String.self),
          ] }

          public var name: String { __data["name"] }
          public var blobLimit: String { __data["blobLimit"] }
          public var storageQuota: String { __data["storageQuota"] }
          public var historyPeriod: String { __data["historyPeriod"] }
          public var memberLimit: String { __data["memberLimit"] }
          public var memberCount: String { __data["memberCount"] }
          public var overcapacityMemberCount: String { __data["overcapacityMemberCount"] }
        }
      }
    }
  }
}
