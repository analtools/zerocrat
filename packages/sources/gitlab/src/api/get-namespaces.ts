import { request } from "@analtools/zerocrat-source-utils";

import type { GitlabApiContext, Namespace } from "../types";
import { TempUniqueItems } from "../utils";

export async function getNamespaces(
  { gitlabToken, gitlabHost }: GitlabApiContext,
  { search }: { search?: string },
): Promise<Namespace[]> {
  const perPage = 20;
  let page = 1;

  const items = new TempUniqueItems<Namespace>();

  while (true) {
    const batch = await request({
      host: gitlabHost,
      endpoint: `/api/v4/namespaces`,
      method: "get",
      searchParams: {
        page,
        per_page: perPage,
        search,
      },
      headers: {
        "PRIVATE-TOKEN": gitlabToken,
      },
    });

    const prevSize = items.size();
    for (const { id, name, path, kind, avatar_url, web_url } of batch) {
      items.add({
        id,
        name,
        path,
        kind,
        avatarUrl: avatar_url,
        webUrl: web_url,
      } satisfies Namespace);
    }
    const size = items.size();

    if (prevSize === size || batch.length < perPage) {
      return items.read();
    } else {
      page++;
    }
  }
}
