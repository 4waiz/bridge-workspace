// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class LinkCalDavAccountMutation: GraphQLMutation {
  public static let operationName: String = "linkCalDavAccount"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"mutation linkCalDavAccount($input: LinkCalDAVAccountInput!) { linkCalDAVAccount(input: $input) { __typename id provider providerAccountId displayName email status lastError refreshIntervalMinutes calendarsCount createdAt updatedAt } }"#
    ))

  public var input: LinkCalDAVAccountInput

  public init(input: LinkCalDAVAccountInput) {
    self.input = input
  }

  public var __variables: Variables? { ["input": input] }

  public struct Data: BridgeFlowGraphQL.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.Mutation }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("linkCalDAVAccount", LinkCalDAVAccount.self, arguments: ["input": .variable("input")]),
    ] }

    public var linkCalDAVAccount: LinkCalDAVAccount { __data["linkCalDAVAccount"] }

    /// LinkCalDAVAccount
    ///
    /// Parent Type: `CalendarAccountObjectType`
    public struct LinkCalDAVAccount: BridgeFlowGraphQL.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.CalendarAccountObjectType }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", String.self),
        .field("provider", GraphQLEnum<BridgeFlowGraphQL.CalendarProviderType>.self),
        .field("providerAccountId", String.self),
        .field("displayName", String?.self),
        .field("email", String?.self),
        .field("status", String.self),
        .field("lastError", String?.self),
        .field("refreshIntervalMinutes", Int.self),
        .field("calendarsCount", Int.self),
        .field("createdAt", BridgeFlowGraphQL.DateTime.self),
        .field("updatedAt", BridgeFlowGraphQL.DateTime.self),
      ] }

      public var id: String { __data["id"] }
      public var provider: GraphQLEnum<BridgeFlowGraphQL.CalendarProviderType> { __data["provider"] }
      public var providerAccountId: String { __data["providerAccountId"] }
      public var displayName: String? { __data["displayName"] }
      public var email: String? { __data["email"] }
      public var status: String { __data["status"] }
      public var lastError: String? { __data["lastError"] }
      public var refreshIntervalMinutes: Int { __data["refreshIntervalMinutes"] }
      public var calendarsCount: Int { __data["calendarsCount"] }
      public var createdAt: BridgeFlowGraphQL.DateTime { __data["createdAt"] }
      public var updatedAt: BridgeFlowGraphQL.DateTime { __data["updatedAt"] }
    }
  }
}
