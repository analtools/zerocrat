import type { JiraClientContext, JiraServerSettings } from "../types";
import { resolveCustomFields } from "./resolve-custom-fields";

const plannedEndFieldNames = [
  "Planned End",
  "Planned end",
  "Target End",
  "Finish Date",
];

export async function getPlannedEndField(
  context: JiraClientContext,
  server: JiraServerSettings,
): Promise<string | null> {
  const customFields = await resolveCustomFields(context, server);

  const [fieldId] = customFields
    .entries()
    .find(([, fieldName]) => plannedEndFieldNames.includes(fieldName)) ?? [
    null,
  ];

  return fieldId;
}
