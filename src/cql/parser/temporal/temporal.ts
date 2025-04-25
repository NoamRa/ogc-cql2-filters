// https://www.opengis.net/doc/is/cql2/1.0#scalar-data-types

interface TemporalFormat {
  readonly name: string; // for convenience
  readonly type: "date" | "timestamp";
  readonly pattern: string;
  /**
   * The regular expression validate string structure, not validity of the value.
   * ex. 4050-60-70 is valid value, but not valid date.
   */
  readonly regex: RegExp;
}

interface ValidatedTemporal extends TemporalFormat {
  readonly date: Date;
  readonly reason?: never;
}

type TemporalInvalidReason = "NOT_STRING" | "NOT_FORMATTED" | "NOT_VALID";

type ParseTemporalRet = ValidatedTemporal | { readonly reason: TemporalInvalidReason };

export function parseTemporal(temporalString: unknown): ParseTemporalRet {
  if (typeof temporalString !== "string") return { reason: "NOT_STRING" };

  const format = TEMPORAL_FORMATS.find(({ regex }) => regex.test(temporalString));
  if (!format) return { reason: "NOT_FORMATTED" };

  const date = new Date(temporalString);
  if (Number.isNaN(date.getDate())) return { reason: "NOT_VALID" };

  return { date, ...format };
}

const TEMPORAL_FORMATS: TemporalFormat[] = [
  {
    name: "Calendar Date",
    type: "date" as const,
    pattern: "YYYY-MM-DD",
    regex: /^\d{4}-\d{2}-\d{2}$/,
  },
  {
    name: "Basic Date-Time",
    type: "timestamp" as const,
    pattern: "YYYY-MM-DDTHH:MM:SS",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  },
  {
    name: "Date-Time with UTC",
    type: "timestamp" as const,
    pattern: "YYYY-MM-DDTHH:MM:SSZ",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
  },
  {
    name: "Date-Time with Milliseconds",
    type: "timestamp" as const,
    pattern: "YYYY-MM-DDTHH:MM:SS.sss",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/,
  },
  {
    name: "Date-Time with Milliseconds and UTC",
    type: "timestamp" as const,
    pattern: "YYYY-MM-DDTHH:MM:SS.sssZ",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
  },
  {
    name: "Date-Time with Timezone Offset",
    type: "timestamp" as const,
    pattern: "YYYY-MM-DDTHH:MM:SS±HH:MM",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
  },
  {
    name: "Date-Time with Milliseconds and Timezone Offset",
    type: "timestamp" as const,
    pattern: "YYYY-MM-DDTHH:MM:SS.sss±HH:MM",
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/,
  },
];
