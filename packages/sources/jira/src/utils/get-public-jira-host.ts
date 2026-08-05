import type { JiraServerSettings } from "../types";

export function getPublicJiraHost(
  servers: JiraServerSettings[],
  publicJiraHost?: string,
) {
  return publicJiraHost ?? servers.map((server) => server.host).join(", ");
}
