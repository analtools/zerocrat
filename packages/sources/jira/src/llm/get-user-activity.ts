import { formatDate } from "@analtools/zerocrat-source-utils";

import * as api from "../api";
import type {
  JiraClientContext,
  JiraIssueHierarchyItem,
  SmartSearchOptions,
} from "../types";
import {
  buildIssueHierarchy,
  deduplicateIssues,
  diffWordsPaired,
} from "../utils";
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
  let issues = await api.smartSearch(context, options);

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

  const events = await api.getUserActivity(context, {
    keys: issues.map((issue) => issue.key),
    ...(options.usernames
      ? { usernames: options.usernames }
      : { username: options.username }),
  });

  result.push(
    `# Jira Activity - ${usernames.join(",")} - ${options.fromDate ? `from ${formatDate(options.fromDate)} ` : ""}to ${formatDate(options.toDate ?? new Date())}`,
  );
  result.push(``);

  result.push(`JIRA_HOST = ${context.jiraHost}`);
  result.push(``);

  const issuesByEvents = deduplicateIssues(events.map((event) => event.issue));
  result.push(await getReportByIssues(context, { issues: issuesByEvents }));

  const hierarchy = buildIssueHierarchy(issues);
  const hierarchyByKeys = new Map<string, JiraIssueHierarchyItem>();
  for (const hierarchyItem of hierarchy) {
    hierarchyByKeys.set(hierarchyItem.key, hierarchyItem);
  }

  result.push(``);
  result.push(`## Events`);
  result.push(``);

  for (const event of events) {
    result.push(`- task: ${event.issue.key}. ${event.issue.fields.summary}`);
    result.push(`  username: ${event.username}`);
    result.push(`  action: ${event.action}`);
    if (event.action === "Description updated") {
      result.push(
        `  diff: ${JSON.stringify(diffWordsPaired(event.from ?? "", event.to ?? ""))}`,
      );
    } else if (event.from == null && event.to != null) {
      result.push(`  newValue: ${event.to}`);
    } else {
      result.push(`  from: ${event.from}`);
      result.push(`  to: ${event.to}`);
    }
    result.push(`  date: ${event.date.toISOString()}`);
    result.push(``);
    result.push(`  parent: ${hierarchyByKeys.get(event.issue.key)?.parent}`);
    result.push(
      `  ancestors: ${hierarchyByKeys.get(event.issue.key)?.ancestors}`,
    );
    result.push(`  path: ${hierarchyByKeys.get(event.issue.key)?.path}`);
    result.push(``);
  }

  return result.join("\n").trim();
}
