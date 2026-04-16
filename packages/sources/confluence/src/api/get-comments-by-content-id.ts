import { request } from "@analtools/zerocrat-source-utils";

import type { ConfluenceApiContext, ConfluenceComment } from "../types";

export async function getCommentsByContentId(
  { confluenceToken, confluenceHost }: ConfluenceApiContext,
  contentId: string,
): Promise<ConfluenceComment[]> {
  let start = 0;
  const limit = 25;

  const result: ConfluenceComment[] = [];

  do {
    const { results: items } = await request<{
      results: ConfluenceComment[];
    }>({
      host: confluenceHost,
      endpoint: `/rest/api/content/${contentId}/child/comment`,
      searchParams: {
        expand: "body.storage,extensions.inlineProperties,history",
        start,
        limit,
      },
      method: "get",
      headers: {
        Authorization: `Bearer ${confluenceToken}`,
      },
    });

    result.push(...items);

    if (items.length < limit) {
      break;
    }
    start += limit;
    // eslint-disable-next-line no-constant-condition
  } while (true);

  return result;
}
