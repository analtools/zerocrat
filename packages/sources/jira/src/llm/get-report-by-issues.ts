import * as api from "../api";
import type { JiraClientContext, JiraIssue } from "../types";
import { buildIssueHierarchy } from "../utils";

export async function getReportByIssues(
  context: JiraClientContext,
  options:
    | {
        keys: string[];
        issues?: never;
      }
    | {
        keys?: never;
        issues: JiraIssue[];
      },
): Promise<string> {
  const issues =
    options.issues ?? (await api.smartSearch(context, { keys: options.keys }));

  const result: string[] = [];

  result.push(`## Issues`);
  result.push(``);

  const hierarchy = buildIssueHierarchy(issues);

  for (const {
    key,
    type,
    name,
    description,
    dueDate,
    plannedEnd,
    path,
    depth,
    assignee,
    epic,
    status,
    initiativeClassification,
    changeType,
  } of hierarchy) {
    result.push(`- task: ${key}. ${name}`);
    if (epic) {
      result.push(`  epic: ${epic}`);
    }
    result.push(`  hierarchy: ${path}`);
    result.push(`  depth: ${depth}`);
    result.push(`  status: ${status}`);
    result.push(`  type: ${type}`);
    if (initiativeClassification) {
      result.push(`  initiativeClassification: ${initiativeClassification}`);
    }
    if (changeType) {
      result.push(`  changeType: ${changeType}`);
    }
    if (assignee) {
      result.push(`  assignee: ${assignee}`);
    }
    if (dueDate) {
      result.push(`  dueDate: ${JSON.stringify(dueDate)}`);
    }
    if (plannedEnd) {
      result.push(`  plannedEnd: ${JSON.stringify(plannedEnd)}`);
    }
    result.push(`  description: ${JSON.stringify(description)}`);

    result.push(``);
  }

  return result.join("\n").trim();
}
