import { request } from "@analtools/zerocrat-source-utils";

import type {
  ConfluenceApiContext,
  ConfluenceSearchResult,
  ConfluenceSearchSimpleResult,
} from "../types";

export async function search(
  { confluenceHost, confluenceToken }: ConfluenceApiContext,
  {
    cql,
  }: {
    cql: string;
  },
): Promise<ConfluenceSearchSimpleResult[]> {
  let start = 0;
  const limit = 25;

  const result: ConfluenceSearchSimpleResult[] = [];

  while (true) {
    const { results: items } = await request<{
      results: ConfluenceSearchResult[];
    }>({
      host: confluenceHost,
      endpoint: "/rest/api/search",
      searchParams: {
        cql,
        start,
        limit,
      },
      method: "get",
      headers: {
        Authorization: `Bearer ${confluenceToken}`,
      },
    });
    for (const item of items) {
      result.push({
        id: item.content.id,
        type: item.content.type,
        additionalUrl: `${confluenceHost}${item.content._links.webui}`,
        excerpt: item.excerpt === "" ? null : item.excerpt,
        url: `${confluenceHost}${item.url}`,
        title: item.title,
        parentContainerTitle: item?.resultParentContainer?.title ?? null,
        parentContainerUrl: item?.resultParentContainer?.displayUrl
          ? `${confluenceHost}${item?.resultParentContainer?.displayUrl}`
          : null,
        namespaceTitle: item.resultGlobalContainer.title,
        namespaceUrl: `${confluenceHost}${item.resultGlobalContainer.displayUrl}`,
        date: new Date(item.lastModified),
      } satisfies ConfluenceSearchSimpleResult);
    }

    if (items.length < limit) {
      break;
    }
    start += limit;
  }

  return result;
}
