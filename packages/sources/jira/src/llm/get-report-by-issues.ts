import * as api from "../api";
import type { JiraClientContext, JiraIssue } from "../types";
import { buildIssueHierarchy } from "../utils";

export async function* getReportByIssues(
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
): AsyncGenerator<string> {
  const issues =
    options.issues ?? (await api.smartSearch(context, { keys: options.keys }));

  yield `## Issues`;
  yield ``;

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
    yield `- task: ${key}. ${name}`;
    if (epic) {
      yield `  epic: ${epic}`;
    }
    yield `  hierarchy: ${path}`;
    yield `  depth: ${depth}`;
    yield `  status: ${status}`;
    yield `  type: ${type}`;
    if (initiativeClassification) {
      yield `  initiativeClassification: ${initiativeClassification}`;
    }
    if (changeType) {
      yield `  changeType: ${changeType}`;
    }
    if (assignee) {
      yield `  assignee: ${assignee}`;
    }
    if (dueDate) {
      yield `  dueDate: ${JSON.stringify(dueDate)}`;
    }
    if (plannedEnd) {
      yield `  plannedEnd: ${JSON.stringify(plannedEnd)}`;
    }
    yield `  description: ${JSON.stringify(description)}`;

    yield ``;
  }
}
