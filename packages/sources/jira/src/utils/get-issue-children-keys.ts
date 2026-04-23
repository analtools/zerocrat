import type { JiraIssue } from "../types";

export function getIssueChildrenKeys(issue: JiraIssue): string[] {
  return (issue.fields.issuelinks ?? [])
    .filter(
      ({ type: { outward }, outwardIssue }) =>
        outward === "is Parent of" && outwardIssue,
    )
    .map(({ outwardIssue }) => outwardIssue!.key);
}
