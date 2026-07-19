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
    parent,
    allParents,
    ancestors,
    path,
    depth,
  } of hierarchy) {
    result.push(`- task: ${key}`);
    result.push(`  name: ${name}`);
    result.push(`  type: ${type}`);
    result.push(`  description: ${JSON.stringify(description)}`);
    if (dueDate) {
      result.push(`  dueDate: ${JSON.stringify(dueDate)}`);
    }
    result.push(`  parent: ${parent}`);
    result.push(`  allParents: ${allParents}`);
    result.push(`  ancestors: ${ancestors}`);
    result.push(`  path: ${path}`);
    result.push(`  depth: ${depth}`);
    result.push(``);
  }

  return result.join("\n").trim();
}
