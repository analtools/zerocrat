export type JiraClientContext = { jiraHost: string; jiraToken: string, jiraEpicLinkField?:string|null };

export type JiraIssue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string;
    epiclink?: string;
    issuelinks: Array<{
      type: { outward?: string };
      outwardIssue?: { id: string; key: string };
    }>;
    created: string;
    creator: { name: string}
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
        project?: string;
        projects?: never;
      }
    | {
        project?: never;
        projects?: string[];
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
    issue: {
      key: string;
      summary: string;
      description: string;
      epicLink: string | null;
      issueLinks: any[];
    };
    date: Date;
    action: string;
    from: string | null;
    to: string | null;
  };

export type JiraChangelogItem = HistoryChangeItem & {
  username: string
  issue: JiraIssue
  date: Date
}

