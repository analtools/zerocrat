import { formatDate } from "@analtools/zerocrat-source-utils";

import * as api from "../api";
import type { GitlabApiContext, UserActivityEvent } from "../types";

export async function getUserActivity(
  context: GitlabApiContext,
  options: (
    | { username: string; userId?: never }
    | { username?: never; userId: number }
  ) & {
    fromDate?: Date;
    toDate?: Date;
    sort?: "asc" | "desc";
  },
): Promise<string> {
  const { jiraClient } = context;

  const { events, jiraKeys } = await api.getUserActivity(context, options);

  const issues = jiraClient
    ? await jiraClient.api.getIssuesWithParents({ keys: jiraKeys })
    : [];

  const result: string[] = [];

  result.push(
    `# Gitlab Activity - ${options.username} - ${options.fromDate ? `from ${formatDate(options.fromDate)} ` : ""}to ${formatDate(options.toDate ?? new Date())}`,
  );

  result.push(``);
  result.push(`GITLAB_HOST = ${context.gitlabHost!}`);

  if (jiraClient && issues.length > 0) {
    result.push(`JIRA_HOST = ${context.jiraHost!}`);
    result.push(``);
    result.push(await jiraClient.llm.getReportByIssues({ issues }));
  }
  result.push(``);

  result.push(`## Events`);
  for (const event of events) {
    result.push(`- task: ${JSON.stringify(event.details.jiraKey ?? null)}`);
    result.push(`  action: ${JSON.stringify(event.action)}`);
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
        ].includes(key)
      ) {
        continue;
      }
      result.push(`  ${key}: ${JSON.stringify(event.details[key])}`);
    }
    result.push(``);
  }

  return result.join("\n").trim();
}
