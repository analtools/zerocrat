import type { Element, Parent, Text } from "hast";
import { visit } from "unist-util-visit";

function isElement(node: unknown): node is Element {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Element).type === "element"
  );
}

function getText(node: Element): string {
  let result = "";

  visit(node, (child) => {
    if ((child as Text).type === "text") {
      result += (child as Text).value;
    }
  });

  return result;
}

export function rehypeConfluenceTasks() {
  return (tree: Parent) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "ac:task-list" || index == null || parent == null) {
        return;
      }

      const ul: Element = {
        type: "element",
        tagName: "ul",
        properties: {
          className: ["contains-task-list"],
        },
        children: [],
      };

      for (const child of node.children) {
        if (!isElement(child) || child.tagName !== "ac:task") {
          continue;
        }

        const status = child.children.find(
          (c): c is Element => isElement(c) && c.tagName === "ac:task-status",
        );

        const body = child.children.find(
          (c): c is Element => isElement(c) && c.tagName === "ac:task-body",
        );

        if (!status || !body) {
          continue;
        }

        const checked = getText(status).trim() === "complete";

        ul.children.push({
          type: "element",
          tagName: "li",
          properties: {
            className: ["task-list-item"],
          },
          children: [
            {
              type: "element",
              tagName: "input",
              properties: {
                type: "checkbox",
                checked,
                disabled: true,
              },
              children: [],
            },
            {
              type: "text",
              value: " ",
            },
            ...body.children,
          ],
        });
      }

      parent.children[index] = ul;
    });
  };
}
