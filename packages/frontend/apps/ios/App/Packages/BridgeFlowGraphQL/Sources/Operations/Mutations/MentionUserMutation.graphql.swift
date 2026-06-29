// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class MentionUserMutation: GraphQLMutation {
  public static let operationName: String = "mentionUser"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"mutation mentionUser($input: MentionInput!) { mentionUser(input: $input) }"#
    ))

  public var input: MentionInput

  public init(input: MentionInput) {
    self.input = input
  }

  public var __variables: Variables? { ["input": input] }

  public struct Data: BridgeFlowGraphQL.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.Mutation }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("mentionUser", BridgeFlowGraphQL.ID.self, arguments: ["input": .variable("input")]),
    ] }

    /// mention user in a doc
    public var mentionUser: BridgeFlowGraphQL.ID { __data["mentionUser"] }
  }
}
