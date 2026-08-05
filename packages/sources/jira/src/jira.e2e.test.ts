import { prettyDate } from "@analtools/zerocrat-source-utils";
import { assert, describe, it } from "vitest";

import { createJiraClient } from ".";
import { buildIssueHierarchy } from "./utils";

describe("Jira E2E", () => {
  const {
    JIRA_HOST_1: jiraHost1,
    JIRA_TOKEN_1: jiraToken1,
    JIRA_HOST_2: jiraHost2,
    JIRA_TOKEN_2: jiraToken2,
    JIRA_TEST_USERNAME: username,
    JIRA_TEST_PROJECT: project,
    JIRA_TEST_TASK_KEY: taskKey,
    JIRA_TEST_EPIC_KEY: epicKey,
    JIRA_PUBLIC_HOST: publicJiraHost,
  } = process.env;

  assert(jiraHost1);
  assert(jiraToken1);
  assert(jiraHost2);
  assert(jiraToken2);
  assert(username);
  assert(project);
  assert(taskKey);
  assert(epicKey);

  const client = createJiraClient({
    servers: [
      { host: jiraHost1, token: jiraToken1 },
      { host: jiraHost2, token: jiraToken2 },
    ],
    publicHost: publicJiraHost,
    debug: false,
  });

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

  it("api.getUserActivity by actor", async () => {
    const items = await client.api.getUserActivity({
      actor: username,
      fromDate: prettyDate("prev week"),
    });
    console.log(items.length);
    console.log(JSON.stringify(items, null, 2));
  });

  it("api.getPlannedEndField", async () => {
    const servers = client.api.getServers();
    const result = await Promise.all(
      servers.map((server) =>
        client.api
          .getPlannedEndField(server)
          .then((field) => ({ host: server.host, field })),
      ),
    );
    console.log(result);
  });

  it("api.getEpicField", async () => {
    const servers = client.api.getServers();
    const result = await Promise.all(
      servers.map((server) =>
        client.api
          .getEpicField(server)
          .then((field) => ({ host: server.host, field })),
      ),
    );
    console.log(result);
  });

  it("api.getInitiativeClassificationField", async () => {
    const servers = client.api.getServers();
    const result = await Promise.all(
      servers.map((server) =>
        client.api
          .getInitiativeClassificationField(server)
          .then((field) => ({ host: server.host, field })),
      ),
    );
    console.log(result);
  });

  it("api.getChangeTypeField", async () => {
    const servers = client.api.getServers();
    const result = await Promise.all(
      servers.map((server) =>
        client.api
          .getChangeTypeField(server)
          .then((field) => ({ host: server.host, field })),
      ),
    );
    console.log(result);
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
