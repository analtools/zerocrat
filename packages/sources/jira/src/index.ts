import * as api from "./api";
import * as llm from "./llm";
import type { JiraClientContext } from "./types";

export * as api from "./api";
export * as llm from "./llm";
export * from "./types";
export * as utils from "./utils";

export function createJiraClient(context: JiraClientContext) {
  return {
    api: {
      getChangeTypeField: api.getChangeTypeField.bind(null, context),
      getEpicField: api.getEpicField.bind(null, context),
      getInitiativeClassificationField:
        api.getInitiativeClassificationField.bind(null, context),
      getIssuesWithChildren: api.getIssuesWithChildren.bind(null, context),
      getIssuesWithParents: api.getIssuesWithParents.bind(null, context),
      getPlannedEndField: api.getPlannedEndField.bind(null, context),
      getServers: api.getServers.bind(null, context),
      getUserActivity: api.getUserActivity.bind(null, context),
      resolveCustomFields: api.resolveCustomFields.bind(null, context),
      search: api.search.bind(null, context),
      smartSearch: api.smartSearch.bind(null, context),
    },
    llm: {
      getReportByIssues: llm.getReportByIssues.bind(null, context),
      getUserActivity: llm.getUserActivity.bind(null, context),
    },
  } as const;
}
export type JiraClient = ReturnType<typeof createJiraClient>;
