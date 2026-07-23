import type { JiraClientContext, JiraIssue } from "../types";
import { getIssueParentKeys } from "../utils";
import { smartSearch } from "./smart-search";

export async function getIssuesWithParents(
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
): Promise<JiraIssue[]> {
  const issues =
    options.issues ??
    (await smartSearch(context, {
      keys: options.keys,
    }));

  if (issues.length === 0) {
    return [];
  }

  const epicLinks = issues
    .map((issue) => issue.fields.epiclink)
    .filter(Boolean) as string[];

  const epics = await smartSearch(context, {
    keys: epicLinks,
  });

  const parentKeys = issues.map((issue) => getIssueParentKeys(issue)).flat();

  const parents = await smartSearch(context, {
    keys: parentKeys,
  });

  return [
    ...issues,
    ...(await getIssuesWithParents(context, {
      issues: [...epics, ...parents],
    })),
  ];
}
