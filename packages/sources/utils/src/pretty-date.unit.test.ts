import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatDate } from "./format-date";
import { prettyDate } from "./pretty-date";
/*
  2026.04
   M   | T    | W    | T    | F    | S    | S
  ----------------------------------------------
   20  |  21  |  22  |  23  |  24  |  25  | 26
   27  |  28  |  29  |  30  |  31  |  1   | 2
*/

describe(`prettyDate - 2026-04-29T12:00:00Z`, () => {
  const MOCK_DATE = "2026-04-29T12:00:00Z";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the start of the current day", () => {
    const result = prettyDate("today");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-29T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
       20  |  21  |  22  |  23  |  24  |  25  | 26
       27  |  28  |([29])|  30  |  31  |  1   | 2
    */
  });

  it("should return the start of the previous day", () => {
    const result = prettyDate("prev day");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-28T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
       20  |  21  |  22  |  23  |  24  |  25  | 26
       27  | (28) | [29] |  30  |  31  |  1   | 2
    */
  });

  it("should return the start of the current week (Monday)", () => {
    const result = prettyDate("current week");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-27T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
       20  |  21  |  22  |  23  |  24  |  25  | 26
      (27) | 28   | [29] |  30  |  31  |  1   | 2
    */
  });

  it("should return the start of the previous week", () => {
    // Previous week starts on 20.04.2026
    const result = prettyDate("prev week");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-20T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
      (20)  |  21  |  22  |  23  |  24  |  25  | 26
       27   | 28   | [29] |  30  |  31  |  1   | 2
    */
  });

  it("should return the start of the current month", () => {
    const result = prettyDate("current month");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-01T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
      (01) |  02  |  03  |  04  |  05  |  06  | 07
       08  |  09  |  10  |  11  |  12  |  13  | 14
       15  |  16  |  17  |  18  |  19  |  20  | 21
       22  |  23  |  24  |  25  |  26  |  27  | 28
      [29] |  30  |  01  |  02  |  03  |  04  | 05
    */
  });

  it("should return the start of the previous month", () => {
    const result = prettyDate("prev month");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-03-01T12:00:00Z")),
    );
    /*
      2026.03                           2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
      (01) |  02  |  03  |  04  |  05  |  06  | 07
       08  |  09  |  10  |  11  |  12  |  13  | 14
       15  |  16  |  17  |  18  |  19  |  20  | 21
       22  |  23  |  24  |  25  |  26  |  27  | 28
      [29] |  30  |  31  |  01  |  02  |  03  | 04
    */
  });

  it("should return the start of the current quarter", () => {
    // April is Q2 (April, May, June). Start is April 1.
    const result = prettyDate("current quarter");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-01T12:00:00Z")),
    );
    /*
      2026.Q2 (April, May, June)
      
      2026.04 (start of quarter)
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
      (01) |  02  |  03  |  04  |  05  |  06  | 07
      08   |  09  |  10  |  11  |  12  |  13  | 14
      ...  |  ... |  ... |  ... |  ... |  ... | ...
                              [29]
    */
  });

  it("should return the start of the previous quarter", () => {
    // Previous quarter (Jan, Feb, Mar). Start is January 1.
    const result = prettyDate("prev quarter");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-01-01T12:00:00Z")),
    );
    /*
      2026.Q1 (Jan, Feb, Mar)
      
      2026.01 (start of quarter)
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
                  |  01  |  02  |  03  |  04  | 05
      06   |  07  |  08  |  09  |  10  |  11  | 12
      ...  |  ... |  ... |  ... |  ... |  ... | ...
      
                              [29] (current date in April)
    */
  });

  it("should return the start of the current year", () => {
    const result = prettyDate("current year");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-01-01T12:00:00Z")),
    );
    /*
      2026.01 (start of year)
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
                  |  01  |  02  |  03  |  04  | 05
      06   |  07  |  08  |  09  |  10  |  11  | 12
      ...  |  ... |  ... |  ... |  ... |  ... | ...
      
                              [29] (current date in April)
    */
  });

  it("should return the start of the previous year", () => {
    const result = prettyDate("previous year");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2025-01-01T12:00:00Z")),
    );
    /*
      2025.01 (start of previous year)
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
                  |  01  |  02  |  03  |  04  | 05
      06   |  07  |  08  |  09  |  10  |  11  | 12
      ...  |  ... |  ... |  ... |  ... |  ... | ...
      
                              [29] (current date in April 2026)
    */
  });

  it("should return the date of the last Monday", () => {
    // 29.04.2026 is Wednesday. Last Monday was 27.04.2026
    const result = prettyDate("last monday");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-27T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
       20  |  21  |  22  |  23  |  24  |  25  | 26
      (27) |  28  | [29] |  30  |  31  |  1   | 2
    */
  });

  it("should return the date of the last Tuesday", () => {
    // 29.04.2026 is Wednesday. Last Tuesday was 28.04.2026
    const result = prettyDate("last tuesday");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-28T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
       20  |  21  |  22  |  23  |  24  |  25  | 26
       27  | (28) | [29] |  30  |  31  |  1   | 2
    */
  });

  it("should throw an error for an unknown period", () => {
    expect(() => prettyDate("unknown period" as any)).toThrow(
      "Unknown period: unknown period",
    );
  });
});

describe(`prettyDate - 2026-04-27T12:00:00Z`, () => {
  const MOCK_DATE = "2026-04-27T12:00:00Z";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the start of the current day", () => {
    const result = prettyDate("today");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-27T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
       20  |  21  |  22  |  23  |  24  |  25  | 26
      ([27])|  28  |  29  |  30  |  31  |  1   | 2
    */
  });

  it("should return the start of the previous day", () => {
    const result = prettyDate("prev day");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-26T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
       20  |  21  |  22  |  23  |  24  |  25  |(26)
      [27] |  28  |  29  |  30  |  31  |  1   | 2
    */
  });

  it("should return the start of the current week (Monday)", () => {
    const result = prettyDate("current week");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-27T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
       20  |  21  |  22  |  23  |  24  |  25  | 26
      ([27])|  28  |  29  |  30  |  31  |  1   | 2
    */
  });

  it("should return the start of the previous week", () => {
    const result = prettyDate("prev week");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-20T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
      (20) |  21  |  22  |  23  |  24  |  25  | 26
      [27] |  28  |  29  |  30  |  31  |  1   | 2
    */
  });

  it("should return the start of the current month", () => {
    const result = prettyDate("current month");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-01T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
      (01) |  02  |  03  |  04  |  05  |  06  | 07
       08  |  09  |  10  |  11  |  12  |  13  | 14
       15  |  16  |  17  |  18  |  19  |  20  | 21
       22  |  23  |  24  |  25  |  26  | [27] | 28
       29  |  30  |  01  |  02  |  03  |  04  | 05
    */
  });

  it("should return the start of the previous month", () => {
    const result = prettyDate("prev month");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-03-01T12:00:00Z")),
    );
    /*
      2026.03                           2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
      (01) |  02  |  03  |  04  |  05  |  06  | 07
       08  |  09  |  10  |  11  |  12  |  13  | 14
       15  |  16  |  17  |  18  |  19  |  20  | 21
       22  |  23  |  24  |  25  |  26  |  27  | 28
       29  |  30  |  31  |  01  |  02  |  03  |[04]
    */
  });

  it("should return the start of the current quarter", () => {
    const result = prettyDate("current quarter");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-01T12:00:00Z")),
    );
    /*
      2026.Q2 (April, May, June)

      2026.04 (start of quarter)
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
      (01) |  02  |  03  |  04  |  05  |  06  | 07
      08   |  09  |  10  |  11  |  12  |  13  | 14
      ...  |  ... |  ... |  ... |  ... |  ... | ...
                              [27]
    */
  });

  it("should return the start of the previous quarter", () => {
    const result = prettyDate("prev quarter");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-01-01T12:00:00Z")),
    );
    /*
      2026.Q1 (Jan, Feb, Mar)

      2026.01 (start of quarter)
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
                  |  01  |  02  |  03  |  04  | 05
      06   |  07  |  08  |  09  |  10  |  11  | 12
      ...  |  ... |  ... |  ... |  ... |  ... | ...

                              [27] (current date in April)
    */
  });

  it("should return the start of the current year", () => {
    const result = prettyDate("current year");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-01-01T12:00:00Z")),
    );
    /*
      2026.01 (start of year)
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
                  |  01  |  02  |  03  |  04  | 05
      06   |  07  |  08  |  09  |  10  |  11  | 12
      ...  |  ... |  ... |  ... |  ... |  ... | ...

                              [27] (current date in April)
    */
  });

  it("should return the start of the previous year", () => {
    const result = prettyDate("previous year");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2025-01-01T12:00:00Z")),
    );
    /*
      2025.01 (start of previous year)
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
                  |  01  |  02  |  03  |  04  | 05
      06   |  07  |  08  |  09  |  10  |  11  | 12
      ...  |  ... |  ... |  ... |  ... |  ... | ...

                              [27] (current date in April 2026)
    */
  });

  it("should return the date of the last Monday", () => {
    // 27.04.2026 is Monday. Last Monday was 20.04.2026
    const result = prettyDate("last monday");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-20T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
      (20) |  21  |  22  |  23  |  24  |  25  | 26
      [27] |  28  |  29  |  30  |  31  |  1   | 2
    */
  });

  it("should return the date of the last Tuesday", () => {
    // 27.04.2026 is Monday. Last Tuesday was 21.04.2026
    const result = prettyDate("last tuesday");
    expect(result).toMatchSnapshot();
    expect(formatDate(result)).toEqual(
      formatDate(new Date("2026-04-21T12:00:00Z")),
    );
    /*
      2026.04
      M    | T    | W    | T    | F    | S    | S
      ----------------------------------------------
       20  | (21) |  22  |  23  |  24  |  25  | 26
      [27] |  28  |  29  |  30  |  31  |  1   | 2
    */
  });

  it("should throw an error for an unknown period", () => {
    expect(() => prettyDate("unknown period" as any)).toThrow(
      "Unknown period: unknown period",
    );
  });
});
