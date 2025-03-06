import { OperatorTokenType } from "./TokenType";

/**
 * How many parameters does an operator accept.
 * Note: enum is used and order is important. 1: Unary, 2: Binary, etc. This is an exception to the rule of avoiding TS enums.
 */
// eslint-disable-next-line no-restricted-syntax
export enum Arity {
  Variadic,
  Unary,
  Binary,
  Ternary,
}

// #region formatters
type TextFormatter = (op: string, ...args: string[]) => string;
const infixFunctionFormatter: TextFormatter = (op, ...args) => args.join(` ${op} `);
const functionFormatter: TextFormatter = (op, ...args) => `${op}(${args.join(", ")})`;
// #endregion

export interface OperatorMeta {
  /** How operator appears in CQL2 Text */
  text: string;
  /** How operator appears in CQL2 JSON */
  json: string;

  /** Human readable string */
  label: string;

  /** Number of operands the operator takes */
  arity: Arity;

  /** For CQL2 Text */
  textFormatter: TextFormatter;

  // outputType: InputOutputType;
  // inputTypes: InputOutputType[];
  // minArgs: number;
  // maxArgs: number;
}

// const allInputTypes: InputOutputType[] = ["null", "boolean", "number", "string", "date", "timestamp"] as const;

const operatorMetadataObj: Record<OperatorTokenType, OperatorMeta> = {
  // #region logical operators
  AND: {
    text: "AND",
    json: "and",
    label: "and",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "boolean",
    // inputTypes: ["boolean"],
    // minArgs: 2,
    // maxArgs: Infinity,
  },
  OR: {
    text: "OR",
    json: "or",
    label: "or",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "boolean",
    // inputTypes: ["boolean"],
    // minArgs: 2,
    // maxArgs: Infinity,
  },
  NOT: {
    text: "NOT",
    json: "not",
    label: "not",
    arity: Arity.Unary,
    textFormatter: (op, arg) => `${op} ${arg}`,
    // outputType: "boolean",
    // inputTypes: ["boolean"],
    // minArgs: 1,
    // maxArgs: 1,
  },
  // #endregion

  // #region comparison operators
  EQUAL: {
    text: "=",
    json: "=",
    label: "equal",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "boolean",
    // inputTypes: allInputTypes,
    // minArgs: 2,
    // maxArgs: 2,
  },
  NOT_EQUAL: {
    text: "<>",
    json: "<>",
    label: "not equal to",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "boolean",
    // inputTypes: allInputTypes,
  },
  // isNull: {
  //   text: "isNul",
  //   json: "",
  //   label: "is null",
  //   arity: Arity.Unary,
  //   notation: "postfix",
  //   // outputType: "boolean",
  //   // inputTypes: allInputTypes,
  //   // maxArgs: 1,
  // },
  LESS: {
    text: "<",
    json: "<",
    label: "less than",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  LESS_EQUAL: {
    text: "<=",
    json: "<=",
    label: "less than or equal to",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  GREATER: {
    text: ">",
    json: ">",
    label: "greater than",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  GREATER_EQUAL: {
    text: ">=",
    json: ">=",
    label: "greater than or equal to",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  // #endregion

  // #region arithmetic operators
  // https://www.opengis.net/spec/cql2/1.0/req/arithmetic
  PLUS: {
    text: "+",
    json: "+",
    label: "addition",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "number",
    // inputTypes: ["number"],
  },
  MINUS: {
    text: "-",
    json: "-",
    label: "subtraction",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "number",
    // inputTypes: ["number"],
  },
  STAR: {
    text: "*",
    json: "*",
    label: "multiplication",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "number",
    // inputTypes: ["number"],
  },
  SLASH: {
    text: "/",
    json: "/",
    label: "division",
    arity: Arity.Binary,
    textFormatter: infixFunctionFormatter,
    // outputType: "number",
    // inputTypes: ["number"],
  },
  // "%": {
  //   text: "%",
  //   json: "%",
  //   label: "modulo",
  //   arity: Arity.Binary,
  //   notation: "infix",
  //   // outputType: "number",
  //   // inputTypes: ["number"],
  // },
  // div: {
  //   text: "DIV",
  //   json: "div",
  //   label: "integer division",
  //   arity: Arity.Binary,
  //   notation: "infix",
  //   // outputType: "number",
  //   // inputTypes: ["number"],
  // },
  // "^": {
  //   text: "^",
  //   json: "^",
  //   label: "exponention",
  //   arity: Arity.Binary,
  //   notation: "infix",
  //   // outputType: "number",
  //   // inputTypes: ["number"],
  // },
  // #endregion

  // #region advanced comparison operators
  // https://docs.ogc.org/DRAFTS/21-065.html#advanced-comparison-operators
  LIKE: {
    text: "LIKE",
    json: "like",
    label: "like",
    arity: Arity.Binary,
    textFormatter: (op, negate, value, pattern) => {
      return `${value} ${negate === "true" ? "NOT " : ""}${op} ${pattern}`;
    },
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  BETWEEN: {
    text: "BETWEEN",
    json: "between",
    label: "between",
    arity: Arity.Ternary,
    textFormatter: (op, negate, value, start, end) => {
      return `${value} ${negate === "true" ? "NOT " : ""}${op} ${start} AND ${end}`;
    },
    // outputType: "boolean",
    // inputTypes: ["number"],
    // minArgs: 3,
    // maxArgs: 3,
  },
  IN: {
    text: "IN",
    json: "in",
    label: "in",
    arity: Arity.Binary,
    textFormatter: (op, negate, value, values) => {
      return `${value} ${negate === "true" ? "NOT " : ""}${op} ${values}`;
    },
    // outputType: "boolean",
    // inputTypes: ["number"], // TODO
  },
  // #endregion

  // #region insensitive comparison operators
  // https://www.opengis.net/spec/cql2/1.0/req/case-insensitive-comparison
  // https://www.opengis.net/spec/cql2/1.0/req/accent-insensitive-comparison
  CASEI: {
    text: "CASEI",
    json: "casei",
    label: "Case-insensitive Comparison",
    arity: Arity.Unary,
    textFormatter: functionFormatter,
    // outputType: "string",
    // inputTypes: ["string"],
    // minArgs: 1,
    // maxArgs: 1,
  },
  ACCENTI: {
    text: "ACCENTI",
    json: "accenti",
    label: "Accent-insensitive Comparison",
    arity: Arity.Unary,
    textFormatter: functionFormatter,
    // outputType: "string",
    // inputTypes: ["string"],
    // minArgs: 1,
    // maxArgs: 1,
  },
  // #endregion

  // #region Spatial Functions
  // https://www.opengis.net/spec/cql2/1.0/req/basic-spatial-functions
  S_INTERSECTS: {
    text: "S_INTERSECTS",
    json: "s_intersects",
    label: "Intersects",
    arity: Arity.Binary,
    textFormatter: functionFormatter,
    // outputType: "boolean",
    // inputTypes: ["spatial"],
    // minArgs: 2,
    // maxArgs: 2,
  },
  // #endregion
};

export const operatorMetadata: ReadonlyMap<OperatorTokenType, OperatorMeta> = new Map(
  Object.entries(operatorMetadataObj) as [OperatorTokenType, OperatorMeta][],
);
