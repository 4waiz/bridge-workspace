// @generated
// This file was automatically generated and should not be edited.

import ApolloAPI

public protocol SelectionSet: ApolloAPI.SelectionSet & ApolloAPI.RootSelectionSet
where Schema == BridgeFlowGraphQL.SchemaMetadata {}

public protocol InlineFragment: ApolloAPI.SelectionSet & ApolloAPI.InlineFragment
where Schema == BridgeFlowGraphQL.SchemaMetadata {}

public protocol MutableSelectionSet: ApolloAPI.MutableRootSelectionSet
where Schema == BridgeFlowGraphQL.SchemaMetadata {}

public protocol MutableInlineFragment: ApolloAPI.MutableSelectionSet & ApolloAPI.InlineFragment
where Schema == BridgeFlowGraphQL.SchemaMetadata {}

public enum SchemaMetadata: ApolloAPI.SchemaMetadata {
  public static let configuration: any ApolloAPI.SchemaConfiguration.Type = SchemaConfiguration.self

  public static func objectType(forTypename typename: String) -> ApolloAPI.Object? {
    switch typename {
    case "AdminWorkspace": return BridgeFlowGraphQL.Objects.AdminWorkspace
    case "AdminWorkspaceMember": return BridgeFlowGraphQL.Objects.AdminWorkspaceMember
    case "AdminWorkspaceSharedLink": return BridgeFlowGraphQL.Objects.AdminWorkspaceSharedLink
    case "AggregateBucketHitsObjectType": return BridgeFlowGraphQL.Objects.AggregateBucketHitsObjectType
    case "AggregateBucketObjectType": return BridgeFlowGraphQL.Objects.AggregateBucketObjectType
    case "AggregateResultObjectType": return BridgeFlowGraphQL.Objects.AggregateResultObjectType
    case "AppConfigValidateResult": return BridgeFlowGraphQL.Objects.AppConfigValidateResult
    case "BlobUploadInit": return BridgeFlowGraphQL.Objects.BlobUploadInit
    case "BlobUploadPart": return BridgeFlowGraphQL.Objects.BlobUploadPart
    case "BlobUploadedPart": return BridgeFlowGraphQL.Objects.BlobUploadedPart
    case "CalendarAccountObjectType": return BridgeFlowGraphQL.Objects.CalendarAccountObjectType
    case "CalendarCalDAVProviderPresetObjectType": return BridgeFlowGraphQL.Objects.CalendarCalDAVProviderPresetObjectType
    case "CalendarEventObjectType": return BridgeFlowGraphQL.Objects.CalendarEventObjectType
    case "CalendarSubscriptionObjectType": return BridgeFlowGraphQL.Objects.CalendarSubscriptionObjectType
    case "ChatMessage": return BridgeFlowGraphQL.Objects.ChatMessage
    case "CommentChangeObjectType": return BridgeFlowGraphQL.Objects.CommentChangeObjectType
    case "CommentChangeObjectTypeEdge": return BridgeFlowGraphQL.Objects.CommentChangeObjectTypeEdge
    case "CommentObjectType": return BridgeFlowGraphQL.Objects.CommentObjectType
    case "CommentObjectTypeEdge": return BridgeFlowGraphQL.Objects.CommentObjectTypeEdge
    case "ContextMatchedDocChunk": return BridgeFlowGraphQL.Objects.ContextMatchedDocChunk
    case "ContextMatchedFileChunk": return BridgeFlowGraphQL.Objects.ContextMatchedFileChunk
    case "ContextWorkspaceEmbeddingStatus": return BridgeFlowGraphQL.Objects.ContextWorkspaceEmbeddingStatus
    case "Copilot": return BridgeFlowGraphQL.Objects.Copilot
    case "CopilotContext": return BridgeFlowGraphQL.Objects.CopilotContext
    case "CopilotContextBlob": return BridgeFlowGraphQL.Objects.CopilotContextBlob
    case "CopilotContextCategory": return BridgeFlowGraphQL.Objects.CopilotContextCategory
    case "CopilotContextDoc": return BridgeFlowGraphQL.Objects.CopilotContextDoc
    case "CopilotContextFile": return BridgeFlowGraphQL.Objects.CopilotContextFile
    case "CopilotHistories": return BridgeFlowGraphQL.Objects.CopilotHistories
    case "CopilotHistoriesTypeEdge": return BridgeFlowGraphQL.Objects.CopilotHistoriesTypeEdge
    case "CopilotModelType": return BridgeFlowGraphQL.Objects.CopilotModelType
    case "CopilotModelsType": return BridgeFlowGraphQL.Objects.CopilotModelsType
    case "CopilotPromptConfigType": return BridgeFlowGraphQL.Objects.CopilotPromptConfigType
    case "CopilotPromptMessageType": return BridgeFlowGraphQL.Objects.CopilotPromptMessageType
    case "CopilotPromptType": return BridgeFlowGraphQL.Objects.CopilotPromptType
    case "CopilotQuota": return BridgeFlowGraphQL.Objects.CopilotQuota
    case "CopilotWorkspaceConfig": return BridgeFlowGraphQL.Objects.CopilotWorkspaceConfig
    case "CopilotWorkspaceFile": return BridgeFlowGraphQL.Objects.CopilotWorkspaceFile
    case "CopilotWorkspaceFileTypeEdge": return BridgeFlowGraphQL.Objects.CopilotWorkspaceFileTypeEdge
    case "CopilotWorkspaceIgnoredDoc": return BridgeFlowGraphQL.Objects.CopilotWorkspaceIgnoredDoc
    case "CopilotWorkspaceIgnoredDocTypeEdge": return BridgeFlowGraphQL.Objects.CopilotWorkspaceIgnoredDocTypeEdge
    case "CredentialsRequirementType": return BridgeFlowGraphQL.Objects.CredentialsRequirementType
    case "DeleteAccount": return BridgeFlowGraphQL.Objects.DeleteAccount
    case "DocHistoryType": return BridgeFlowGraphQL.Objects.DocHistoryType
    case "DocPermissions": return BridgeFlowGraphQL.Objects.DocPermissions
    case "DocType": return BridgeFlowGraphQL.Objects.DocType
    case "DocTypeEdge": return BridgeFlowGraphQL.Objects.DocTypeEdge
    case "EditorType": return BridgeFlowGraphQL.Objects.EditorType
    case "GrantedDocUserType": return BridgeFlowGraphQL.Objects.GrantedDocUserType
    case "GrantedDocUserTypeEdge": return BridgeFlowGraphQL.Objects.GrantedDocUserTypeEdge
    case "InvitationType": return BridgeFlowGraphQL.Objects.InvitationType
    case "InvitationWorkspaceType": return BridgeFlowGraphQL.Objects.InvitationWorkspaceType
    case "InviteLink": return BridgeFlowGraphQL.Objects.InviteLink
    case "InviteResult": return BridgeFlowGraphQL.Objects.InviteResult
    case "InviteUserType": return BridgeFlowGraphQL.Objects.InviteUserType
    case "InvoiceType": return BridgeFlowGraphQL.Objects.InvoiceType
    case "License": return BridgeFlowGraphQL.Objects.License
    case "LimitedUserType": return BridgeFlowGraphQL.Objects.LimitedUserType
    case "ListedBlob": return BridgeFlowGraphQL.Objects.ListedBlob
    case "Mutation": return BridgeFlowGraphQL.Objects.Mutation
    case "NotificationObjectType": return BridgeFlowGraphQL.Objects.NotificationObjectType
    case "NotificationObjectTypeEdge": return BridgeFlowGraphQL.Objects.NotificationObjectTypeEdge
    case "PageInfo": return BridgeFlowGraphQL.Objects.PageInfo
    case "PaginatedCommentChangeObjectType": return BridgeFlowGraphQL.Objects.PaginatedCommentChangeObjectType
    case "PaginatedCommentObjectType": return BridgeFlowGraphQL.Objects.PaginatedCommentObjectType
    case "PaginatedCopilotHistoriesType": return BridgeFlowGraphQL.Objects.PaginatedCopilotHistoriesType
    case "PaginatedCopilotWorkspaceFileType": return BridgeFlowGraphQL.Objects.PaginatedCopilotWorkspaceFileType
    case "PaginatedDocType": return BridgeFlowGraphQL.Objects.PaginatedDocType
    case "PaginatedGrantedDocUserType": return BridgeFlowGraphQL.Objects.PaginatedGrantedDocUserType
    case "PaginatedIgnoredDocsType": return BridgeFlowGraphQL.Objects.PaginatedIgnoredDocsType
    case "PaginatedNotificationObjectType": return BridgeFlowGraphQL.Objects.PaginatedNotificationObjectType
    case "PasswordLimitsType": return BridgeFlowGraphQL.Objects.PasswordLimitsType
    case "PublicUserType": return BridgeFlowGraphQL.Objects.PublicUserType
    case "Query": return BridgeFlowGraphQL.Objects.Query
    case "ReleaseVersionType": return BridgeFlowGraphQL.Objects.ReleaseVersionType
    case "RemoveAvatar": return BridgeFlowGraphQL.Objects.RemoveAvatar
    case "ReplyObjectType": return BridgeFlowGraphQL.Objects.ReplyObjectType
    case "RevealedAccessToken": return BridgeFlowGraphQL.Objects.RevealedAccessToken
    case "SearchDocObjectType": return BridgeFlowGraphQL.Objects.SearchDocObjectType
    case "SearchNodeObjectType": return BridgeFlowGraphQL.Objects.SearchNodeObjectType
    case "SearchResultObjectType": return BridgeFlowGraphQL.Objects.SearchResultObjectType
    case "SearchResultPagination": return BridgeFlowGraphQL.Objects.SearchResultPagination
    case "ServerConfigType": return BridgeFlowGraphQL.Objects.ServerConfigType
    case "StreamObject": return BridgeFlowGraphQL.Objects.StreamObject
    case "SubscriptionPrice": return BridgeFlowGraphQL.Objects.SubscriptionPrice
    case "SubscriptionType": return BridgeFlowGraphQL.Objects.SubscriptionType
    case "TranscriptionItemType": return BridgeFlowGraphQL.Objects.TranscriptionItemType
    case "TranscriptionResultType": return BridgeFlowGraphQL.Objects.TranscriptionResultType
    case "UserImportFailedType": return BridgeFlowGraphQL.Objects.UserImportFailedType
    case "UserQuotaHumanReadableType": return BridgeFlowGraphQL.Objects.UserQuotaHumanReadableType
    case "UserQuotaType": return BridgeFlowGraphQL.Objects.UserQuotaType
    case "UserQuotaUsageType": return BridgeFlowGraphQL.Objects.UserQuotaUsageType
    case "UserSettingsType": return BridgeFlowGraphQL.Objects.UserSettingsType
    case "UserType": return BridgeFlowGraphQL.Objects.UserType
    case "WorkspaceCalendarItemObjectType": return BridgeFlowGraphQL.Objects.WorkspaceCalendarItemObjectType
    case "WorkspaceCalendarObjectType": return BridgeFlowGraphQL.Objects.WorkspaceCalendarObjectType
    case "WorkspaceDocMeta": return BridgeFlowGraphQL.Objects.WorkspaceDocMeta
    case "WorkspacePermissions": return BridgeFlowGraphQL.Objects.WorkspacePermissions
    case "WorkspaceQuotaHumanReadableType": return BridgeFlowGraphQL.Objects.WorkspaceQuotaHumanReadableType
    case "WorkspaceQuotaType": return BridgeFlowGraphQL.Objects.WorkspaceQuotaType
    case "WorkspaceRolePermissions": return BridgeFlowGraphQL.Objects.WorkspaceRolePermissions
    case "WorkspaceType": return BridgeFlowGraphQL.Objects.WorkspaceType
    case "WorkspaceUserType": return BridgeFlowGraphQL.Objects.WorkspaceUserType
    case "tokenType": return BridgeFlowGraphQL.Objects.TokenType
    default: return nil
    }
  }
}

public enum Objects {}
public enum Interfaces {}
public enum Unions {}
