import type { JiraClientContext, JiraServerSettings } from "../types";
import { resolveCustomFields } from "./resolve-custom-fields";

export async function getEpicField(
  context: JiraClientContext,
  server: JiraServerSettings,
): Promise<string | null> {
  const customFields = await resolveCustomFields(context, server);

  for (const [fieldId, fieldName] of customFields.entries()) {
    if (fieldName === "Epic Link") {
      return fieldId;
    }
  }

  return null;
}
