import type { JiraChangelogItem, JiraIssue, JiraUser } from "../types";

export function getChangelogByIssues(issues: JiraIssue[]): JiraChangelogItem[] {
  const events: JiraChangelogItem[] = issues
    .map((issue) =>
      issue.changelog.histories.map((history) => ({
        issue,
        ...history,
      })),
    )
    .flat()
    .map((history) =>
      history.items.map((item) => ({
        username: history.author.name,
        issue: history.issue,
        date: new Date(history.created),
        ...item,
      })),
    )
    .flat();

  issues
    .map((issue): JiraChangelogItem => ({
      username: issue.fields.creator.name,
      date: new Date(issue.fields.created),
      issue,
      field: "issue",
      fieldtype: "issue",
      from: null,
      fromString: null,
      to: issue.key,
      toString: issue.key,
    }))
    .forEach((event) => events.unshift(event));

  const authorsByJiraUser = new Map<string, JiraUser>();
  for (const issue of issues) {
    for (const { author } of issue.changelog.histories) {
      if (!authorsByJiraUser.has(author.key)) {
        authorsByJiraUser.set(author.key, author);
      }
    }
  }
  for (const event of events) {
    if (event.field === "assignee") {
      if (event.fromString != null && authorsByJiraUser.has(event.fromString)) {
        event.fromString = authorsByJiraUser.get(event.fromString)!.name;
      }
      if (event.toString != null && authorsByJiraUser.has(event.toString)) {
        event.toString = authorsByJiraUser.get(event.toString)!.name;
      }
    }
  }

  return events;
}
