import type { JiraClientContext, JiraIssue } from "../types";
import { getIssueChildrenKeys } from "../utils";
import { smartSearch } from "./smart-search";

export async function getIssuesWithChildren(
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

  const taskKeys = issues.map((issue) => issue.key);

  const subTasks = await smartSearch(context, {
    keys: issues.map((issue) => getIssueChildrenKeys(issue)).flat(),
  });

  const epicChildren = await smartSearch(context, {
    epicLinks: taskKeys,
  });

  const allChildren = [...subTasks, ...epicChildren];

  if (allChildren.length === 0) {
    return issues;
  }

  return [
    ...issues,
    ...(await getIssuesWithChildren(context, {
      issues: allChildren,
    })),
  ];
}
