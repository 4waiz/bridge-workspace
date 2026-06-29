// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class UpdateUserProfileMutation: GraphQLMutation {
  public static let operationName: String = "updateUserProfile"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"mutation updateUserProfile($input: UpdateUserInput!) { updateProfile(input: $input) { __typename id name } }"#
    ))

  public var input: UpdateUserInput

  public init(input: UpdateUserInput) {
    self.input = input
  }

  public var __variables: Variables? { ["input": input] }

  public struct Data: BridgeFlowGraphQL.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.Mutation }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("updateProfile", UpdateProfile.self, arguments: ["input": .variable("input")]),
    ] }

    public var updateProfile: UpdateProfile { __data["updateProfile"] }

    /// UpdateProfile
    ///
    /// Parent Type: `UserType`
    public struct UpdateProfile: BridgeFlowGraphQL.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.UserType }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", BridgeFlowGraphQL.ID.self),
        .field("name", String.self),
      ] }

      public var id: BridgeFlowGraphQL.ID { __data["id"] }
      /// User name
      public var name: String { __data["name"] }
    }
  }
}
