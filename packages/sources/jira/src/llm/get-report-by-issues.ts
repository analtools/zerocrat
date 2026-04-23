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
    parent,
    allParents,
    ancestors,
    path,
    depth,
  } of hierarchy) {
    result.push(`- task: ${JSON.stringify(key)}`);
    result.push(`  type: ${JSON.stringify(type)}`);
    result.push(`  name: ${JSON.stringify(name)}`);
    result.push(`  description: ${JSON.stringify(description)}`);
    result.push(`  parent: ${JSON.stringify(parent)}`);
    result.push(`  allParents: ${JSON.stringify(allParents)}`);
    result.push(`  ancestors: ${JSON.stringify(ancestors)}`);
    result.push(`  path: ${path}`);
    result.push(`  depth: ${depth}`);
    result.push(``);
  }

  return result.join("\n").trim();
}
