import type { JiraClientContext, JiraServerSettings } from "../types";
import { resolveCustomFields } from "./resolve-custom-fields";

export async function getInitiativeClassificationField(
  context: JiraClientContext,
  server: JiraServerSettings,
): Promise<string | null> {
  const customFields = await resolveCustomFields(context, server);

  for (const [fieldId, fieldName] of customFields.entries()) {
    if (fieldName === "Initiative classification") {
      return fieldId;
    }
  }

  return null;
}
