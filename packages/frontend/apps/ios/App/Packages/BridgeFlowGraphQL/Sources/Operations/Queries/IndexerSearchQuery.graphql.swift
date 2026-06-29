// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class IndexerSearchQuery: GraphQLQuery {
  public static let operationName: String = "indexerSearch"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query indexerSearch($id: String!, $input: SearchInput!) { workspace(id: $id) { __typename search(input: $input) { __typename nodes { __typename fields highlights } pagination { __typename count hasMore nextCursor } } } }"#
    ))

  public var id: String
  public var input: SearchInput

  public init(
    id: String,
    input: SearchInput
  ) {
    self.id = id
    self.input = input
  }

  public var __variables: Variables? { [
    "id": id,
    "input": input
  ] }

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
        .field("search", Search.self, arguments: ["input": .variable("input")]),
      ] }

      /// Search a specific table
      public var search: Search { __data["search"] }

      /// Workspace.Search
      ///
      /// Parent Type: `SearchResultObjectType`
      public struct Search: BridgeFlowGraphQL.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.SearchResultObjectType }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("nodes", [Node].self),
          .field("pagination", Pagination.self),
        ] }

        public var nodes: [Node] { __data["nodes"] }
        public var pagination: Pagination { __data["pagination"] }

        /// Workspace.Search.Node
        ///
        /// Parent Type: `SearchNodeObjectType`
        public struct Node: BridgeFlowGraphQL.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.SearchNodeObjectType }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("fields", BridgeFlowGraphQL.JSONObject.self),
            .field("highlights", BridgeFlowGraphQL.JSONObject?.self),
          ] }

          /// The search result fields, see UnionSearchItemObjectType
          public var fields: BridgeFlowGraphQL.JSONObject { __data["fields"] }
          /// The search result fields, see UnionSearchItemObjectType
          public var highlights: BridgeFlowGraphQL.JSONObject? { __data["highlights"] }
        }

        /// Workspace.Search.Pagination
        ///
        /// Parent Type: `SearchResultPagination`
        public struct Pagination: BridgeFlowGraphQL.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.SearchResultPagination }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("count", Int.self),
            .field("hasMore", Bool.self),
            .field("nextCursor", String?.self),
          ] }

          public var count: Int { __data["count"] }
          public var hasMore: Bool { __data["hasMore"] }
          public var nextCursor: String? { __data["nextCursor"] }
        }
      }
    }
  }
}
