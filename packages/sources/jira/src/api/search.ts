import { request } from "@analtools/zerocrat-source-utils";

import type { JiraClientContext, JiraIssue } from "../types";
import { getEpicField } from "./get-epic-field";

export async function search(
  context: JiraClientContext,
  {
    jql,
    fields = [
      "summary",
      "issuelinks",
      "description",
      "epiclink",
      "created",
      "creator",
    ],
    expand = ["changelog"],
  }: {
    jql: string;
    fields?: string[];
    expand?: string[];
  },
): Promise<JiraIssue[]> {
  if (context.jiraEpicLinkField === undefined) {
    context.jiraEpicLinkField = await getEpicField(context);
  }
  const { jiraHost, jiraToken } = context;

  let startAt = 0;
  const maxResults = 50;

  const result: JiraIssue[] = [];

  while (true) {
    const { issues } = await request<{ issues: JiraIssue[] }>({
      host: jiraHost,
      endpoint: "/rest/api/2/search",
      //searchParams: expand.includes("changelog") ? { expand: "changelog" } : {},
      // searchParams: {},
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
            field === "epiclink" ? context.jiraEpicLinkField : field,
          )
          .filter(Boolean),
      },
      debug: true,
    });

    for (const issue of issues) {
      if (
        context.jiraEpicLinkField &&
        context.jiraEpicLinkField in issue.fields
      ) {
        issue.fields.epiclink = (issue.fields as any)[
          context.jiraEpicLinkField!
        ];
        delete (issue.fields as any)[context.jiraEpicLinkField!];
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
