import { fromZonedTime, toZonedTime } from "date-fns-tz";

const TIME_ZONE =
  (typeof process !== "undefined" && process.env?.TZ) ||
  Intl.DateTimeFormat().resolvedOptions().timeZone ||
  "UTC";

const CURRENT_DAY = {
  "current day": true,
  today: true,
  сегодня: true,
} as const;

const CURRENT_WEEK = {
  "current week": true,
  "с начала текущей недели": true,
  "на этой неделе": true,
} as const;

const CURRENT_MONTH = {
  "current month": true,
  "с начала текущего месяца": true,
  "в этом месяце": true,
} as const;

const CURRENT_QUARTER = {
  "current quarter": true,
  "с начала текущего квартала": true,
  "в этом квартале": true,
} as const;

const CURRENT_YEAR = {
  "current year": true,
  "с начала текущего года": true,
  "в этом году": true,
} as const;

const PREV_DAY = {
  "prev day": true,
  "previous day": true,
  yesterday: true,
  вчера: true,
} as const;

const PREV_WEEK = {
  "prev week": true,
  "previous week": true,
  "с начала прошлой недели": true,
  "на прошлой неделе": true,
} as const;

const PREV_MONTH = {
  "prev month": true,
  "previous month": true,
  "с начала прошлого месяца": true,
  "в прошлом месяце": true,
} as const;

const PREV_QUARTER = {
  "prev quarter": true,
  "previous quarter": true,
  "с начала прошлого квартала": true,
  "в прошлом квартале": true,
} as const;

const PREV_YEAR = {
  "prev year": true,
  "previous year": true,
  "с начала прошлого года": true,
  "в прошлом году": true,
} as const;

const LAST_MONDAY = {
  "last monday": true,
  "последний понедельник": true,
} as const;
type LAST_MONDAY = keyof typeof LAST_MONDAY;

const LAST_TUESDAY = {
  "last tuesday": true,
  "последний вторник": true,
} as const;
type LAST_TUESDAY = keyof typeof LAST_TUESDAY;

const LAST_WEDNESDAY = {
  "last wednesday": true,
  "последняя среда": true,
} as const;
type LAST_WEDNESDAY = keyof typeof LAST_WEDNESDAY;

const LAST_THURSDAY = {
  "last thursday": true,
  "последняя четверг": true,
} as const;
type LAST_THURSDAY = keyof typeof LAST_THURSDAY;

const LAST_FRIDAY = { "last friday": true, "последняя пятница": true } as const;
type LAST_FRIDAY = keyof typeof LAST_FRIDAY;

const LAST_SATURDAY = {
  "last saturday": true,
  "последняя суббота": true,
} as const;
type LAST_SATURDAY = keyof typeof LAST_SATURDAY;

const LAST_SUNDAY = {
  "last sunday": true,
  "последнее воскресенье": true,
} as const;
type LAST_SUNDAY = keyof typeof LAST_SUNDAY;

type Period =
  | keyof typeof CURRENT_DAY
  | keyof typeof CURRENT_WEEK
  | keyof typeof CURRENT_MONTH
  | keyof typeof CURRENT_QUARTER
  | keyof typeof CURRENT_YEAR
  | keyof typeof PREV_DAY
  | keyof typeof PREV_WEEK
  | keyof typeof PREV_MONTH
  | keyof typeof PREV_QUARTER
  | keyof typeof PREV_YEAR
  | keyof typeof LAST_MONDAY
  | keyof typeof LAST_TUESDAY
  | keyof typeof LAST_WEDNESDAY
  | keyof typeof LAST_THURSDAY
  | keyof typeof LAST_FRIDAY
  | keyof typeof LAST_SATURDAY
  | keyof typeof LAST_SUNDAY;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getLastWeekday(current: Date, targetDay: number) {
  const currentDay = current.getDay() || 7;

  const daysToSubtract =
    currentDay === targetDay ? 7 : (currentDay - targetDay + 7) % 7 || 7;

  const d = new Date(current);
  d.setDate(d.getDate() - daysToSubtract);
  return startOfDay(d);
}

export function prettyDate(period: Period): Date {
  const nowUtc = new Date();
  const now = toZonedTime(nowUtc, TIME_ZONE);

  let result = new Date(now);

  switch (true) {
    case period in CURRENT_DAY: {
      result = startOfDay(now);
      break;
    }

    case period in PREV_DAY: {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      result = startOfDay(d);
      break;
    }

    case period in CURRENT_WEEK: {
      const d = new Date(now);
      const day = d.getDay() || 7; // Mon = 1
      d.setDate(d.getDate() - (day - 1));
      result = startOfDay(d);
      break;
    }

    case period in PREV_WEEK: {
      const d = new Date(now);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - (day - 1) - 7);
      result = startOfDay(d);
      break;
    }

    case period in CURRENT_MONTH: {
      const d = new Date(now);
      d.setDate(1);
      result = startOfDay(d);
      break;
    }

    case period in PREV_MONTH: {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      d.setDate(1);
      result = startOfDay(d);
      break;
    }

    case period in CURRENT_QUARTER: {
      const d = new Date(now);
      const q = Math.floor(d.getMonth() / 3) * 3;
      d.setMonth(q);
      d.setDate(1);
      result = startOfDay(d);
      break;
    }

    case period in PREV_QUARTER: {
      const d = new Date(now);
      const q = Math.floor(d.getMonth() / 3) * 3 - 3;
      d.setMonth(q);
      d.setDate(1);
      result = startOfDay(d);
      break;
    }

    case period in CURRENT_YEAR: {
      const d = new Date(now);
      d.setMonth(0);
      d.setDate(1);
      result = startOfDay(d);
      break;
    }

    case period in PREV_YEAR: {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      d.setMonth(0);
      d.setDate(1);
      result = startOfDay(d);
      break;
    }

    case period in LAST_MONDAY: {
      result = getLastWeekday(result, 1);
      break;
    }

    case period in LAST_TUESDAY: {
      result = getLastWeekday(result, 2);
      break;
    }

    case period in LAST_WEDNESDAY: {
      result = getLastWeekday(result, 3);
      break;
    }

    case period in LAST_THURSDAY: {
      result = getLastWeekday(result, 4);
      break;
    }

    case period in LAST_FRIDAY: {
      result = getLastWeekday(result, 5);
      break;
    }

    case period in LAST_SATURDAY: {
      result = getLastWeekday(result, 6);
      break;
    }

    case period in LAST_SUNDAY: {
      result = getLastWeekday(result, 7);
      break;
    }

    default:
      throw new Error(`Unknown period: ${period}`);
  }

  // обратно в UTC
  return fromZonedTime(result, TIME_ZONE);
}
