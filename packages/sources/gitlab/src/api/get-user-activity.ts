import { request } from "@analtools/zerocrat-source-utils";

import type {
  GitlabApiContext,
  GitlabProjectBaseInfo,
  GitLabUser,
  UserActivityEvent,
} from "../types";
import { TempUniqueItems } from "../utils";
import { getMergeRequest } from "./get-merge-request";
import { getMergeRequests } from "./get-merge-requests";
import { getProject } from "./get-project";
import { getUser } from "./get-user";

const jiraRegex = /\b[A-Z][A-Z0-9]+-\d+\b/g;

export async function getUserActivity(
  context: GitlabApiContext,
  options: (
    { username: string; userId?: never } | { username?: never; userId: number }
  ) & {
    fromDate?: Date;
    toDate?: Date;
    sort?: "asc" | "desc";
  },
): Promise<{
  user: GitLabUser | null;
  projects: GitlabProjectBaseInfo[];
  events: UserActivityEvent[];
  jiraKeys: string[];
}> {
  const user = await getUser(context, options);

  if (!user) {
    return { user, events: [], projects: [], jiraKeys: [] };
  }

  const { gitlabToken, gitlabHost, debug } = context;

  const { fromDate, toDate } = options;

  let events: UserActivityEvent[];

  const perPage = 20;
  let page = 1;

  const items = new TempUniqueItems<any>();

  while (true) {
    const batch = await request({
      host: gitlabHost,
      endpoint: `/api/v4/users/${user.id}/events`,
      method: "get",
      searchParams: {
        page,
        per_page: perPage,
        ...(fromDate ? { after: fromDate.toISOString() } : {}),
        ...(toDate ? { before: toDate.toISOString() } : {}),
      },
      headers: {
        "PRIVATE-TOKEN": gitlabToken,
      },
      debug,
    });

    const prevSize = items.size();
    for (const event of batch) {
      let action: string = event.action_name;
      const details: any = {};

      if (
        (event.action_name.startsWith("pushed") ||
          event.action_name === "deleted") &&
        event.push_data.ref_type === "branch"
      ) {
        action = `${event.push_data.action} branch`;
        details.ref = event.push_data.ref;
        details.commitTitle = event.push_data.commit_title;
        details.commitCount = event.push_data.commit_count;
        details.commitFrom = event.push_data.commit_from;
        details.commitTo = event.push_data.commit_to;
      } else if (
        (event.action_name === "opened" ||
          event.action_name === "accepted" ||
          event.action_name === "closed") &&
        event.target_type === "MergeRequest"
      ) {
        action = `${event.action_name} merge request`;
        details.mergeRequestId = event.target_iid;
        details.mergeRequestTitle = event.target_title;
        details.mergeRequestWebUrl = (
          await getMergeRequest(context, {
            projectId: event.project_id,
            mergeRequestId: details.mergeRequestId,
          })
        ).webUrl;
      } else if (
        event.action_name === "commented on" &&
        event.target_type === "DiffNote"
      ) {
        action = "commented on";
        if (event.noteable_iid) {
          details.mergeRequestId = event.noteable_iid;
        } else {
          const [mergeRequest] = await getMergeRequests(context, {
            projectId: event.project_id,
            search: event.target_title,
            sort: "asc",
          });
          if (mergeRequest) {
            details.mergeRequestId = mergeRequest.id;
          }
        }
        details.mergeRequestTitle = event.target_title;
        details.mergeRequestWebUrl = (
          await getMergeRequest(context, {
            projectId: event.project_id,
            mergeRequestId: details.mergeRequestId,
          })
        ).webUrl;
        details.noteId = event.note.id;
        details.noteBody = event.note.body;
        details.noteableIId = event.note.noteable_iid;
        details.path = event.note.position.new_path;

        if (event.note.position.line_range) {
          if (
            event.note.position.line_range.start.new_line ===
            event.note.position.line_range.end.new_line
          ) {
            details.line = `${event.note.position.line_range.start.new_line}`;
          } else {
            details.line = `${event.note.position.line_range.start.new_line}...${event.note.position.line_range.end.new_line}`;
          }
        }
        details.resolvedByUsername = event.note.resolved_by?.username;
        details.resolvedByUserId = event.note.resolved_by?.id;
      }
      details.projectId = event.project_id;
      items.add({
        id: event.id,
        action,
        date: new Date(event.created_at),
        details,
      });
    }
    const size = items.size();

    if (prevSize === size || batch.length < perPage) {
      events = items.read();
      break;
    } else {
      page++;
    }
  }

  const projectsAsMap: Map<number, GitlabProjectBaseInfo> = new Map();
  for (const event of events) {
    const projectId = event.details.projectId;
    if (!projectsAsMap.has(projectId)) {
      const project = await getProject(context, { projectId }).then(
        ({ description, nameWithNamespace, pathWithNamespace }) => ({
          id: projectId,
          description,
          nameWithNamespace,
          pathWithNamespace,
        }),
      );
      projectsAsMap.set(projectId, project);
    }
    const project = projectsAsMap.get(projectId)!;
    event.details.projectDescription = project.description;
    event.details.projectNameWithNamespace = project.nameWithNamespace;
    event.details.projectPathWithNamespace = project.pathWithNamespace;
  }
  const projects = Array.from(projectsAsMap.values());

  const jiraKeysAsSet: Set<string> = new Set();

  for (const event of events as any[]) {
    const jiraKey =
      event.details.mergeRequestTitle?.match?.(jiraRegex)?.[0] ??
      event.details.ref?.match?.(jiraRegex)?.[0] ??
      event.details.commitTitle?.match?.(jiraRegex)?.[0];

    event.details.jiraKey = jiraKey ?? null;

    if (jiraKey) {
      jiraKeysAsSet.add(jiraKey);
    }
  }

  const jiraKeys = Array.from(jiraKeysAsSet);

  const sort = options.sort ?? "asc";
  if (sort === "asc") {
    events.sort((a, b) => a.date.getTime() - b.date.getTime());
  } else {
    events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  return { user, events, projects, jiraKeys };
}
