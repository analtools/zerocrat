import { request } from "@analtools/zerocrat-source-utils";

import type { JiraClientContext, JiraServerSettings } from "../types";

const customFieldsCache = new WeakMap<
  JiraClientContext,
  WeakMap<JiraServerSettings, Map<string, string>>
>();

function getCustomFieldsCache(
  context: JiraClientContext,
  server: JiraServerSettings,
): Map<string, string> | undefined {
  if (!customFieldsCache.has(context)) {
    return undefined;
  }
  return customFieldsCache.get(context)?.get(server);
}

function setCustomFieldsCache(
  context: JiraClientContext,
  server: JiraServerSettings,
  cache: Map<string, string>,
): void {
  if (!customFieldsCache.has(context)) {
    customFieldsCache.set(context, new WeakMap());
  }
  customFieldsCache.get(context)!.set(server, cache);
}

export async function resolveCustomFields(
  context: JiraClientContext,
  server: JiraServerSettings,
): Promise<Map<string, string>> {
  const cached = getCustomFieldsCache(context, server);
  if (cached !== undefined) {
    return cached;
  }

  const fields: { name: string; id: string }[] = await request({
    host: server.host,
    endpoint: "/rest/api/2/field",
    searchParams: {},
    method: "get",
    headers: {
      Authorization: `Bearer ${server.token}`,
    },
  });

  const customFields = new Map<string, string>();
  for (const field of fields) {
    customFields.set(field.id, field.name);
  }

  setCustomFieldsCache(context, server, customFields);
  return customFields;
}
