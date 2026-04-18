import type { JiraClientContext, JiraIssue } from "../types";
import { getIssueParentKeys } from "../utils";
import { smartSearch } from "./smart-search";

export async function getIssuesLineage(
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

  const uniqueEpicKeys = new Set(issues.map((issue) => issue.fields.epiclink));
  const uniqueEpicKeysAsArray = Array.from(uniqueEpicKeys).filter(
    Boolean,
  ) as string[];

  const epics = await smartSearch(context, {
    keys: uniqueEpicKeysAsArray,
  });

  const parentKeys = issues.map((issue) => getIssueParentKeys(issue)).flat();

  const uniqueParentKeys = new Set(parentKeys);
  const uniqueParentKeysAsArray = Array.from(uniqueParentKeys);

  const parents = await smartSearch(context, {
    keys: uniqueParentKeysAsArray,
  });

  return [
    ...issues,
    ...(await getIssuesLineage(context, {
      issues: [...epics, ...parents],
    })),
  ];
}
