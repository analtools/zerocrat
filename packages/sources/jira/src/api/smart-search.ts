import type { JiraClientContext, SmartSearchOptions } from "../types";
import { formatDate } from "../utils";
import { search } from "./search";

export async function smartSearch(
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

  if(options.project) {
    queries.push(`project = "${options.project}"`);
  }
  if (options.projects && options.projects.length > 0) {
    queries.push(
      `project IN (${options.projects.map((project) => `"${project}"`).join(",")})`,
    );
  }

  if (options.team) {
    queries.push(`team = "${options.team}"`);
  }
  if (options.teams && options.teams.length > 0) {
    queries.push(
      `team IN (${options.teams.map((team) => `"${team}"`).join(",")})`,
    );
  }
  if (options.keys && options.keys.length > 0) {
    queries.push(`key IN (${options.keys.map((key) => `"${key}"`).join(",")})`);
  }
  if (options.component) {
    queries.push(`component = "${options.component}"`);
  }
  if (options.components && options.components.length > 0) {
    queries.push(
      `component IN (${options.components.map((component) => `"${component}"`).join(",")})`,
    );
  }
  if (options.label) {
    queries.push(`component = "${options.label}"`);
  }
  if (options.labels && options.labels.length > 0) {
    queries.push(
      `component IN (${options.labels.map((label) => `"${label}"`).join(",")})`,
    );
  }

  return search(context, {
    jql: queries.join(" AND "),
    fields: options.fields,
    expand: options.expand,
  });
}
