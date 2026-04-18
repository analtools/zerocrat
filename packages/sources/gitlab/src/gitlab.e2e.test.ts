import { prettyDate } from "@analtools/zerocrat-source-utils";
import { assert, describe, it } from "vitest";

import { createGitlabClient } from ".";

describe("Gitlab E2E", () => {
  const {
    GITLAB_TOKEN: gitlabToken,
    GITLAB_HOST: gitlabHost,
    GITLAB_TEST_USERNAME: username,
    GITLAB_TEST_USER_ID: userIdAsString,
    GITLAB_TEST_NAMESPACE_ID: namespaceIdAsString,
    GITLAB_TEST_PROJECT_ID: projectIdAsString,
    GITLAB_TEST_MR_ID: mergeRequestIdAsString,
  } = process.env;

  assert(gitlabToken);
  assert(gitlabHost);
  assert(username);
  assert(userIdAsString);
  assert(namespaceIdAsString);
  assert(projectIdAsString);
  assert(mergeRequestIdAsString);

  const userId = Number(userIdAsString);
  const namespaceId = Number(namespaceIdAsString);
  const projectId = Number(projectIdAsString);
  const mergeRequestId = Number(mergeRequestIdAsString);

  const { api } = createGitlabClient({
    gitlabHost,
    gitlabToken,
  });

  it("api.getNamespaces", async () => {
    const items = await api.getNamespaces({ search: "" });
    console.log(items);
  });

  it("api.getNamespaceProjects", async () => {
    const items = await api.getNamespaceProjects({ namespaceId });
    console.log(items);
  });

  it("api.getMergeRequests", async () => {
    const createdAfter = new Date();
    createdAfter.setFullYear(2025);
    const items = await api.getMergeRequests({
      projectId,
      sort: "desc",
      createdAfter,
    });
    console.log(items);
  });

  it("api.getMergeRequestNotes", async () => {
    const items = await api.getMergeRequestNotes({
      projectId,
      mergeRequestId,
    });
    console.log(items);
  });

  it("api.getUser", async () => {
    const items = await api.getUser({
      username,
    });
    console.log(items);
  });

  it("getUser", async () => {
    const items = await api.getUser({
      userId,
    });
    console.log(items);
  });

  it("getUserActivity", async () => {
    const items = await api.getUserActivity({
      username,
      fromDate: prettyDate("current week"),
    });
    console.log(JSON.stringify(items, null, 2));
  });

  it("getProject", async () => {
    const project = await api.getProject({
      projectId,
    });
    console.log(JSON.stringify(project, null, 2));
  });
});
