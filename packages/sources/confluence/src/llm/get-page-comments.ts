import * as api from "../api";
import type {
  ConfluenceApiContext,
  ConfluenceComment,
  ConfluenceCommentSimpleTreeNode,
} from "../types";
import { formatCommentsAsMarkdownIndented, htmlToMd } from "../utils";

async function buildTree(
  context: ConfluenceApiContext,
  {
    comment,
    refs,
  }: {
    comment: ConfluenceComment;
    refs: Map<string, number>;
  },
): Promise<ConfluenceCommentSimpleTreeNode> {
  const children = await api.getCommentsByContentId(
    context,
    comment.id,
  );

  const replies = await Promise.all(
    children.map((child) =>
      buildTree(context, {
        comment: child,
        refs,
      }),
    ),
  );

  let quote: string | null = null;
  const originalSelection =
    comment.extensions?.inlineProperties?.originalSelection;
  if (originalSelection) {
    quote = (await htmlToMd(context, originalSelection)).md.trim();
  }
  const markerRef = comment.extensions?.inlineProperties?.markerRef;
  if (markerRef) {
    quote += ` \\[${refs.get(markerRef) ?? markerRef}]`;
  }

  return {
    author: comment.history?.createdBy?.displayName ?? "Unknown user",
    content: (await htmlToMd(context, comment.body?.storage?.value ?? "")).md,
    quote,
    replies,
  };
}

export async function getPageComments(
  context: ConfluenceApiContext,
  {
    pageId,
    refs = new Map(),
  }: {
    pageId: string;
    refs?: Map<string, number>;
  },
): Promise<string> {
  const topLevel = await api.getCommentsByContentId(context, pageId);

  const comments = await Promise.all(
    topLevel.map((comment) =>
      buildTree(context, {
        comment,
        refs,
      }),
    ),
  );

  return formatCommentsAsMarkdownIndented(comments);
}
