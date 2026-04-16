import type { Element, Node, Parent, Root, Text } from "hast";

import type { ConfluenceApiContext } from "../../types";

function wrapJiraKey(
  { jiraHost }: ConfluenceApiContext,
  jiraKey: string,
): Text | Element {
  const linkText: Text = {
    type: "text",
    value: jiraKey,
  };

  if (jiraHost) {
    return {
      type: "element",
      tagName: "a",
      properties: {
        href: `${jiraHost}/browse/${jiraKey}`,
      },
      children: [linkText],
    } satisfies Element;
  }
  return linkText;
}

/**
 * Рекурсивно обходит дерево и заменяет JIRA макросы на ключ задачи.
 * Модифицирует дерево "на месте" (mutates in place).
 */
function transformTree(context: ConfluenceApiContext, node: Node): void {
  // Если у узла есть дети (это Parent), обрабатываем их
  if ("children" in node && Array.isArray(node.children)) {
    const parent = node as Parent;

    // Проходим по детям. Используем обычный цикл, так как будем модифицировать массив
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i]!;

      if (child.type === "element") {
        const element = child as Element;

        // Проверяем, является ли элемент макросом JIRA
        if (
          element.tagName === "ac:structured-macro" &&
          element.properties?.["ac:name"] === "jira"
        ) {
          let jiraKey: string | null = null;

          // Ищем параметр "key" внутри макроса
          if (element.children) {
            for (const subChild of element.children) {
              if (
                subChild.type === "element" &&
                subChild.tagName === "ac:parameter" &&
                subChild.properties?.["ac:name"] === "key"
              ) {
                // Извлекаем текст из параметра
                const textNode = subChild.children?.[0];
                if (textNode && textNode.type === "text") {
                  jiraKey = textNode.value.trim();
                }
                break; // Ключ найден, выходим из внутреннего цикла
              }
            }
          }

          // Если ключ найден, заменяем весь элемент макроса на текстовый узел
          if (jiraKey) {
            // Заменяем элемент в массиве детей родителя
            parent.children[i] = wrapJiraKey(context, jiraKey);
          }
        } else {
          // Если это не целевой макрос, но это элемент, спускаемся в него рекурсивно
          // (например, чтобы найти макросы внутри div, p и т.д.)
          transformTree(context, element);
        }
      } else {
        // Если ребенок не элемент (например, текст), просто идем дальше
        // (хотя в текстовых узлах детей нет, рекурсия тут безопасна, но бесполезна)
        if ("children" in child) {
          transformTree(context, child);
        }
      }
    }
  }
}

/**
 * Rehype плагин для замены JIRA макросов Confluence на ключ задачи.
 * Использует ручной обход дерева вместо unist-util-visit.
 */
export function rehypeJiraMacroSimplifier(context: ConfluenceApiContext) {
  return () => (tree: Root) => {
    transformTree(context, tree);
  };
}
