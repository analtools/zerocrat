const CURRENT_DAY = {
  "current day": true,
  today: true,
  сегодня: true,
} as const;
type CURRENT_DAY = keyof typeof CURRENT_DAY;

const CURRENT_WEEK = {
  "current week": true,
  "с начала текущей недели": true,
  "на этой неделе": true,
} as const;
type CURRENT_WEEK = keyof typeof CURRENT_WEEK;

const CURRENT_MONTH = {
  "current month": true,
  "с начала текущего месяца": true,
  "в этом месяце": true,
} as const;
type CURRENT_MONTH = keyof typeof CURRENT_MONTH;

const CURRENT_QUARTER = {
  "current quarter": true,
  "с начала текущего квартала": true,
  "в этом квартале": true,
} as const;
type CURRENT_QUARTER = keyof typeof CURRENT_QUARTER;

const CURRENT_YEAR = {
  "current year": true,
  "с начала текущего года": true,
  "в этом году": true,
} as const;
type CURRENT_YEAR = keyof typeof CURRENT_YEAR;

const PREV_DAY = {
  "prev day": true,
  "previous day": true,
  yesterday: true,
  вчера: true,
} as const;
type PREV_DAY = keyof typeof PREV_DAY;

const PREV_WEEK = {
  "prev week": true,
  "previous week": true,
  "с начала прошлой недели": true,
  "на прошлой неделе": true,
} as const;
type PREV_WEEK = keyof typeof PREV_WEEK;

const PREV_MONTH = {
  "prev month": true,
  "previous month": true,
  "с начала прошлого месяца": true,
  "в прошлом месяце": true,
} as const;
type PREV_MONTH = keyof typeof PREV_MONTH;

const PREV_QUARTER = {
  "prev quarter": true,
  "previous quarter": true,
  "с начала прошлого квартала": true,
  "в прошлом квартале": true,
} as const;
type PREV_QUARTER = keyof typeof PREV_QUARTER;

const PREV_YEAR = {
  "prev year": true,
  "previous year": true,
  "с начала прошлого года": true,
  "в прошлом году": true,
} as const;
type PREV_YEAR = keyof typeof PREV_YEAR;

export function prettyDate(
  date:
    | CURRENT_DAY
    | CURRENT_WEEK
    | CURRENT_MONTH
    | CURRENT_QUARTER
    | CURRENT_YEAR
    | PREV_DAY
    | PREV_WEEK
    | PREV_MONTH
    | PREV_QUARTER
    | PREV_YEAR,
): Date {
  const now = new Date();
  const result = new Date(now);

  switch (true) {
    case date in CURRENT_DAY: {
      // Начало текущего дня
      result.setHours(0, 0, 0, 0);
      break;
    }

    case date in PREV_DAY: {
      // Начало предыдущего дня
      result.setDate(result.getDate() - 1);
      result.setHours(0, 0, 0, 0);
      break;
    }

    case date in CURRENT_WEEK: {
      // Начало текущей недели (понедельник)
      const currentDayOfWeek = result.getDay() || 7; // Вс=0 -> 7
      result.setDate(result.getDate() - (currentDayOfWeek - 1));
      result.setHours(0, 0, 0, 0);
      break;
    }

    case date in PREV_WEEK: {
      // Начало предыдущей недели
      const prevDayOfWeek = result.getDay() || 7;
      result.setDate(result.getDate() - (prevDayOfWeek - 1) - 7);
      result.setHours(0, 0, 0, 0);
      break;
    }

    case date in CURRENT_MONTH: {
      // Начало текущего месяца
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    }

    case date in PREV_MONTH: {
      // Начало предыдущего месяца
      result.setMonth(result.getMonth() - 1);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    }

    case date in CURRENT_QUARTER: {
      // Начало текущего квартала
      const currentMonth = result.getMonth();
      const currentQuarterStart = Math.floor(currentMonth / 3) * 3;
      result.setMonth(currentQuarterStart);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    }

    case date in PREV_QUARTER: {
      // Начало предыдущего квартала
      const prevMonth = result.getMonth();
      const prevQuarterStart = Math.floor(prevMonth / 3) * 3 - 3;
      result.setMonth(prevQuarterStart);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    }

    case date in CURRENT_YEAR: {
      // Начало текущего года
      result.setMonth(0);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    }

    case date in PREV_YEAR: {
      // Начало предыдущего года
      result.setFullYear(result.getFullYear() - 1);
      result.setMonth(0);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    }

    default: {
      throw new Error(`Unknown date period: ${date}`);
    }
  }

  return result;
}
