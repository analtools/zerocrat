import {
  type JiraIssue,
  utils as jiraUtils,
} from "@analtools/zerocrat-source-jira";
import { formatDate } from "@analtools/zerocrat-source-utils";

import * as api from "../api";
import type { GitlabApiContext, UserActivityEvent } from "../types";
import { getStateFromContext } from "../utils";

export async function getUserActivity(
  context: GitlabApiContext,
  options: (
    { username: string; userId?: never } | { username?: never; userId: number }
  ) & {
    fromDate?: Date;
    toDate?: Date;
    sort?: "asc" | "desc";
  },
): Promise<string> {
  const { jiraClient } = getStateFromContext(context);

  const { events, jiraKeys } = await api.getUserActivity(context, options);

  const issues: JiraIssue[] = jiraClient
    ? await jiraClient.api.getIssuesWithParents({ keys: jiraKeys })
    : [];

  const issuesByKey = new Map(issues.map((issue) => [issue.key, issue]));

  const result: string[] = [];

  result.push(
    `# Gitlab Activity - ${options.username} - ${options.fromDate ? `from ${formatDate(options.fromDate)} ` : ""}to ${formatDate(options.toDate ?? new Date())}`,
  );

  result.push(``);
  result.push(`GITLAB_HOST = ${context.gitlabHost!}`);

  if (
    jiraClient &&
    issues.length > 0 &&
    ((context.jiraServers?.length ?? 0) > 0 || context.publicJiraHost)
  ) {
    result.push(
      `JIRA_HOST = ${jiraUtils.getPublicJiraHost(context.jiraServers ?? [], context.publicJiraHost)}`,
    );
    result.push(``);
    result.push(await jiraClient.llm.getReportByIssues({ issues }));
  }

  result.push(``);
  result.push(`## Events`);
  result.push(``);

  if (events.length === 0) {
    result.push(`No events found`);
  } else {
    for (const event of events) {
      if (event.details.jiraKey) {
        result.push(
          `- task: ${event.details.jiraKey ? `${event.details.jiraKey}. ${issuesByKey.get(event.details.jiraKey)?.fields.summary ?? ""}` : null}`,
        );
        result.push(`  action: ${event.action}`);
      } else {
        result.push(`- action: ${event.action}`);
      }
      result.push(`  date: ${event.date.toISOString()}`);
      for (const key of Object.keys(
        event.details,
      ) as (keyof UserActivityEvent["details"])[]) {
        if (
          [
            "jiraKey",
            "projectNameWithNamespace",
            "projectId",
            "mergeRequestId",
            "noteId",
            "noteableId",
            "noteableIId",
            "resolvedByUserId",
            "commitCount",
            "commitFrom",
            "commitTo",
          ].includes(key) ||
          (["commitTitle"].includes(key) && event.details[key] === null)
        ) {
          continue;
        }
        const value = event.details[key];
        if (`${value}`.includes("\n")) {
          result.push(`  ${key}: ${JSON.stringify(value)}`);
        } else {
          result.push(`  ${key}: ${value}`);
        }
      }
      result.push(``);
    }
  }

  return result.join("\n").trim();
}
