import { stringify } from "qs";
import { type BodyInit, FormData, Headers, type HeadersInit } from "undici";

import { limitedFetch } from "./limited-fetch";

const cache = new Map<string, any>();

export async function request<T = any>(options: {
  signal?: AbortSignal;
  method: "post" | "delete" | "put" | "patch" | "get";
  body?: FormData | Record<string, unknown>;
  endpoint: string;
  host: string;
  headers: Record<string, string | string[]>;
  searchParams: Record<string, unknown>;
  debug?: boolean;
}): Promise<T> {
  let url = `${options.host}${options.endpoint}`;
  if (options?.searchParams) {
    url += `?${stringify(options.searchParams, { arrayFormat: "brackets" })}`;
  }

  if (options.debug) {
    console.log(`[${options.method.toUpperCase()}] ${url}`);
  }

  const body: BodyInit | undefined =
    options?.body == null || options?.body instanceof FormData
      ? options?.body
      : JSON.stringify(options.body);
  if (options.debug && body) {
    console.log("BODY:", body);
  }

  const additionalHeaders: HeadersInit =
    body instanceof FormData
      ? {}
      : {
          "content-type": "application/json",
        };

  const headers = new Headers({
    ...options.headers,
    ...additionalHeaders,
  });
  if (options.debug) {
    console.log("HEADERS:", headers);
  }

  const cacheKey = JSON.stringify({
    url,
    method: options.method,
    headers,
    body,
  });

  let responseBody: string;
  let status: number;
  let statusText: string;

  if (cache.has(cacheKey)) {
    void ({ responseBody, status, statusText } = cache.get(cacheKey));
  } else {
    const response = await limitedFetch(url, {
      method: options.method,
      headers,
      body,
      signal: options?.signal,
    });

    responseBody = await response.text();
    status = response.status;
    statusText = response.statusText;
    cache.set(cacheKey, { responseBody, status, statusText });
  }

  if (options.debug) {
    console.log("STATUS:", status);
    console.log("STATUS TEXT:", statusText);
    console.log("RESPONSE:", responseBody);
  }

  try {
    return JSON.parse(responseBody);
  } catch (error: any) {
    if (options.debug) {
      console.log("ERROR:", error.message);
    }
    return responseBody as T;
  }
}
