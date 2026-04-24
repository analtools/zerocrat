import { prettyDate } from "@analtools/zerocrat-source-utils";
import { assert, describe, it } from "vitest";

import { createConfluenceClient } from ".";
import type { ConfluenceApiContext } from "./types";

describe("Confluence E2E", () => {
  const {
    JIRA_HOST: jiraHost,
    CONFLUENCE_HOST: confluenceHost,
    CONFLUENCE_TOKEN: confluenceToken,
    CONFLUENCE_TEST_USERNAME: username,
    CONFLUENCE_TEST_PAGE_ID: pageId,
  } = process.env;

  assert(jiraHost);
  assert(username);
  assert(pageId);
  assert(confluenceHost);
  assert(confluenceToken);

  const context: ConfluenceApiContext = {
    confluenceHost,
    confluenceToken,
    jiraHost,
  };

  const { llm } = createConfluenceClient(context);

  it("llm.getUserActivity", async () => {
    const report = await llm.getUserActivity({
      username,
      fromDate: prettyDate("prev month"),
    });
    console.log(report);
  });

  it("llm.getPage by pageUrl", async () => {
    const markdown = await llm.getPage({
      pageUrl: `${confluenceHost}/pages/viewpage.action?pageId=${pageId}`,
    });
    console.log(markdown);
  });

  it("llm.getPage by pageId", async () => {
    const markdown = await llm.getPage({
      pageId,
    });
    console.log(markdown);
  });

  it("llm.getPageComments by pageId", async () => {
    const comments = await llm.getPageComments({
      pageId,
      refs: new Map([
        ["987e19ee-6e3a-444e-9536-167ce7140b92", 1],
        ["8e5516c7-bca1-4440-85f5-73bd7bb90b3f", 2],
      ]),
    });
    console.log(comments);
  });
});
