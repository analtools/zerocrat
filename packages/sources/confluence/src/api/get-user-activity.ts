import { formatDate } from "@analtools/zerocrat-source-utils";

import * as api from "../api";
import type {
  ConfluenceApiContext,
  ConfluenceSearchSimpleResult,
} from "../types";

export async function getUserActivity(
  context: ConfluenceApiContext,
  {
    username,
    fromDate,
    toDate,
  }: {
    username: string;
    fromDate?: Date;
    toDate?: Date;
  },
): Promise<ConfluenceSearchSimpleResult[]> {
  let cql = `creator="${username}"`;

  if (fromDate) {
    const formattedDate = formatDate(fromDate);
    cql += ` AND (created >= '${formattedDate}' OR lastModified >= '${formattedDate}')`;
  }
  if (toDate) {
    const formattedDate = formatDate(toDate);
    cql += ` AND (created <= '${formattedDate}' OR lastModified <= '${formattedDate}')`;
  }

  const events = await api.search(context, {
    cql,
  });

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return events;
}
