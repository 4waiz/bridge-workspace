// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class SubscriptionQuery: GraphQLQuery {
  public static let operationName: String = "subscription"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query subscription { currentUser { __typename id subscriptions { __typename id status plan recurring start end nextBillAt canceledAt variant } } }"#
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
        .field("id", BridgeFlowGraphQL.ID.self),
        .field("subscriptions", [Subscription].self),
      ] }

      public var id: BridgeFlowGraphQL.ID { __data["id"] }
      public var subscriptions: [Subscription] { __data["subscriptions"] }

      /// CurrentUser.Subscription
      ///
      /// Parent Type: `SubscriptionType`
      public struct Subscription: BridgeFlowGraphQL.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: any ApolloAPI.ParentType { BridgeFlowGraphQL.Objects.SubscriptionType }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("id", String?.self),
          .field("status", GraphQLEnum<BridgeFlowGraphQL.SubscriptionStatus>.self),
          .field("plan", GraphQLEnum<BridgeFlowGraphQL.SubscriptionPlan>.self),
          .field("recurring", GraphQLEnum<BridgeFlowGraphQL.SubscriptionRecurring>.self),
          .field("start", BridgeFlowGraphQL.DateTime.self),
          .field("end", BridgeFlowGraphQL.DateTime?.self),
          .field("nextBillAt", BridgeFlowGraphQL.DateTime?.self),
          .field("canceledAt", BridgeFlowGraphQL.DateTime?.self),
          .field("variant", GraphQLEnum<BridgeFlowGraphQL.SubscriptionVariant>?.self),
        ] }

        @available(*, deprecated, message: "removed")
        public var id: String? { __data["id"] }
        public var status: GraphQLEnum<BridgeFlowGraphQL.SubscriptionStatus> { __data["status"] }
        /// The 'Free' plan just exists to be a placeholder and for the type convenience of frontend.
        /// There won't actually be a subscription with plan 'Free'
        public var plan: GraphQLEnum<BridgeFlowGraphQL.SubscriptionPlan> { __data["plan"] }
        public var recurring: GraphQLEnum<BridgeFlowGraphQL.SubscriptionRecurring> { __data["recurring"] }
        public var start: BridgeFlowGraphQL.DateTime { __data["start"] }
        public var end: BridgeFlowGraphQL.DateTime? { __data["end"] }
        public var nextBillAt: BridgeFlowGraphQL.DateTime? { __data["nextBillAt"] }
        public var canceledAt: BridgeFlowGraphQL.DateTime? { __data["canceledAt"] }
        public var variant: GraphQLEnum<BridgeFlowGraphQL.SubscriptionVariant>? { __data["variant"] }
      }
    }
  }
}
