import * as api from "./api";
import * as llm from "./llm";
import type { ConfluenceApiContext } from "./types";

export * as api from "./api";
export * as llm from "./llm";
export * from "./types";

export const createConfluenceClient = (context: ConfluenceApiContext) =>
  ({
    api: {
      getCommentsByContentId: api.getCommentsByContentId.bind(null, context),
      getPageById: api.getPageById.bind(null, context),
      getUserActivity: api.getUserActivity.bind(null, context),
      search: api.search.bind(null, context),
    },
    llm: {
      getPage: llm.getPage.bind(null, context),
      getPageComments: llm.getPageComments.bind(null, context),
      getUserActivity: llm.getUserActivity.bind(null, context),
    },
  }) satisfies {
    api: Record<keyof typeof api, unknown>;
    llm: Record<keyof typeof llm, unknown>;
  };
