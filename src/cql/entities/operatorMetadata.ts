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

/**
 * Precedence is the priority for grouping different types of operators with their operands.
 * Note: enum is used and order is important. This is an exception to the rule of avoiding TS enums.
 */
// eslint-disable-next-line no-restricted-syntax
export enum Precedence {
  Or,
  And,
  Equality,
  Comparison,
  Term,
  Factor,
  Unary,
  Func,
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

  /**
   * Notion hints as to how operator appears in relation to operands. It's relevant only to Text encoding.
   * function - S_INTERSECTS(2, 3)
   * prefix - NOT 2
   * infix - 2 * 3
   * postfix - 3 IS NOT NULL
   * mixfix - value BETWEEN 2 AND 3
   */
  notation: "function" | "prefix" | "infix" | "mixfix";

  /**
   * Precedence is the priority for grouping different types of operators with their operands.
   * Higher values are evaluated first
   */
  precedence: Precedence;

  /**
   * Associativity is the left-to-right or right-to-left order for grouping operands to operators that have the same precedence.
   * An operator's precedence is meaningful only if other operators with higher or lower precedence are present.
   */
  associativity: "left" | "right";

  /** For CQL2 Text. Implementation of notion */
  textFormatter: TextFormatter;
}

// const allInputTypes: InputOutputType[] = ["null", "boolean", "number", "string", "date", "timestamp"] as const;

const operatorMetadataObj: Record<OperatorTokenType, OperatorMeta> = {
  // #region logical operators
  AND: {
    text: "AND",
    json: "and",
    label: "and",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.And,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  OR: {
    text: "OR",
    json: "or",
    label: "or",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Or,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  NOT: {
    text: "NOT",
    json: "not",
    label: "not",
    arity: Arity.Unary,
    notation: "prefix",
    precedence: Precedence.Unary,
    associativity: "right",
    textFormatter: (op, arg) => `${op} ${arg}`,
  },
  // #endregion

  // #region comparison operators
  EQUAL: {
    text: "=",
    json: "=",
    label: "equal",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Equality,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  NOT_EQUAL: {
    text: "<>",
    json: "<>",
    label: "not equal to",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Equality,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  LESS: {
    text: "<",
    json: "<",
    label: "less than",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Comparison,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  LESS_EQUAL: {
    text: "<=",
    json: "<=",
    label: "less than or equal to",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Comparison,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  GREATER: {
    text: ">",
    json: ">",
    label: "greater than",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Comparison,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  GREATER_EQUAL: {
    text: ">=",
    json: ">=",
    label: "greater than or equal to",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Comparison,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  // #endregion

  // #region arithmetic operators
  // https://www.opengis.net/spec/cql2/1.0/req/arithmetic
  PLUS: {
    text: "+",
    json: "+",
    label: "addition",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Term,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  MINUS: {
    text: "-",
    json: "-",
    label: "subtraction",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Term,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  STAR: {
    text: "*",
    json: "*",
    label: "multiplication",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Factor,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
  },
  SLASH: {
    text: "/",
    json: "/",
    label: "division",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Factor,
    associativity: "left",
    textFormatter: infixFunctionFormatter,
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
  // https://www.opengis.net/spec/cql2/1.0/req/advanced-comparison-operators
  LIKE: {
    text: "LIKE",
    json: "like",
    label: "like",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Comparison,
    associativity: "left",
    textFormatter: (op, negate, value, pattern) => {
      return `${value} ${negate === "true" ? "NOT " : ""}${op} ${pattern}`;
    },
  },
  BETWEEN: {
    text: "BETWEEN",
    json: "between",
    label: "between",
    arity: Arity.Ternary,
    notation: "mixfix",
    precedence: Precedence.Comparison,
    associativity: "left",
    textFormatter: (op, negate, value, start, end) => {
      return `${value} ${negate === "true" ? "NOT " : ""}${op} ${start} AND ${end}`;
    },
  },
  IN: {
    text: "IN",
    json: "in",
    label: "in",
    arity: Arity.Binary,
    notation: "infix",
    precedence: Precedence.Comparison,
    associativity: "left",
    textFormatter: (op, negate, value, values) => {
      return `${value} ${negate === "true" ? "NOT " : ""}${op} ${values}`;
    }
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
    notation: "prefix",
    precedence: Precedence.Unary,
    associativity: "right",
    textFormatter: functionFormatter,
  },
  ACCENTI: {
    text: "ACCENTI",
    json: "accenti",
    label: "Accent-insensitive Comparison",
    arity: Arity.Unary,
    notation: "prefix",
    precedence: Precedence.Unary,
    associativity: "right",
    textFormatter: functionFormatter,
  },
  // #endregion

  // #region Spatial Functions
  // https://www.opengis.net/spec/cql2/1.0/req/spatial-functions
  S_CONTAINS: {
    text: "S_CONTAINS",
    json: "s_contains",
    label: "Spatial Contains",
    arity: Arity.Binary,
    notation: "function",
    precedence: Precedence.Func,
    associativity: "right",
    textFormatter: functionFormatter,
  },
  S_CROSSES: {
    text: "S_CROSSES",
    json: "s_crosses",
    label: "Spatial Crosses",
    arity: Arity.Binary,
    notation: "function",
    precedence: Precedence.Func,
    associativity: "right",
    textFormatter: functionFormatter,
  },
  S_DISJOINT: {
    text: "S_DISJOINT",
    json: "s_disjoint",
    label: "Spatial Disjoints",
    arity: Arity.Binary,
    notation: "function",
    precedence: Precedence.Func,
    associativity: "right",
    textFormatter: functionFormatter,
  },
  S_EQUALS: {
    text: "S_EQUALS",
    json: "s_equals",
    label: "Spatial Equals",
    arity: Arity.Binary,
    notation: "function",
    precedence: Precedence.Func,
    associativity: "right",
    textFormatter: functionFormatter,
  },
  S_INTERSECTS: {
    text: "S_INTERSECTS",
    json: "s_intersects",
    label: "Spatial Intersects",
    arity: Arity.Binary,
    notation: "function",
    precedence: Precedence.Func,
    associativity: "right",
    textFormatter: functionFormatter,
  },
  S_OVERLAPS: {
    text: "S_OVERLAPS",
    json: "s_overlaps",
    label: "Spatial Overlap",
    arity: Arity.Binary,
    notation: "function",
    precedence: Precedence.Func,
    associativity: "right",
    textFormatter: functionFormatter,
  },
  S_TOUCHES: {
    text: "S_TOUCHES",
    json: "s_touches",
    label: "Spatial Touches",
    arity: Arity.Binary,
    notation: "function",
    precedence: Precedence.Func,
    associativity: "right",
    textFormatter: functionFormatter,
  },
  S_WITHIN: {
    text: "S_WITHIN",
    json: "s_within",
    label: "Spatial Within",
    arity: Arity.Binary,
    notation: "function",
    precedence: Precedence.Func,
    associativity: "right",
    textFormatter: functionFormatter,
  },
  // #endregion
};

export const operatorMetadata: ReadonlyMap<OperatorTokenType, OperatorMeta> = new Map(
  Object.entries(operatorMetadataObj) as [OperatorTokenType, OperatorMeta][],
);
