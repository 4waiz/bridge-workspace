// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct CopilotChatMessage: BridgeFlowGraphQL.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment CopilotChatMessage on ChatMessage { __typename id role content attachments streamObjects { __typename type textDelta toolCallId toolName args result } createdAt }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.ChatMessage }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("id", BridgeFlowGraphQL.ID?.self),
    .field("role", String.self),
    .field("content", String.self),
    .field("attachments", [String]?.self),
    .field("streamObjects", [StreamObject]?.self),
    .field("createdAt", BridgeFlowGraphQL.DateTime.self),
  ] }

  public var id: BridgeFlowGraphQL.ID? { __data["id"] }
  public var role: String { __data["role"] }
  public var content: String { __data["content"] }
  public var attachments: [String]? { __data["attachments"] }
  public var streamObjects: [StreamObject]? { __data["streamObjects"] }
  public var createdAt: BridgeFlowGraphQL.DateTime { __data["createdAt"] }

  /// StreamObject
  ///
  /// Parent Type: `StreamObject`
  public struct StreamObject: BridgeFlowGraphQL.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.StreamObject }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("type", String.self),
      .field("textDelta", String?.self),
      .field("toolCallId", String?.self),
      .field("toolName", String?.self),
      .field("args", BridgeFlowGraphQL.JSON?.self),
      .field("result", BridgeFlowGraphQL.JSON?.self),
    ] }

    public var type: String { __data["type"] }
    public var textDelta: String? { __data["textDelta"] }
    public var toolCallId: String? { __data["toolCallId"] }
    public var toolName: String? { __data["toolName"] }
    public var args: BridgeFlowGraphQL.JSON? { __data["args"] }
    public var result: BridgeFlowGraphQL.JSON? { __data["result"] }
  }
}
