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
      keys: Array.from(new Set(options.keys)),
    }));

  if (issues.length === 0) {
    return [];
  }

  const taskKeys = issues.map((issue) => issue.key);

  const subTaskKeys = Array.from(
    new Set(issues.map((issue) => getIssueChildrenKeys(issue)).flat()),
  );

  const subTasks =
    subTaskKeys.length > 0
      ? await smartSearch(context, {
          keys: subTaskKeys,
        })
      : [];

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
