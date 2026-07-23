import type { GitlabApiContext, GitlabApiContextState } from "../types";

const states = new WeakMap<GitlabApiContext, GitlabApiContextState>();

export function getStateFromContext(
  context: GitlabApiContext,
): GitlabApiContextState {
  if (states.has(context)) {
    return states.get(context)!;
  }
  const state: GitlabApiContextState = {};
  states.set(context, state);
  return state;
}
