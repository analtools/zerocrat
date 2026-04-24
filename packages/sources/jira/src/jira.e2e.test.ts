import { prettyDate } from "@analtools/zerocrat-source-utils";
import { assert, describe, it } from "vitest";

import { createJiraClient } from ".";
import { buildIssueHierarchy } from "./utils";

describe("Jira E2E", () => {
  const {
    JIRA_HOST: jiraHost,
    JIRA_TOKEN: jiraToken,
    JIRA_TEST_USERNAME: username,
    JIRA_TEST_PROJECT: project,
    JIRA_TEST_TASK_KEY: taskKey,
    JIRA_TEST_EPIC_KEY: epicKey,
  } = process.env;

  assert(jiraHost);
  assert(jiraToken);
  assert(username);
  assert(project);
  assert(taskKey);
  assert(epicKey);

  const client = createJiraClient({ jiraHost, jiraToken, debug: false });

  it("llm.getUserActivity", async () => {
    const report = await client.llm.getUserActivity({
      project,
      username,
      fromDate: prettyDate("current week"),
    });
    console.log(report);
  });

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

  it("api.getIssuesWithParents", async () => {
    const issues = await client.api.getIssuesWithParents({ keys: [taskKey] });
    console.log(JSON.stringify(buildIssueHierarchy(issues), null, 2));
  });

  it("api.getIssuesWithChildren", async () => {
    const issues = await client.api.getIssuesWithChildren({
      keys: [epicKey],
    });
    console.log(JSON.stringify(buildIssueHierarchy(issues), null, 2));
  });
});
