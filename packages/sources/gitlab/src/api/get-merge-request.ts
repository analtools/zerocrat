import { request } from "@analtools/zerocrat-source-utils";

import type { GitlabApiContext, MergeRequest } from "../types";
import { mergeRequestSelector } from "../utils";

export async function getMergeRequest(
  { gitlabToken, gitlabHost, debug }: GitlabApiContext,
  {
    projectId,
    mergeRequestId,
  }: {
    projectId: number;
    mergeRequestId: number;
  },
): Promise<MergeRequest> {
  const result = await request({
    host: gitlabHost,
    endpoint: `/api/v4/projects/${projectId}/merge_requests/${mergeRequestId}`,
    method: "get",
    searchParams: {},
    headers: {
      "PRIVATE-TOKEN": gitlabToken,
    },
    debug,
  });

  return mergeRequestSelector(result);
}
