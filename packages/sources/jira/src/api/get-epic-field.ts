import { request } from "@analtools/zerocrat-source-utils";

import type { JiraClientContext } from "../types";

export async function getEpicField({
  jiraHost,
  jiraToken,
}: JiraClientContext): Promise<string|null> {
  const fields: { name: string; id: string }[] = await request({
    host: jiraHost,
    endpoint: "/rest/api/2/field",
    searchParams: {},
    method: "get",
    headers: {
      Authorization: `Bearer ${jiraToken}`,
    },
    debug: false,
  });

  const epicField = fields.find(({name}) => name === "Epic Link");
  return epicField?.id || null;
}
