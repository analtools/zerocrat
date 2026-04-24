import type { JiraIssue } from "../types";

export function deduplicateIssues(issues: JiraIssue[]): JiraIssue[] {
  return Array.from(
    new Map(issues.map((issue) => [issue.key, issue])).values(),
  );
}
