import * as api from "./api";
import * as llm from "./llm";
import type { JiraClientContext } from "./types";

export * as api from "./api";
export * as llm from "./llm";
export * from "./types";

export const createJiraClient = (context: JiraClientContext) =>
  ({
    api: {
      getEpicField: api.getEpicField.bind(null, context),
      getIssuesWithParents: api.getIssuesWithParents.bind(null, context),
      getIssuesWithChildren: api.getIssuesWithChildren.bind(null, context),
      getUserActivity: api.getUserActivity.bind(null, context),
      search: api.search.bind(null, context),
      smartSearch: api.smartSearch.bind(null, context),
    },
    llm: {
      getReportByIssues: llm.getReportByIssues.bind(null, context),
      getUserActivity: llm.getUserActivity.bind(null, context),
    },
  }) satisfies {
    api: Record<keyof typeof api, unknown>;
    llm: Record<keyof typeof llm, unknown>;
  };
