import { type MergeRequest, MergeRequestState } from "../types";

export function mergeRequestSelector({
  iid: id,
  title,
  state,
  created_at: createdAt,
  updated_at: updatedAt,
  merged_at: mergedAt,
  closed_at: closedAt,
  user_notes_count: userNotesCount,
  merge_status: mergeStatus,
  detailed_merge_status: detailedMergeStatus,
  web_url: webUrl,
  has_conflicts: hasConflicts,
  blocking_discussions_resolved: blockingDiscussionsResolved,
  author,
  draft,
  merged_by: mergedBy,
}: any): MergeRequest {
  return {
    id,
    title,
    state: state as MergeRequestState,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    mergedAt: mergedAt === null ? null : new Date(mergedAt),
    closedAt: closedAt === null ? null : new Date(closedAt),
    userNotesCount,
    mergeStatus,
    detailedMergeStatus,
    webUrl,
    hasConflicts,
    blockingDiscussionsResolved,
    author: {
      id: author.id,
      name: author.username,
    },
    draft,
    mergedBy:
      mergedBy === null
        ? null
        : {
            id: mergedBy.id,
            name: mergedBy.username,
          },
  };
}
