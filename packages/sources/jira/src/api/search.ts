import { request } from "@analtools/zerocrat-source-utils";

import type {
  JiraClientContext,
  JiraIssue,
  JiraServerSettings,
} from "../types";
import { deduplicateIssues } from "../utils";
import { getChangeTypeField } from "./get-change-type-field";
import { getEpicField } from "./get-epic-field";
import { getInitiativeClassificationField } from "./get-initiative-classification-field";
import { getPlannedEndField } from "./get-planned-end-field";

async function searchOnServer(
  context: JiraClientContext,
  server: JiraServerSettings,
  {
    jql,
    fields = [
      "summary",
      "issuelinks",
      "issuetype",
      "description",
      "created",
      "creator",
      "assignee",
      "duedate",
      "status",
      // TODO: refactor - custom fields
      "epiclink",
      "plannedEnd",
      "changeType",
      "initiativeClassification",
    ],
    expand = ["changelog"],
  }: {
    jql: string;
    fields?: string[];
    expand?: string[];
  },
): Promise<JiraIssue[]> {
  // TODO: refactor - custom fields
  const epicField = await getEpicField(context, server);
  const plannedEndField = await getPlannedEndField(context, server);
  const changeTypeField = await getChangeTypeField(context, server);
  const initiativeClassificationField = await getInitiativeClassificationField(
    context,
    server,
  );

  let startAt = 0;
  const maxResults = 50;

  const result: JiraIssue[] = [];

  while (true) {
    try {
      const { issues } = await request<{ issues: JiraIssue[] }>({
        host: server.host,
        endpoint: "/rest/api/2/search",
        method: "get",
        headers: {
          Authorization: `Bearer ${server.token}`,
        },
        searchParams: {
          jql,
          startAt,
          maxResults,
          expand: expand.join(","),
          fields: fields
            .map((field) => {
              switch (field) {
                case "epiclink":
                  return epicField;
                case "plannedEnd":
                  return plannedEndField;
                case "changeType":
                  return changeTypeField;
                case "initiativeClassification":
                  return initiativeClassificationField;
                default:
                  return field;
              }
            })
            .filter(Boolean),
        },
        debug: context.debug,
        arrayFormat: "comma",
      });

      for (const issue of issues) {
        // TODO: refactor - custom fields
        if (epicField && epicField in issue.fields) {
          issue.fields.epiclink = (issue.fields as any)[epicField!];
          delete (issue.fields as any)[epicField];
        }
        if (plannedEndField && plannedEndField in issue.fields) {
          issue.fields.plannedEnd = (issue.fields as any)[plannedEndField!];
          delete (issue.fields as any)[plannedEndField];
        }
        if (changeTypeField && changeTypeField in issue.fields) {
          issue.fields.changeType =
            (issue.fields as any)[changeTypeField!]?.value ?? null;
          delete (issue.fields as any)[changeTypeField];
        }
        if (
          initiativeClassificationField &&
          initiativeClassificationField in issue.fields
        ) {
          issue.fields.initiativeClassification =
            (issue.fields as any)[initiativeClassificationField!]?.value ??
            null;
          delete (issue.fields as any)[initiativeClassificationField];
        }
        result.push(issue);
      }

      if (issues.length < maxResults) {
        break;
      }
      startAt += maxResults;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("does not exist for the field") ||
          error.message.includes("does not exist for field") ||
          error.message.includes(
            "No issues have a parent epic with key or name",
          ))
      ) {
        break;
      } else {
        throw error;
      }
    }
  }

  return result;
}

export async function search(
  context: JiraClientContext,
  options: {
    jql: string;
    fields?: string[];
    expand?: string[];
  },
): Promise<JiraIssue[]> {
  const results = await Promise.all(
    context.servers.map((server) => searchOnServer(context, server, options)),
  );

  return deduplicateIssues(results.flat());
}
