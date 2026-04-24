import { formatDate } from "@analtools/zerocrat-source-utils";

import * as api from "../api";
import type { ConfluenceApiContext } from "../types";
import { getFileCategory } from "../utils";

export async function getUserActivity(
  context: ConfluenceApiContext,
  options: {
    username: string;
    fromDate?: Date;
    toDate?: Date;
  },
): Promise<string> {
  const events = await api.getUserActivity(context, options);

  const { username } = options;

  const result: string[] = [];

  result.push(
    `# Confluence Activity - ${options.username}${options.fromDate ? ` - from ${formatDate(options.fromDate)}` : ""} to ${formatDate(options.toDate ?? new Date())}`,
  );
  result.push(``);
  result.push(`CONFLUENCE_HOST = ${context.confluenceHost!}`);
  result.push(``);

  for (const event of events) {
    const spaceLink =
      event.namespaceTitle && event.namespaceUrl
        ? `[${event.namespaceTitle}](${event.namespaceUrl})`
        : "Неизвестное пространство";

    const pageLink =
      event.parentContainerTitle && event.parentContainerUrl
        ? `[${event.parentContainerTitle}](${event.parentContainerUrl})`
        : "Неизвествная страница";

    const documentTitle = `${spaceLink} / ${pageLink}`;

    const isoDate = event.date.toISOString();

    if (event.type === "attachment") {
      const fileCategory = getFileCategory(event.title);
      const categoryText =
        fileCategory === "файл" ? "вложение" : `вложение (${fileCategory})`;
      result.push(
        `📎 @${username} добавил ${categoryText} "${event.title}" к документу "${documentTitle}" (${isoDate})`,
      );
    } else if (event.type === "comment") {
      // Берём текст комментария из excerpt, чистим и обрезаем
      let commentText = event.excerpt ? event.excerpt.trim() : "Без текста.";
      if (!commentText) commentText = "Без текста.";

      // Заменяем переносы на пробелы, убираем лишние пробелы
      commentText = commentText.replace(/\s+/g, " ");

      result.push(
        `💬 @${username} оставил комментарий: "${commentText}" к документу "💬 ${documentTitle}" (${isoDate})`,
      );
    } else if (event.type === "page") {
      result.push(
        `📄 @${username} создал документ "${event.title}" (${isoDate})`,
      );
    } else {
      result.push(
        `⚡ @${username} выполнил действие "${event.title}" к документу "${documentTitle}" (${isoDate})`,
      );
    }
    result.push(``);
  }
  return result.join("\n").trim();
}
