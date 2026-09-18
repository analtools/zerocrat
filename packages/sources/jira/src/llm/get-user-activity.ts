import { formatDate } from "@analtools/zerocrat-source-utils";

import * as api from "../api";
import type {
  JiraClientContext,
  JiraIssue,
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

export async function* getUserActivity(
  context: JiraClientContext,
  options: SmartSearchOptions & {
    withChildren?: boolean;
    withParents?: boolean;
    issues?: JiraIssue[];
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
): AsyncGenerator<string> {
  const issues = options.issues ?? (await api.smartSearch(context, options));

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
    issues,
    usernames,
  });

  yield `# Jira Activity${displayUsernames ? ` - ${displayUsernames}` : ""} - ${options.fromDate ? `from ${formatDate(options.fromDate)} ` : ""}to ${formatDate(options.toDate ?? new Date())}`;

  yield ``;

  yield `JIRA_HOST = ${getPublicJiraHost(context.servers, context.publicHost)}`;
  yield ``;

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

  for await (const item of getReportByIssues(context, {
    issues: issuesByEvents,
  })) {
    yield item;
  }

  const hierarchy = buildIssueHierarchy(issues);
  const hierarchyByKeys = new Map<string, JiraIssueHierarchyItem>();
  for (const hierarchyItem of hierarchy) {
    hierarchyByKeys.set(hierarchyItem.key, hierarchyItem);
  }

  yield ``;

  if (!events.length) {
    return;
  }

  yield `## Events`;
  yield ``;

  for (const event of events) {
    yield `- task: ${event.issue.key}. ${event.issue.fields.summary}`;
    yield `  username: ${event.username}`;
    yield `  action: ${event.action}`;
    if (event.action === "Description updated") {
      yield `  diff: ${JSON.stringify(diffWordsPaired(event.from ?? "", event.to ?? ""))}`;
    }
    if (event.from == null && event.to != null) {
      yield `  value: ${JSON.stringify(event.to)}`;
    } else {
      yield `  from: ${JSON.stringify(event.from)}`;
      yield `  to: ${JSON.stringify(event.to)}`;
    }
    yield `  date: ${event.date.toISOString()}`;
    yield ``;
  }
}
