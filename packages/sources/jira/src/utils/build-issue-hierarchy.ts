import type { JiraIssue, JiraIssueHierarchyItem } from "../types";
import { getIssueParentKeys } from "./get-issue-parent-keys";

function resolveParents(issue: JiraIssue): string[] {
  const parents = new Set<string>();

  if (issue.fields.epiclink) {
    parents.add(issue.fields.epiclink);
  }

  for (const parentKey of getIssueParentKeys(issue)) {
    parents.add(parentKey);
  }

  return Array.from(parents);
}

function resolvePrimaryParent(parents: string[]): string | null {
  if (parents.length === 0) {
    return null;
  }

  return parents[0]!;
}

function getAncestors(
  map: Map<string, JiraIssue>,
  ancestorsCache: Map<string, string[]>,
  key: string,
  visited = new Set<string>(),
): string[] {
  if (ancestorsCache.has(key)) {
    return ancestorsCache.get(key)!;
  }

  if (visited.has(key)) {
    return [];
  }

  visited.add(key);

  const issue = map.get(key);
  if (!issue) return [];

  const parents = resolveParents(issue);
  const primary = resolvePrimaryParent(parents);

  if (!primary) {
    ancestorsCache.set(key, []);
    return [];
  }

  const parentAncestors = getAncestors(map, ancestorsCache, primary, visited);
  const result = [primary, ...parentAncestors];

  ancestorsCache.set(key, result);
  return result;
}

export function buildIssueHierarchy(
  issues: JiraIssue[],
): JiraIssueHierarchyItem[] {
  const map = new Map<string, JiraIssue>();

  for (const issue of issues) {
    map.set(issue.key, issue);
  }

  const ancestorsCache = new Map<string, string[]>();

  const result: JiraIssueHierarchyItem[] = [];

  for (const issue of issues) {
    const allParents = resolveParents(issue);
    const parent = resolvePrimaryParent(allParents);

    const ancestors = getAncestors(map, ancestorsCache, issue.key);
    const depth = ancestors.length;

    const type = issue.fields.issuetype.name;

    const path = [...ancestors.slice().reverse(), issue.key]
      .map((key) => JSON.stringify(key))
      .join(" > ");

    result.push({
      key: issue.key,
      type,
      name: issue.fields.summary,
      description: issue.fields.description,
      parent,
      allParents,
      ancestors,
      path,
      depth,
    });
  }

  result.sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
  });

  return result;
}
