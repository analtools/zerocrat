import type { Root, Text } from "hast";

// Кастомный rehype-плагин для обработки ac:ref
export function rehypeAcRef(refs: Map<string, number>) {
  return () => {
    return (tree: Root) => {
      // Рекурсивно обходим все узлы
      function walk(node: any) {
        if (node.type === "element" && node.properties) {
          const props = node.properties;

          // Проверяем, есть ли ac:ref
          if (typeof props["ac:ref"] === "string") {
            const refId = props["ac:ref"];
            delete props["ac:ref"]; // удаляем атрибут

            refs.set(refId, refs.size + 1);
            // Добавляем `[refId]` как текст в конец содержимого элемента
            const refText: Text = {
              type: "text",
              value: ` [${refs.get(refId)}]`,
            };

            if (!node.children) {
              node.children = [];
            }

            // Добавляем текст в конец
            node.children.push(refText);
          }
        }

        // Обходим детей
        if (Array.isArray(node.children)) {
          node.children.forEach(walk);
        }
      }

      walk(tree);
    };
  };
}
