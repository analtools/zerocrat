import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

import type { ConfluenceApiContext } from "../types";
import { rehypeAcRef } from "./rehype-plugins/rehype-ac-ref";
import { rehypeConfluenceTasks } from "./rehype-plugins/rehype-checkboxes";
import { rehypeJiraMacroSimplifier } from "./rehype-plugins/rehype-jira-macro-simplifier";

export async function htmlToMd(
  context: ConfluenceApiContext,
  html: string,
): Promise<{
  md: string;
  refs: Map<string, number>;
}> {
  const refs = new Map<string, number>();
  const vFile = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeAcRef(refs))
    .use(rehypeJiraMacroSimplifier(context))
    .use(rehypeConfluenceTasks)
    .use(rehypeRemark)
    .use(remarkGfm, {
      tablePipeAlign: false,
      tableCellPadding: true,
    })
    .use(remarkStringify, {
      bullet: "-",
      rule: "-",
      listItemIndent: "one",
    })
    .process(html);

  return {
    md: String(vFile),
    refs,
  };
}
