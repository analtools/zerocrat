import { request } from "@analtools/zerocrat-source-utils";

import type { GitlabApiContext, MergeRequestNotes } from "../types";
import { TempUniqueItems } from "../utils";

export async function getMergeRequestNotes(
  { gitlabToken, gitlabHost }: GitlabApiContext,
  { projectId, mergeRequestId }: { projectId: number; mergeRequestId: number },
): Promise<MergeRequestNotes[]> {
  const perPage = 20;
  let page = 1;

  const items = new TempUniqueItems<MergeRequestNotes>();

  while (true) {
    const batch = await request({
      host: gitlabHost,
      endpoint: `/api/v4/projects/${projectId}/merge_requests/${mergeRequestId}/notes`,
      method: "get",
      searchParams: {
        page,
        per_page: perPage,
      },
      headers: {
        "PRIVATE-TOKEN": gitlabToken,
      },
    });

    const prevSize = items.size();
    for (const { type, body, author, created_at, id } of batch) {
      items.add({
        type,
        body,
        author: {
          id: author.id,
          name: author.username,
        },
        createdAt: new Date(created_at),
        id,
      });
    }
    const size = items.size();

    if (prevSize === size || batch.length < perPage) {
      return items.read();
    } else {
      page++;
    }
  }
}
