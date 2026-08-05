import Bottleneck from "bottleneck";

import { UnprocessableError } from "./errors";
import { withRetry } from "./with-retry";

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000, // 1 request per second
});

const unprocessableEntityErrorCodes = [400, 404, 422];

export const limitedFetch = limiter.wrap(
  async (url: string, init: RequestInit) => {
    return withRetry(async () => {
      const res = await fetch(url, init);

      if (!res.ok) {
        const errorMessage = `${res.status}${res.statusText ? ` ${res.statusText}` : ""} ${await res.text()}`;
        if (unprocessableEntityErrorCodes.includes(res.status)) {
          throw new UnprocessableError(errorMessage);
        }
        throw new Error(errorMessage);
      }

      return res;
    });
  },
);
