import * as api from "../api";
import type {
  JiraClientContext,
  JiraIssue,
  JiraIssueHierarchyItem,
  SmartSearchOptions,
} from "../types";
import { buildIssueHierarchy, formatDate } from "../utils";

export async function getUserActivity(
  context: JiraClientContext,
  options: SmartSearchOptions &
    (
      | {
          username: string;
          usernames?: never;
        }
      | {
          username?: never;
          usernames: string[];
        }
    ),
) {
  const events = await api.getUserActivity(context, options);

  const issues = new Map<string, JiraIssue>();
  for (const event of events) {
    if (!issues.has(event.issue.key)) {
      issues.set(event.issue.key, event.issue);
    }
  }

  const lineage = await api.getIssuesLineage(context, {
    issues: Array.from(issues.values()),
  });

  const result: string[] = [];

  const usernames =
    (options.username ? [options.username] : options.usernames)?.map(
      (username) => `@${username}`,
    ) ?? [];

  result.push(
    `# Jira Activity - ${usernames.join(",")}${options.fromDate ? ` - from ${formatDate(options.fromDate)}` : ""}${options.toDate ? ` - to ${formatDate(options.toDate ?? new Date())}` : ""}`,
  );
  result.push(``);

  result.push(`JIRA_HOST = ${context.jiraHost}`);
  result.push(``);

  result.push(`## Issues`);
  result.push(``);

  const hierarchy = buildIssueHierarchy(lineage);
  const hierarchyByKeys = new Map<string, JiraIssueHierarchyItem>();
  for (const hierarchyItem of hierarchy) {
    hierarchyByKeys.set(hierarchyItem.key, hierarchyItem);

    result.push(`- task: ${JSON.stringify(hierarchyItem.key)}`);
    result.push(`  type: ${JSON.stringify(hierarchyItem.type)}`);
    result.push(`  name: ${JSON.stringify(hierarchyItem.name)}`);
    result.push(`  description: ${JSON.stringify(hierarchyItem.description)}`);
    result.push(`  parent: ${JSON.stringify(hierarchyItem.parent)}`);
    result.push(`  allParents: ${JSON.stringify(hierarchyItem.allParents)}`);
    result.push(`  ancestors: ${JSON.stringify(hierarchyItem.ancestors)}`);
    result.push(`  path: ${hierarchyItem.path}`);
    result.push(`  depth: ${hierarchyItem.depth}`);
    result.push(``);
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
