import { request } from "@analtools/zerocrat-source-utils";

import type { ConfluenceApiContext } from "../types";

export async function getPageById(
  { confluenceHost: host, confluenceToken: token, debug }: ConfluenceApiContext,
  { pageId }: { pageId: string },
): Promise<{ html: string; title: string }> {
  const {
    title,
    body: {
      storage: { value: html },
    },
  } = await request<{
    title: string;
    body: { storage: { value: string } };
  }>({
    host,
    endpoint: `/rest/api/content/${pageId}`,
    searchParams: {
      expand: "body.storage",
    },
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    debug,
  });

  return { html, title };
}
