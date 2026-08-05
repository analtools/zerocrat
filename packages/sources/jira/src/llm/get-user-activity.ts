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
  getPublicJiraHost,
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
  const issues = await api.smartSearch(context, options);

  const result: string[] = [];

  const usernames = Array.from(
    new Set([
      ...((options.username ? [options.username] : options.usernames) ?? []),
      ...((options.actor ? [options.actor] : options.actors) ?? []),
    ]),
  );

  const displayUsernames = usernames
    .map((username) => `@${username}`)
    .join(",");

  const events = await api.getUserActivity(context, {
    keys: issues.map((issue) => issue.key),
    usernames,
  });

  result.push(
    `# Jira Activity${displayUsernames ? ` - ${displayUsernames}` : ""} - ${options.fromDate ? `from ${formatDate(options.fromDate)} ` : ""}to ${formatDate(options.toDate ?? new Date())}`,
  );
  result.push(``);

  result.push(
    `JIRA_HOST = ${getPublicJiraHost(context.servers, context.publicJiraHost)}`,
  );
  result.push(``);

  const issuesByEventsOriginal = deduplicateIssues(
    events.map((event) => event.issue),
  );
  let issuesByEvents = issuesByEventsOriginal;

  if (options.withParents) {
    const issueWithParents = await api.getIssuesWithParents(context, {
      issues: issuesByEventsOriginal,
    });
    issuesByEvents.push(...issueWithParents);
  }

  if (options.withChildren) {
    const issuesWithChildren = await api.getIssuesWithChildren(context, {
      issues: issuesByEventsOriginal,
    });
    issuesByEvents.push(...issuesWithChildren);
  }
  issuesByEvents = deduplicateIssues(issuesByEvents);

  result.push(await getReportByIssues(context, { issues: issuesByEvents }));

  const hierarchy = buildIssueHierarchy(issues);
  const hierarchyByKeys = new Map<string, JiraIssueHierarchyItem>();
  for (const hierarchyItem of hierarchy) {
    hierarchyByKeys.set(hierarchyItem.key, hierarchyItem);
  }

  result.push(``);

  if (!events.length) {
    return "";
  }

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
    }
    if (event.from == null && event.to != null) {
      result.push(`  value: ${event.to}`);
    } else {
      result.push(`  from: ${JSON.stringify(event.from)}`);
      result.push(`  to: ${JSON.stringify(event.to)}`);
    }
    result.push(`  date: ${event.date.toISOString()}`);
    result.push(``);
  }

  return result.join("\n").trim();
}
