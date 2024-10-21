interface DateFormat {
  name: string; // for convenience
  type: "DATE" | "TIMESTAMP";
  pattern: string;
  length: number; // derived from pattern
  /**
   * The regular expression validate string structure, not validity of the value.
   * 2000-60-70 is valid value, but not valid date. Validating date is beyond regexp.
   */
  regex: RegExp;
}

export const DATE_FORMATS: DateFormat[] = [
  {
    name: "Calendar Date",
    type: "DATE" as const,
    pattern: "YYYY-MM-DD",
    regex: /^\d{4}-\d{2}-\d{2}$/,
  },
]
  .map(addLength)
  .sort(sortByLengthDesc);

export const TIMESTAMP_FORMATS: DateFormat[] = [
  {
    name: "Basic Date-Time",
    type: "TIMESTAMP" as const,
    pattern: "YYYY-MM-DDTHH:MM:SS",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  },
  {
    name: "Date-Time with UTC",
    type: "TIMESTAMP" as const,
    pattern: "YYYY-MM-DDTHH:MM:SSZ",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
  },
  {
    name: "Date-Time with Milliseconds",
    type: "TIMESTAMP" as const,
    pattern: "YYYY-MM-DDTHH:MM:SS.sss",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/,
  },
  {
    name: "Date-Time with Milliseconds and UTC",
    type: "TIMESTAMP" as const,
    pattern: "YYYY-MM-DDTHH:MM:SS.sssZ",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
  },
  {
    name: "Date-Time with Timezone Offset",
    type: "TIMESTAMP" as const,
    pattern: "YYYY-MM-DDTHH:MM:SS±HH:MM",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
  },
  {
    name: "Date-Time with Milliseconds and Timezone Offset",
    type: "TIMESTAMP" as const,
    pattern: "YYYY-MM-DDTHH:MM:SS.sss±HH:MM",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/,
  },
]
  .map(addLength)
  .sort(sortByLengthDesc);

function addLength(format: Omit<DateFormat, "length">): DateFormat {
  return { ...format, length: format.pattern.length };
}

function sortByLengthDesc(a: DateFormat, b: DateFormat) {
  return b.length - a.length;
}
