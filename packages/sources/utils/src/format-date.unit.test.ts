import { describe, expect, it } from "vitest";

import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("should format date as YYYY-MM-DD", () => {
    const date = new Date(2023, 9, 5); // October 5, 2023
    expect(formatDate(date)).toBe("2023-10-05");
  });

  it("should pad month and day with leading zeros", () => {
    const date = new Date(2023, 0, 1); // January 1, 2023
    expect(formatDate(date)).toBe("2023-01-01");
  });

  it("should handle end of year correctly", () => {
    const date = new Date(2023, 11, 31); // December 31, 2023
    expect(formatDate(date)).toBe("2023-12-31");
  });

  it("should handle leap year correctly", () => {
    const date = new Date(2024, 1, 29); // February 29, 2024
    expect(formatDate(date)).toBe("2024-02-29");
  });
});
