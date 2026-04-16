import { request } from "@analtools/zerocrat-source-utils";

import type { GitlabApiContext, MergeRequest } from "../types";
import { mergeRequestSelector, TempUniqueItems } from "../utils";

export async function getMergeRequests(
  { gitlabToken, gitlabHost }: GitlabApiContext,
  {
    projectId,
    search,
    createdAfter,
    createdBefore,
    sort,
    orderBy,
  }: {
    projectId: number;
    search?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    sort: "asc" | "desc";
    orderBy?:
      | `created_at`
      | `label_priority`
      | `milestone_due`
      | `popularity`
      | `priority`
      | `title`
      | `updated_at`
      | `merged_at`;
  },
): Promise<MergeRequest[]> {
  const perPage = 20;
  let page = 1;

  const items = new TempUniqueItems<MergeRequest>();

  while (true) {
    const batch = await request({
      host: gitlabHost,
      endpoint: `/api/v4/projects/${projectId}/merge_requests`,
      method: "get",
      searchParams: {
        search,
        created_after: createdAfter ? createdAfter.toISOString() : undefined,
        created_before: createdBefore ? createdBefore.toISOString() : undefined,
        sort,
        order_by: orderBy,
        page,
        per_page: perPage,
      },
      headers: {
        "PRIVATE-TOKEN": gitlabToken,
      },
    });

    const prevSize = items.size();
    for (const item of batch) {
      items.add(mergeRequestSelector(item));
    }
    const size = items.size();

    if (prevSize === size || batch.length < perPage) {
      return items.read();
    } else {
      page++;
    }
  }
}
