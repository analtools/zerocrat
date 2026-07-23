import * as api from "./api";
import * as llm from "./llm";
import type { GitlabApiContext } from "./types";

export * as api from "./api";
export * as llm from "./llm";
export * from "./types";
import { createJiraClient } from "@analtools/zerocrat-source-jira";

import { getStateFromContext } from "./utils";

export function createGitlabClient(context: GitlabApiContext) {
  if (context.jiraHost && context.jiraToken) {
    const state = getStateFromContext(context);

    state.jiraClient = createJiraClient({
      jiraHost: context.jiraHost,
      jiraToken: context.jiraToken,
      debug: context.debug,
    });
  }

  return {
    api: {
      getJobs: api.getJobs.bind(null, context),
      getMergeRequestNotes: api.getMergeRequestNotes.bind(null, context),
      getMergeRequests: api.getMergeRequests.bind(null, context),
      getNamespaceProjects: api.getNamespaceProjects.bind(null, context),
      getNamespaces: api.getNamespaces.bind(null, context),
      getProject: api.getProject.bind(null, context),
      getUser: api.getUser.bind(null, context),
      getUserActivity: api.getUserActivity.bind(null, context),
    },
    llm: {
      getUserActivity: llm.getUserActivity.bind(null, context),
    },
  } as const satisfies {
    api: Record<keyof typeof api, unknown>;
    llm: Record<keyof typeof llm, unknown>;
  };
}
