import { prettyDate } from "@analtools/zerocrat-source-utils";
import { assert, describe, it } from "vitest";

import { createJiraClient } from ".";

describe("Jira E2E", () => {
  const {
    JIRA_HOST: jiraHost,
    JIRA_TOKEN: jiraToken,
    GITLAB_JIRA_USERNAME: username,
    GITLAB_JIRA_PROJECT: project,
  } = process.env;

  assert(jiraHost);
  assert(jiraToken);
  assert(username);
  assert(project);

  const client = createJiraClient({ jiraHost, jiraToken });

  it("api.search", async () => {
    const jql = `project = "${project}" AND updated > -1d`;
    const items = await client.api.search({ jql });
    console.log(JSON.stringify(items, null, 2));
  });

  it("api.getUserActivity", async () => {
    const items = await client.api.getUserActivity({
      project,
      username,
      fromDate: prettyDate("current week"),
    });
    console.log(items.length);
    console.log(JSON.stringify(items, null, 2));
  });

  it("api.getEpicField", async () => {
    const field = await client.api.getEpicField();
    console.log(field);
  });
});
