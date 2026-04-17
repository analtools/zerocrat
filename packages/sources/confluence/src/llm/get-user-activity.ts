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
): Promise<string[]> {
  const events = await api.getUserActivity(context, options);

  const { username } = options;

  return events.map((event) => {
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
      return `📎 @${username} добавил ${categoryText} "${event.title}" к документу "${documentTitle}" (${isoDate})`;
    }

    if (event.type === "comment") {
      // Берём текст комментария из excerpt, чистим и обрезаем
      let commentText = event.excerpt ? event.excerpt.trim() : "Без текста.";
      if (!commentText) commentText = "Без текста.";

      // Заменяем переносы на пробелы, убираем лишние пробелы
      commentText = commentText.replace(/\s+/g, " ");

      return `💬 @${username} оставил комментарий: "${commentText}" к документу "💬 ${documentTitle}" (${isoDate})`;
    }

    if (event.type === "page") {
      return `📄 @${username} создал документ "${event.title}" (${isoDate})`;
    }

    return `⚡ @${username} выполнил действие "${event.title}" к документу "${documentTitle}" (${isoDate})`;
  });
}
