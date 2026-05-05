import type { JiraClientContext, JiraClientContextState } from "../types";

const states = new WeakMap<JiraClientContext, JiraClientContextState>();

export function getStateFromContext(
  context: JiraClientContext,
): JiraClientContextState {
  if (states.has(context)) {
    return states.get(context)!;
  }
  const state: JiraClientContextState = {};
  states.set(context, state);
  return state;
}
