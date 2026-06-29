// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class AddContextFileMutation: GraphQLMutation {
  public static let operationName: String = "addContextFile"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"mutation addContextFile($content: Upload!, $options: AddContextFileInput!) { addContextFile(content: $content, options: $options) { __typename id createdAt name mimeType chunkSize error status blobId } }"#
    ))

  public var content: Upload
  public var options: AddContextFileInput

  public init(
    content: Upload,
    options: AddContextFileInput
  ) {
    self.content = content
    self.options = options
  }

  public var __variables: Variables? { [
    "content": content,
    "options": options
  ] }

  public struct Data: BridgeFlowGraphQL.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.Mutation }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("addContextFile", AddContextFile.self, arguments: [
        "content": .variable("content"),
        "options": .variable("options")
      ]),
    ] }

    /// add a file to context
    public var addContextFile: AddContextFile { __data["addContextFile"] }

    /// AddContextFile
    ///
    /// Parent Type: `CopilotContextFile`
    public struct AddContextFile: BridgeFlowGraphQL.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.CopilotContextFile }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", BridgeFlowGraphQL.ID.self),
        .field("createdAt", BridgeFlowGraphQL.SafeInt.self),
        .field("name", String.self),
        .field("mimeType", String.self),
        .field("chunkSize", BridgeFlowGraphQL.SafeInt.self),
        .field("error", String?.self),
        .field("status", GraphQLEnum<BridgeFlowGraphQL.ContextEmbedStatus>.self),
        .field("blobId", String.self),
      ] }

      public var id: BridgeFlowGraphQL.ID { __data["id"] }
      public var createdAt: BridgeFlowGraphQL.SafeInt { __data["createdAt"] }
      public var name: String { __data["name"] }
      public var mimeType: String { __data["mimeType"] }
      public var chunkSize: BridgeFlowGraphQL.SafeInt { __data["chunkSize"] }
      public var error: String? { __data["error"] }
      public var status: GraphQLEnum<BridgeFlowGraphQL.ContextEmbedStatus> { __data["status"] }
      public var blobId: String { __data["blobId"] }
    }
  }
}
