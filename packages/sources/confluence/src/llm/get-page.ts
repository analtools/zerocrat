import * as api from "../api";
import type { ConfluenceApiContext } from "../types";
import { extractPageIdFromUrl, htmlToMd } from "../utils";
import { getPageComments } from "./get-page-comments";

type View = { page: boolean; comments: boolean };
type ViewContainer = { view?: Partial<View> };

export async function getPage(
  context: ConfluenceApiContext,
  options: (
    | { pageUrl?: undefined; pageId: string }
    | { pageUrl: string; pageId?: undefined }
  ) &
    ViewContainer,
): Promise<string> {
  const pageId = options.pageId ?? extractPageIdFromUrl(options.pageUrl);

  if (!pageId) {
    return "# HTTP Error 404\n\n Page Not found";
  }

  const view: Partial<View> = options.view ?? {
    page: true,
    comments: true,
  };

  let content: string;
  let refs: Map<string, number> | undefined = undefined;
  const result: string[] = [];

  if (view.page) {
    const { title, html } = await api.getPageById(context, {
      pageId,
    });

    void ({ md: content, refs } = await htmlToMd(context, html));

    result.push(`# ${title}\n\n${content}`);
  }
  if (view.comments) {
    const comments = await getPageComments(context, {
      pageId,
      refs,
    });

    result.push(`# Comments\n\n${comments}`);
  }

  return result.join("\n---\n\n");
}
