import Bottleneck from "bottleneck";
import { fetch, type RequestInfo, type RequestInit } from "undici";

import { withRetry } from "./with-retry";

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000, // 1 request per second
});

export const limitedFetch = limiter.wrap(
  async (url: RequestInfo, init: RequestInit) => {
    return withRetry(async () => {
      const res = await fetch(url, init);

      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} ${await res.text()}`);
      }

      return res;
    });
  },
);
