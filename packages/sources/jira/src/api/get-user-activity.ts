import type {
  JiraChangelogItem,
  JiraClientContext,
  JiraEvent,
  SmartSearchOptions,
} from "../types";
import { getChangelogByIssues } from "../utils";
import { smartSearch } from "./smart-search";

function getEventsByChangelog(changelog: JiraChangelogItem[]): JiraEvent[] {
  return changelog.map((item: JiraChangelogItem): JiraEvent => {
    const { field = "Unknown", fromString, toString } = item;

    const event: JiraEvent = {
      username: item.username,
      issue: {
        key: item.issue.key,
        summary: item.issue.fields.summary,
        description: item.issue.fields.description,
        issueLinks: item.issue.fields.issuelinks ?? [],
        epicLink: item.issue.fields.epiclink ?? null,
      },
      date: item.date,
      action: `Field "${field![0]!.toUpperCase() + field.slice(1)}" updated`,
      from: fromString,
      to: toString,
    };

    switch (field) {
      case "issue": {
        event.action = "Issue created";
        break;
      }
      case "status": {
        event.action = "Status changed";
        break;
      }
      case "assignee": {
        if (!fromString && toString) {
          event.action = "Assignee set";
        } else if (fromString && !toString) {
          event.action = "Assignee removed";
        } else if (fromString && toString) {
          event.action = "Assignee updated";
        } else {
          event.action = "Assignee changed";
        }
        break;
      }
      case "summary": {
        event.action = "Summary updated";
        break;
      }
      case "description": {
        event.action = "Description updated";
        break;
      }
      case "resolution": {
        event.action = "Resolution set";
        break;
      }
      case "labels": {
        if (toString && !fromString) {
          event.action = "Label added";
        } else if (!toString && fromString) {
          event.action = "Label removed";
        } else {
          event.action = "Labels updated";
        }
        break;
      }
      case "Attachment": {
        event.action = "Attachment added";
        break;
      }
      case "Link": {
        event.action = "Link added";
        break;
      }
      case "Epic Link":
      case "Epic Child": {
        event.action = "Epic linked";
        break;
      }
    }

    return event;
  });
}

export async function getUserActivity(
  context: JiraClientContext,
  options: SmartSearchOptions &
    (
      | {
          username: string;
          usernames?: never;
        }
      | {
          username?: never;
          usernames: string[];
        }
    ),
) {
  const issues = await smartSearch(context, options);

  const users = options.usernames ?? [options.username];

  const changelog = getChangelogByIssues(issues).filter(
    ({ date, username }) =>
      (users ? users.includes(username) : true) &&
      (options.fromDate ? date >= options.fromDate : true) &&
      (options.toDate ? date <= options.toDate : true),
  );

  const sort = options.sort ?? "asc";
  if (sort === "asc") {
    changelog.sort((a, b) => a.date.getTime() - b.date.getTime());
  } else {
    changelog.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  const events = getEventsByChangelog(changelog);

  const uniqueIssues = new Set(events.map((event) => event.issue.key));
  const uniqueEpicLinks = new Set(events.map((event) => event.issue.epicLink));
  const uniqueEpicLinksAsArray = Array.from(uniqueEpicLinks).filter(
    Boolean,
  ) as string[];

  const epics = uniqueEpicLinksAsArray.length ? Object.fromEntries(
    (
      await smartSearch(context, {
        keys: uniqueEpicLinksAsArray,
      })
    ).map((issue) => [
      issue.key,
      {
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description,
      },
    ]),
  ) : {}

  const issuesWithEvents = Array.from(uniqueIssues).map((issueKey) => {
    const filteredEvents = events.filter(
      (event) => event.issue.key === issueKey,
    );
    return {
      issue: filteredEvents[0]!.issue,
      epic: epics[filteredEvents[0]!.issue.epicLink!] ?? null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      events: filteredEvents.map(({ issue: _, ...event }) => ({ ...event })),
    };
  });

  const issuesWithEventsAndEmptyEpic = issuesWithEvents
    .filter((issueWithEvents) => !issueWithEvents.epic)
    .map(({ issue, events }) => ({ issue, events }));

  const epicWithIssuesWithEvents = uniqueEpicLinksAsArray.map((epicLink) => ({
    epic: epics[epicLink] ?? null,
    issues: issuesWithEvents
      .filter((issueWithEvents) => issueWithEvents.epic?.key === epicLink)
      .map(({ issue, events }) => ({ issue, events })),
  }));

  return [...issuesWithEventsAndEmptyEpic, ...epicWithIssuesWithEvents];
}
