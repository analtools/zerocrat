import { request } from "@analtools/zerocrat-source-utils";

import type { GitlabApiContext, GitLabUser } from "../types";

export async function getUser(
  { gitlabToken, gitlabHost, debug }: GitlabApiContext,
  {
    username,
    userId,
  }:
    { username: string; userId?: never } | { username?: never; userId: number },
): Promise<GitLabUser | null> {
  let users: [
    {
      id: GitLabUser["id"];
      username: GitLabUser["username"];
      name: GitLabUser["name"];
      state: GitLabUser["state"];
      avatar_url: GitLabUser["avatarUrl"];
      web_url: GitLabUser["webUrl"];
    },
  ];

  if (username) {
    users = await request({
      host: gitlabHost,
      endpoint: `/api/v4/users`,
      method: "get",
      searchParams: { username },
      headers: {
        "PRIVATE-TOKEN": gitlabToken,
      },
      debug,
    });
  } else {
    users = [
      await request({
        host: gitlabHost,
        endpoint: `/api/v4/users/${userId}`,
        method: "get",
        searchParams: {},
        headers: {
          "PRIVATE-TOKEN": gitlabToken,
        },
        debug,
      }),
    ];
  }

  if (users[0]) {
    const user = users[0]!;
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      state: user.state,
      avatarUrl: user.avatar_url,
      webUrl: user.web_url,
    };
  }

  return null;
}
