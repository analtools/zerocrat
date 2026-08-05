export type JiraServerSettings = {
  host: string;
  token: string;
};

export type JiraClientContext = {
  servers: JiraServerSettings[];
  publicHost?: string;
  debug?: boolean;
};

export type JiraIssue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string;
    status: { name: string };
    assignee?: { name: string };
    issuelinks: Array<{
      type: { outward?: string; inward?: string };
      outwardIssue?: { id: string; key: string };
      inwardIssue?: { id: string; key: string };
    }>;
    issuetype: { name: string };
    duedate?: string | null;
    created: string;
    creator: { name: string };
    // TODO: refactor - custom fields
    plannedEnd?: string | null;
    epiclink?: string | null;
    changeType?: string | null;
    initiativeClassification?: string | null;
  };
  changelog: {
    startAt: number;
    maxResults: number;
    total: number;
    histories: HistoryItem[];
  };
};

export type HistoryItem = {
  id: string;
  author: JiraUser;
  created: string; // ISO 8601 date string
  items: HistoryChangeItem[];
};

export type JiraUser = {
  self: string;
  name: string;
  key: string;
  emailAddress: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  displayName: string;
  active: boolean;
  timeZone: string;
};

export type HistoryChangeItem = {
  field: string;
  fieldtype: string;
  from: string | null;
  fromString: string | null;
  to: string | null;
  toString: string | null;
};

export type SmartSearchOptions = {
  fields?: string[];
  expand?: string[];
} & { keys?: string[] } & (
    | {
        actor?: string;
        actors?: never;
      }
    | {
        actor?: never;
        actors?: string[];
      }
  ) &
  (
    | {
        project?: string;
        projects?: never;
      }
    | {
        project?: never;
        projects?: string[];
      }
  ) &
  (
    | {
        epicLink?: string;
        epicLinks?: never;
      }
    | {
        epicLink?: never;
        epicLinks?: string[];
      }
  ) &
  (
    | {
        issueType?: string;
        issueTypes?: never;
      }
    | {
        issueType?: never;
        issueTypes?: string[];
      }
  ) & {
    fromDate?: Date;
    toDate?: Date;
    sort?: "asc" | "desc";
  } & (
    | {
        team?: string;
        teams?: never;
      }
    | {
        team?: never;
        teams?: string[];
      }
  ) &
  (
    | {
        component?: string;
        components?: never;
      }
    | {
        component?: never;
        components?: string[];
      }
  ) &
  (
    | {
        label?: string;
        labels?: never;
      }
    | {
        label?: never;
        labels?: string[];
      }
  ) &
  (
    | {
        type?: string;
        types?: never;
      }
    | {
        type?: never;
        types?: string[];
      }
  ) &
  (
    | {
        status?: string;
        statuses?: never;
      }
    | {
        status?: never;
        statuses?: string[];
      }
  );

export type JiraEvent = {
  username: string;
  issue: JiraIssue;
  date: Date;
  action: string;
  from: string | null;
  to: string | null;
};

export type JiraChangelogItem = HistoryChangeItem & {
  username: string;
  issue: JiraIssue;
  date: Date;
};

export type JiraIssueHierarchyItem = {
  key: string;
  type: string;
  name: string;
  status: string;
  assignee: string | null;
  description: string;
  dueDate: string | null;
  plannedEnd: string | null;
  parent: string | null;
  allParents: string[];
  ancestors: string[];
  path: string;
  depth: number;
  epic: string | null;
  initiativeClassification: string | null;
  changeType: string | null;
};
