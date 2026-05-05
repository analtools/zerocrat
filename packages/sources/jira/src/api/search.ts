import { request } from "@analtools/zerocrat-source-utils";

import type { JiraClientContext, JiraIssue } from "../types";
import { getStateFromContext } from "../utils";
import { getEpicField } from "./get-epic-field";

export async function search(
  context: JiraClientContext,
  {
    jql,
    fields = [
      "summary",
      "issuelinks",
      "issuetype",
      "description",
      "epiclink",
      "created",
      "creator",
      "duedate",
    ],
    expand = ["changelog"],
  }: {
    jql: string;
    fields?: string[];
    expand?: string[];
  },
): Promise<JiraIssue[]> {
  const state = getStateFromContext(context);
  if (state.jiraEpicLinkField === undefined) {
    state.jiraEpicLinkField = await getEpicField(context);
  }
  const { jiraHost, jiraToken, debug } = context;

  let startAt = 0;
  const maxResults = 50;

  const result: JiraIssue[] = [];

  while (true) {
    const { issues } = await request<{ issues: JiraIssue[] }>({
      host: jiraHost,
      endpoint: "/rest/api/2/search",
      method: "get",
      headers: {
        Authorization: `Bearer ${jiraToken}`,
      },
      searchParams: {
        jql,
        startAt,
        maxResults,
        expand: expand.join(","),
        fields: fields
          .map((field) =>
            field === "epiclink" ? state.jiraEpicLinkField : field,
          )
          .filter(Boolean),
      },
      debug,
      arrayFormat: "comma",
    });

    for (const issue of issues) {
      if (state.jiraEpicLinkField && state.jiraEpicLinkField in issue.fields) {
        issue.fields.epiclink = (issue.fields as any)[state.jiraEpicLinkField!];
        delete (issue.fields as any)[state.jiraEpicLinkField!];
      }

      result.push(issue);
    }

    if (issues.length < maxResults) {
      break;
    }
    startAt += maxResults;
  }

  return result;
}
