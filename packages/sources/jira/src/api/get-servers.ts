import type { JiraClientContext } from "../types";

export function getServers(context: JiraClientContext) {
  return context.servers;
}
