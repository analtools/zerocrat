import { request } from "@analtools/zerocrat-source-utils";

import type {
  GitlabApiContext,
  GitLabProjectBasicInfo,
  GitLabProjectFull,
} from "../types";
import { TempUniqueItems } from "../utils";

export async function getNamespaceProjects(
  { gitlabToken, gitlabHost }: GitlabApiContext,
  { namespaceId }: { namespaceId: number },
): Promise<GitLabProjectBasicInfo[]> {
  const perPage = 20;
  let page = 1;

  const items = new TempUniqueItems<GitLabProjectBasicInfo>();

  while (true) {
    const batch: GitLabProjectFull[] = await request({
      host: gitlabHost,
      endpoint: `/api/v4/groups/${namespaceId}/projects`,
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
    for (const project of batch) {
      items.add({
        id: project.id,
        name: project.name,
        description: project.description ?? null,
        pathWithNamespace: project.path_with_namespace,
        webUrl: project.web_url,
        defaultBranch: project.default_branch,
        createdAt: new Date(project.created_at),
        lastActivityAt: new Date(project.last_activity_at),
        visibility: project.visibility,
        archived: project.archived,
        namespace: {
          name: project.namespace.name,
          path: project.namespace.path,
          webUrl: project.namespace.web_url,
        },
      } satisfies GitLabProjectBasicInfo);
    }
    const size = items.size();

    if (prevSize === size || batch.length < perPage) {
      return items.read();
    } else {
      page++;
    }
  }
}
