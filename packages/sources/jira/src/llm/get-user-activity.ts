import { formatDate } from "@analtools/zerocrat-source-utils";

import * as api from "../api";
import type {
  JiraClientContext,
  JiraIssue,
  JiraIssueHierarchyItem,
  SmartSearchOptions,
} from "../types";
import { buildIssueHierarchy, deduplicateIssues } from "../utils";
import { getReportByIssues } from "./get-report-by-issues";

export async function getUserActivity(
  context: JiraClientContext,
  options: SmartSearchOptions & {
    withChildren?: boolean;
    withParents?: boolean;
  } & (
      | {
          username?: string;
          usernames?: never;
        }
      | {
          username?: never;
          usernames?: string[];
        }
    ),
) {
  const events = await api.getUserActivity(context, options);

  const uniqueIssuesMap = new Map<string, JiraIssue>();
  for (const event of events) {
    if (!uniqueIssuesMap.has(event.issue.key)) {
      uniqueIssuesMap.set(event.issue.key, event.issue);
    }
  }

  let issues = Array.from(uniqueIssuesMap.values());

  const result: string[] = [];

  const usernames =
    (options.username ? [options.username] : options.usernames)?.map(
      (username) => `@${username}`,
    ) ?? [];

  if (options.withParents) {
    const issueWithParents = await api.getIssuesWithParents(context, {
      issues,
    });
    issues = deduplicateIssues(issueWithParents);
  }

  if (options.withChildren) {
    const issuesWithChildren = await api.getIssuesWithChildren(context, {
      issues,
    });
    issues = deduplicateIssues(issuesWithChildren);
  }

  result.push(
    `# Jira Activity - ${usernames.join(",")}${options.fromDate ? ` - from ${formatDate(options.fromDate)}` : ""}${options.toDate ? ` - to ${formatDate(options.toDate ?? new Date())}` : ""}`,
  );
  result.push(``);

  result.push(`JIRA_HOST = ${context.jiraHost}`);
  result.push(``);

  result.push(await getReportByIssues(context, { issues }));
  result.push(``);

  const hierarchy = buildIssueHierarchy(issues);
  const hierarchyByKeys = new Map<string, JiraIssueHierarchyItem>();
  for (const hierarchyItem of hierarchy) {
    hierarchyByKeys.set(hierarchyItem.key, hierarchyItem);
  }

  result.push(`## Events`);
  result.push(``);

  for (const event of events) {
    result.push(`- task: ${JSON.stringify(event.issue.key)}`);
    result.push(`  username: ${JSON.stringify(event.username)}`);
    result.push(`  action: ${JSON.stringify(event.action)}`);
    result.push(`  from: ${JSON.stringify(event.from)}`);
    result.push(`  to: ${JSON.stringify(event.to)}`);
    result.push(`  date: ${JSON.stringify(event.date)}`);
    result.push(``);
    result.push(
      `  parent: ${JSON.stringify(hierarchyByKeys.get(event.issue.key)?.parent)}`,
    );
    result.push(
      `  ancestors: ${JSON.stringify(hierarchyByKeys.get(event.issue.key)?.ancestors)}`,
    );
    result.push(`  path: ${hierarchyByKeys.get(event.issue.key)?.path}`);
    result.push(``);
  }

  return result.join("\n").trim();
}
