import { request } from "@analtools/zerocrat-source-utils";

import type { GitlabApiContext, GitlabJob } from "../types";
import { TempUniqueItems } from "../utils";

type StatusOptions =
  | { status?: GitlabJob["status"]; statuses?: never }
  | { status?: never; statuses?: GitlabJob["status"][] };

const perPage = 100;

async function fetchJobs(
  { gitlabToken, gitlabHost, debug }: GitlabApiContext,
  {
    projectId,
    pipelineId,
    page,
    perPage,
    status,
    statuses,
    sort,
  }: {
    projectId: number;
    pipelineId?: number;
    page: number;
    perPage: number;
    sort?: "asc" | "desc";
  } & StatusOptions,
): Promise<GitlabJob[]> {
  const items = await request<
    {
      id: number;
      name: string;
      status: GitlabJob["status"];
      stage: string;
      created_at: string;
      started_at: string | null;
      finished_at: string | null;
    }[]
  >({
    host: gitlabHost,
    endpoint: pipelineId
      ? `/api/v4/projects/${projectId}/pipelines/${pipelineId}/jobs`
      : `/api/v4/projects/${projectId}/jobs`,
    method: "get",
    searchParams: {
      page,
      per_page: perPage,
      scope: statuses ? statuses : [status],
      sort,
    },
    headers: {
      "PRIVATE-TOKEN": gitlabToken,
    },
    debug,
  });

  return items.map((item): GitlabJob => {
    const createdAt = new Date(item.created_at);
    const startedAt = item.started_at ? new Date(item.started_at) : null;
    const finishedAt = item.finished_at ? new Date(item.finished_at) : null;

    return {
      id: item.id,
      name: item.name,
      status: item.status,
      stage: item.stage,
      createdAt,
      startedAt,
      finishedAt,
      duration:
        finishedAt && startedAt
          ? (finishedAt.getTime() - startedAt.getTime()) / 1000
          : null,
    };
  });
}

type JobRange = {
  fromDate: Date;
  toDate: Date;
  middleDate: Date;
  deltaId: number;
};
async function getJobRange(
  cotext: GitlabApiContext,
  options: {
    projectId: number;
    pipelineId?: number;
  } & StatusOptions,
): Promise<JobRange | null> {
  const [firstJob] = await fetchJobs(cotext, {
    ...options,
    sort: "asc",
    page: 1,
    perPage: 1,
  });
  const [lastJob] = await fetchJobs(cotext, {
    ...options,
    sort: "desc",
    page: 1,
    perPage: 1,
  });

  if (firstJob?.createdAt && lastJob?.createdAt) {
    return {
      fromDate: firstJob.createdAt,
      toDate: lastJob.createdAt,
      middleDate: new Date(
        firstJob.createdAt.getTime() / 2 + lastJob.createdAt.getTime() / 2,
      ),
      deltaId: lastJob.id - firstJob.id,
    };
  } else {
    return null;
  }
}

function getPageByDate(jobRange: JobRange, date: Date): number {
  const k =
    (date.getTime() - jobRange.fromDate.getTime()) /
    (jobRange.toDate.getTime() - jobRange.fromDate.getTime());

  return (k * jobRange.deltaId) / 100;
}

void getJobRange;
void getPageByDate;

export async function getJobs(
  context: GitlabApiContext,
  options: {
    projectId: number;
    pipelineId?: number;
    stage?: string;
    name?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
  } & StatusOptions,
): Promise<GitlabJob[]> {
  let page = 1;

  const items = new TempUniqueItems<GitlabJob>();

  flow: while (true) {
    const batch = await fetchJobs(context, {
      ...options,
      page,
      perPage,
      sort: "asc",
    });

    for (const item of batch) {
      if (options.toDate && item.createdAt > options.toDate) {
        continue;
      }
      if (options.fromDate && item.createdAt < options.fromDate) {
        continue;
      }
      if (options.stage && item.stage !== options.stage) {
        continue;
      }
      if (options.name && item.name !== options.name) {
        continue;
      }
      items.add(item);

      if (options.limit && items.size() >= options.limit) {
        break flow;
      }
    }

    if (batch.length < perPage) {
      break;
    } else {
      page++;
    }
  }
  return items.read();
}
