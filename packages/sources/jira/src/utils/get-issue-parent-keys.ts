import type { JiraIssue } from "../types";

export function getIssueParentKeys(issue: JiraIssue): string[] {
  return (issue.fields.issuelinks ?? [])
    .filter(
      ({ type: { inward }, inwardIssue }) =>
        inward === "is Child of" && inwardIssue,
    )
    .map(({ inwardIssue }) => inwardIssue!.key);
}
