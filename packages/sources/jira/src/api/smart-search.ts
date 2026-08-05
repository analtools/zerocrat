import { formatDate } from "@analtools/zerocrat-source-utils";

import type {
  JiraClientContext,
  JiraIssue,
  SmartSearchOptions,
} from "../types";
import { deduplicateIssues } from "../utils";
import { search } from "./search";

const BATCH_SIZE = 25;

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size);
    if (chunk.length > 0) {
      result.push(chunk);
    }
  }

  return result;
}

async function fetchIssues(
  context: JiraClientContext,
  options: SmartSearchOptions,
) {
  const queries: string[] = [];

  if (options.fromDate) {
    queries.push(`updated >= ${formatDate(options.fromDate)}`);
  }
  if (options.toDate) {
    queries.push(`updated <= ${formatDate(options.toDate)}`);
  }

  if (options.project) {
    queries.push(`project = "${options.project}"`);
  }
  if (options.status) {
    queries.push(`status = "${options.status}"`);
  }
  if (options.projects && options.projects.length > 0) {
    queries.push(
      `project IN (${Array.from(new Set(options.projects))
        .map((project) => `"${project}"`)
        .join(",")})`,
    );
  }
  if (options.actor || (options.actors && options.actors.length > 0)) {
    const actors = options.actor ? [options.actor] : options.actors!;
    const actorsQuery: string[] = [];
    actorsQuery.push(
      `creator IN (${Array.from(new Set(actors))
        .map((actor) => `"${actor}"`)
        .join(",")})`,
    );
    actorsQuery.push(
      `assignee WAS IN (${Array.from(new Set(actors))
        .map((actor) => `"${actor}"`)
        .join(",")})`,
    );
    actorsQuery.push(
      `status CHANGED BY (${Array.from(new Set(actors))
        .map((actor) => `"${actor}"`)
        .join(",")})`,
    );
    queries.push(`(${actorsQuery.join(" OR ")})`);
  }

  if (options.epicLink) {
    queries.push(`"Epic Link" = "${options.epicLink}"`);
  }
  if (options.epicLinks && options.epicLinks.length > 0) {
    queries.push(
      `"Epic Link" IN (${Array.from(new Set(options.epicLinks))
        .map((epicLink) => `"${epicLink}"`)
        .join(",")})`,
    );
  }

  if (options.issueType) {
    queries.push(`issueType = "${options.issueType}"`);
  }
  if (options.issueTypes && options.issueTypes.length > 0) {
    queries.push(
      `issueType IN (${Array.from(new Set(options.issueTypes))
        .map((issueType) => `"${issueType}"`)
        .join(",")})`,
    );
  }

  if (options.team) {
    queries.push(`team = "${options.team}"`);
  }
  if (options.teams && options.teams.length > 0) {
    queries.push(
      `team IN (${Array.from(new Set(options.teams))
        .map((team) => `"${team}"`)
        .join(",")})`,
    );
  }

  if (options.keys && options.keys.length > 0) {
    queries.push(
      `key IN (${Array.from(new Set(options.keys))
        .map((key) => `"${key}"`)
        .join(",")})`,
    );
  }

  if (options.component) {
    queries.push(`component = "${options.component}"`);
  }
  if (options.components && options.components.length > 0) {
    queries.push(
      `component IN (${Array.from(new Set(options.components))
        .map((component) => `"${component}"`)
        .join(",")})`,
    );
  }
  if (options.label) {
    queries.push(`component = "${options.label}"`);
  }
  if (options.labels && options.labels.length > 0) {
    queries.push(
      `component IN (${Array.from(new Set(options.labels))
        .map((label) => `"${label}"`)
        .join(",")})`,
    );
  }

  if (queries.length === 0) {
    return [];
  }

  return search(context, {
    jql: queries.join(" AND "),
    fields: options.fields,
    expand: options.expand,
  });
}

export async function smartSearch(
  context: JiraClientContext,
  options: SmartSearchOptions,
): Promise<JiraIssue[]> {
  const issues: JiraIssue[] = [];
  const optionsQueue: SmartSearchOptions[] = [options];

  for (let i = 0; i < optionsQueue.length; i++) {
    const currentOptions = optionsQueue[i]!;
    if (currentOptions.keys && currentOptions.keys.length > BATCH_SIZE) {
      const keyBatches = chunkArray(
        Array.from(new Set(currentOptions.keys)),
        BATCH_SIZE,
      );
      optionsQueue[i] = { ...currentOptions, keys: keyBatches[0] };
      for (let j = 1; j < keyBatches.length; j++) {
        optionsQueue.push({ ...currentOptions, keys: keyBatches[j] });
      }
    }
  }

  for (let i = 0; i < optionsQueue.length; i++) {
    const currentOptions = optionsQueue[i]!;
    if (
      currentOptions.epicLinks &&
      currentOptions.epicLinks.length > BATCH_SIZE
    ) {
      const epicLinkBatches = chunkArray(
        Array.from(new Set(currentOptions.epicLinks)),
        BATCH_SIZE,
      );
      optionsQueue[i] = { ...currentOptions, epicLinks: epicLinkBatches[0] };
      for (let j = 1; j < epicLinkBatches.length; j++) {
        optionsQueue.push({ ...currentOptions, epicLinks: epicLinkBatches[j] });
      }
    }
  }

  for (const currentOptions of optionsQueue) {
    issues.push(...(await fetchIssues(context, currentOptions)));
  }

  return deduplicateIssues(issues);
}
