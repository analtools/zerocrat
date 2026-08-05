import type {
  JiraClient,
  JiraServerSettings,
} from "@analtools/zerocrat-source-jira";

export type GitlabApiContext = {
  gitlabHost: string;
  gitlabToken: string;
  debug?: boolean;
} & { jiraServers?: JiraServerSettings[]; publicJiraHost?: string };

export type GitlabApiContextState = {
  jiraClient?: JiraClient;
};

export type RepositoryMergeRequestEvent =
  | {
      type:
        | "ReadyForReview" /* MR готов к ревью (не Draft) */
        | "MarkedAsDraft" /* MR помечен как Draft (не готов к ревью) */
        | "ReadyToMerge" /* MR собрал нужное количество Approve, готов к Merge */
        | "Approved" /* MR получил одобрение одного из разработчиков */
        | "Unapproved" /* MR потерял одобрение одного из разработчиков */
        | "Merged" /* MR влит в ветку (конец ревью) */
        | "Closed"; /* MR закрыт (конец ревью) */
      timestamp: Date;
      payload: {
        repositoryId: number;
        mergeRequestId: number;
        author: User;
      };
    }
  | {
      type: "Created"; /* Merge Request создан */
      timestamp: Date;
      payload: {
        repositoryId: number;
        mergeRequestId: number;
        author: User;
        webUrl: string;
      };
    }
  | {
      type: "Commented"; /* MR прокоментирован одним из разработчиков */
      timestamp: Date;
      payload: {
        repositoryId: number;
        mergeRequestId: number;
        author: User;
        noteId: number;
      };
    }
  | {
      type: "Now";
      timestamp: Date;
      payload?: undefined;
    };

export const Period = {
  TwoYears: "2 years",
  Year: "year",
  ThreeQuarter: "3 quarters",
  TwoQuarter: "2 quarters",
  Quarter: "quarter",
  TwoMonths: "2 month",
  Month: "month",
  TwoWeeks: "2 weeks",
  Week: "week",
} as const;
export type Period = (typeof Period)[keyof typeof Period];

export const Granularity = {
  Year: "year",
  TwoQuarters: "2 quarters",
  Quarter: "quarter",
  TwoMonths: "2 months",
  Month: "month",
  TwoWeeks: "2 weeks",
  Week: "week",
  Day: "day",
} as const;
export type Granularity = (typeof Granularity)[keyof typeof Granularity];

export const GranularityByPeriod = {
  [Period.TwoYears]: {
    [Granularity.Year]: true,
    [Granularity.TwoQuarters]: true,
    [Granularity.Quarter]: true,
    [Granularity.TwoMonths]: true,
    [Granularity.Month]: true,
    [Granularity.TwoWeeks]: true,
    [Granularity.Week]: true,
    [Granularity.Day]: true,
  },
  [Period.Year]: {
    [Granularity.Year]: false,
    [Granularity.TwoQuarters]: true,
    [Granularity.Quarter]: true,
    [Granularity.TwoMonths]: true,
    [Granularity.Month]: true,
    [Granularity.TwoWeeks]: true,
    [Granularity.Week]: true,
    [Granularity.Day]: true,
  },
  [Period.ThreeQuarter]: {
    [Granularity.Year]: false,
    [Granularity.TwoQuarters]: false,
    [Granularity.Quarter]: true,
    [Granularity.TwoMonths]: true,
    [Granularity.Month]: true,
    [Granularity.TwoWeeks]: true,
    [Granularity.Week]: true,
    [Granularity.Day]: true,
  },
  [Period.TwoQuarter]: {
    [Granularity.Year]: false,
    [Granularity.TwoQuarters]: false,
    [Granularity.Quarter]: true,
    [Granularity.TwoMonths]: true,
    [Granularity.Month]: true,
    [Granularity.TwoWeeks]: true,
    [Granularity.Week]: true,
    [Granularity.Day]: true,
  },
  [Period.Quarter]: {
    [Granularity.Year]: false,
    [Granularity.TwoQuarters]: false,
    [Granularity.Quarter]: false,
    [Granularity.TwoMonths]: false,
    [Granularity.Month]: true,
    [Granularity.TwoWeeks]: true,
    [Granularity.Week]: true,
    [Granularity.Day]: true,
  },
  [Period.TwoMonths]: {
    [Granularity.Year]: false,
    [Granularity.TwoQuarters]: false,
    [Granularity.Quarter]: false,
    [Granularity.TwoMonths]: false,
    [Granularity.Month]: true,
    [Granularity.TwoWeeks]: true,
    [Granularity.Week]: true,
    [Granularity.Day]: true,
  },
  [Period.Month]: {
    [Granularity.Year]: false,
    [Granularity.TwoQuarters]: false,
    [Granularity.Quarter]: false,
    [Granularity.TwoMonths]: false,
    [Granularity.Month]: false,
    [Granularity.TwoWeeks]: true,
    [Granularity.Week]: true,
    [Granularity.Day]: true,
  },
  [Period.TwoWeeks]: {
    [Granularity.Year]: false,
    [Granularity.TwoQuarters]: false,
    [Granularity.Quarter]: false,
    [Granularity.TwoMonths]: false,
    [Granularity.Month]: false,
    [Granularity.TwoWeeks]: false,
    [Granularity.Week]: true,
    [Granularity.Day]: true,
  },
  [Period.Week]: {
    [Granularity.Year]: false,
    [Granularity.TwoQuarters]: false,
    [Granularity.Quarter]: false,
    [Granularity.TwoMonths]: false,
    [Granularity.Month]: false,
    [Granularity.TwoWeeks]: false,
    [Granularity.Week]: false,
    [Granularity.Day]: true,
  },
} as const satisfies Record<Period, Record<Granularity, boolean>>;
export type GranularityByPeriod =
  (typeof GranularityByPeriod)[keyof typeof GranularityByPeriod];

export const MergeRequestState = {
  Locked: "locked",
  Opened: "opened",
  Closed: "closed",
  Merged: "merged",
} as const;
export type MergeRequestState =
  (typeof MergeRequestState)[keyof typeof MergeRequestState];

export const ImportantMergeRequestNoteBody = {
  Approved: "approved this merge request",
  ReadyForReview: "marked this merge request as **ready**",
  Unapproved: "unapproved this merge request",
  MarkedAsDraft: "marked this merge request as **draft**",
} as const;
export type ImportantMergeRequestNoteBody =
  (typeof ImportantMergeRequestNoteBody)[keyof typeof ImportantMergeRequestNoteBody];

export type User = { id: number; name: string };

export type MergeRequest = {
  id: number;
  title: string;
  state: MergeRequestState;
  createdAt: Date;
  updatedAt: Date;
  mergedAt: Date | null;
  closedAt: Date | null;
  userNotesCount: number;
  mergeStatus:
    | "unchecked"
    | "checking"
    | "can_be_merged"
    | "cannot_be_merged"
    | "cannot_be_merged_recheck";
  detailedMergeStatus:
    | "blocked_status"
    | "broken_status"
    | "checking"
    | "unchecked"
    | "ci_must_pass"
    | "ci_still_running"
    | "discussions_not_resolved"
    | "draft_status"
    | "external_status_checks"
    | "mergeable"
    | "not_approved"
    | "not_open"
    | "policies_denied"
    | "jira_association_missing";
  hasConflicts: boolean;
  mergedBy: User | null;
  blockingDiscussionsResolved: boolean;
  draft: boolean;
  author: User;
  webUrl: string;
};

export type Namespace = {
  id: number;
  name: string;
  path: string;
  kind: string;
  avatarUrl: string | null;
  webUrl: string;
};

export type MergeRequestNotes = {
  type: "DiffNote" | null;
  body: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: Date;
  id: number;
};

export type GitLabProjectFull = {
  id: number;
  description: string | null;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  created_at: string;
  default_branch: string;
  web_url: string;
  last_activity_at: string;
  archived: boolean;
  visibility: string;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
    parent_id: number | null;
    avatar_url: string | null;
    web_url: string;
  };
  // Остальные поля можно добавить при необходимости
  [key: string]: any;
};

export type GitLabProjectBasicInfo = {
  id: number;
  name: string;
  description: string | null;
  pathWithNamespace: string;
  webUrl: string;
  defaultBranch: string;
  createdAt: Date;
  lastActivityAt: Date;
  visibility: string;
  archived: boolean;
  namespace: {
    name: string;
    path: string;
    webUrl: string;
  };
};

export type GitLabUser = {
  id: number;
  username: string;
  name: string;
  state: "active" | "blocked";
  avatarUrl: string;
  webUrl: string;
};

export type GitlabProject = {
  id: number;
  description: string;
  name: string;
  path: string;
  nameWithNamespace: string;
  pathWithNamespace: string;
  webUrl: string;
  defaultBranch: string;
  lastActivityAt: Date | null;
};

export type GitlabProjectBaseInfo = Pick<
  GitlabProject,
  "id" | "description" | "nameWithNamespace" | "pathWithNamespace"
>;

export type UserActivityEvent = (
  | ((
      | {
          action: "created branch";
        }
      | {
          action: "pushed branch";
        }
      | {
          action: "removed branch";
        }
    ) & {
      details: {
        ref: string;
        commitTitle: string | null;
        commitCount: number;
        commitFrom: string | null;
        commitTo: string | null;
      };
    })
  | ((
      | {
          action: "opened merge request";
        }
      | {
          action: "accepted merge request";
        }
      | {
          action: "closed merge request";
        }
    ) & { details: { mergeRequestId: number; mergeRequestTitle: string } })
  | {
      action: "commented on";
      details: {
        mergeRequestId: number;
        mergeRequestTitle: string;
        noteId: number;
        noteBody: string;
        noteableId: number;
        noteableIId: number;
        path: string | null;
        line?: string;
        resolvedByUsername?: string;
        resolvedByUserId?: number;
      };
    }
) & {
  id: number;
  date: Date;
  details: {
    projectId: number;
    projectDescription: string;
    projectNameWithNamespace: string;
    projectPathWithNamespace: string;
    jiraKey: string | null;
  };
};

export type GitlabJob = {
  id: number;
  name: string;
  status:
    | "created"
    | "pending"
    | "running"
    | "failed"
    | "success"
    | "canceled"
    | "skipped"
    | "manual";
  stage: string;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  duration: number | null;
};
