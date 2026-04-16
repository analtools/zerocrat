export type ConfluenceApiContext = {
  jiraHost?: string;
  confluenceHost: string;
  confluenceToken: string;
  debug?: boolean;
};

export type ConfluenceContent = {
  id: string;
  type: "page" | "comment" | "attachment";
  title: string;
  _links: {
    webui: string;
    self: string;
  };
};

export type ConfluenceSearchResultResultContainer = {
  title: string;
  displayUrl: string;
};

export type ConfluenceSearchResult = {
  content: ConfluenceContent;
  title: string;
  excerpt: string;
  url: string;
  resultParentContainer?: ConfluenceSearchResultResultContainer;
  resultGlobalContainer: ConfluenceSearchResultResultContainer;
  lastModified: string; // ISO 8601 datetime
};

export type ConfluenceSearchSimpleResult = {
  id: ConfluenceContent["id"];
  type: ConfluenceContent["type"];
  additionalUrl: ConfluenceContent["_links"]["webui"];
  excerpt: ConfluenceSearchResult["excerpt"] | null;
  url: ConfluenceSearchResult["url"];
  title: ConfluenceSearchResult["title"];
  parentContainerTitle: ConfluenceSearchResultResultContainer["title"] | null;
  parentContainerUrl:
    | ConfluenceSearchResultResultContainer["displayUrl"]
    | null;
  namespaceTitle: ConfluenceSearchResultResultContainer["title"];
  namespaceUrl: ConfluenceSearchResultResultContainer["displayUrl"];
  date: Date;
};

export type ConfluenceComment = {
  id: string;
  type: "comment";
  status: "current" | "deleted";
  body?: {
    storage?: {
      value: string; // HTML
      representation: "storage";
    };
  };
  history?: {
    createdBy?: {
      displayName: string;
      accountId: string;
    };
    createdDate: string;
  };
  extensions?: {
    inlineProperties?: { originalSelection?: string; markerRef?: string };
  };
  version?: {
    number: number;
    when: string;
  };
  container?: {
    id: string; // pageId или parent comment
  };
};

export type ConfluenceCommentSimpleTreeNode = {
  author: string;
  content: string;
  quote: string | null;
  replies: ConfluenceCommentSimpleTreeNode[];
};
