import type { ConfluenceCommentSimpleTreeNode } from "../types";

export function formatCommentsAsMarkdownIndented(
  comments: ConfluenceCommentSimpleTreeNode[],
  depth = 0,
): string {
  return comments
    .map((comment) => {
      const indent = "\t".repeat(depth);
      const bullet = depth === 0 ? "- " : "\t- ";
      const header = `${indent}${bullet}**${comment.author}**`;
      const extendedComment = `${comment.quote ? `> ${comment.quote}\n\n` : ""}${comment.content}`;
      const content = extendedComment
        .split("\n")
        .map((line, index) => {
          if (index === 0) {
            return `${header}\n${indent}\t${line}`;
          }
          return `${indent}\t${line}`;
        })
        .join("\n");

      const replies = comment.replies.length
        ? "\n" + formatCommentsAsMarkdownIndented(comment.replies, depth + 1)
        : "";

      return content + replies;
    })
    .join("\n\n");
}
