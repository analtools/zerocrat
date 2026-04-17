import { request } from "@analtools/zerocrat-source-utils";

import type { GitlabApiContext, GitlabProject } from "../types";

export async function getProject(
  { gitlabToken, gitlabHost, debug }: GitlabApiContext,
  { projectId }: { projectId: number },
): Promise<GitlabProject> {
  const project = await request({
    host: gitlabHost,
    endpoint: `/api/v4/projects/${projectId}`,
    method: "get",
    searchParams: {},
    headers: {
      "PRIVATE-TOKEN": gitlabToken,
    },
    debug,
  });

  return {
    id: project.id,
    description: project.description,
    name: project.name,
    path: project.path,
    nameWithNamespace: project.name_with_namespace,
    pathWithNamespace: project.path_with_namespace,
    webUrl: project.web_url,
    defaultBranch: project.default_branch,
    lastActivityAt: project.last_activity_at
      ? new Date(project.last_activity_at)
      : null,
  } satisfies GitlabProject;
}
