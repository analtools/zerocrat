import type { JiraClientContext, JiraServerSettings } from "../types";
import { resolveCustomFields } from "./resolve-custom-fields";

export async function getInitiativeClassificationField(
  context: JiraClientContext,
  server: JiraServerSettings,
): Promise<string | null> {
  const customFields = await resolveCustomFields(context, server);

  const [fieldId] = customFields
    .entries()
    .find(([, fieldName]) => fieldName === "Initiative classification") ?? [
    null,
  ];

  return fieldId;
}
