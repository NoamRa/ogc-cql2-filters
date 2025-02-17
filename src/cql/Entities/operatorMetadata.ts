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

export type Notation = "prefix" | "infix" | "postfix";
// type InputOutputType = LiteralType | "unknown"; // unknown used for functions, and can't be validated

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
  notation: Notation;

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
    notation: "infix",
    arity: Arity.Binary,
    // outputType: "boolean",
    // inputTypes: ["boolean"],
    // minArgs: 2,
    // maxArgs: Infinity,
  },
  OR: {
    text: "OR",
    json: "or",
    label: "or",
    notation: "infix",
    arity: Arity.Binary,
    // outputType: "boolean",
    // inputTypes: ["boolean"],
    // minArgs: 2,
    // maxArgs: Infinity,
  },
  NOT: {
    text: "NOT",
    json: "not",
    label: "not",
    notation: "prefix",
    arity: Arity.Unary,
    // outputType: "boolean",
    // inputTypes: ["boolean"],
    // minArgs: 1,
    // maxArgs: 1,
  },
  // #endregion

  // #region comparison operators
  // https://docs.ogc.org/DRAFTS/21-065.html#advanced-comparison-operators
  EQUAL: {
    text: "=",
    json: "=",
    label: "equal",
    arity: Arity.Binary,
    notation: "infix",
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
    notation: "infix",
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
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  LESS_EQUAL: {
    text: "<=",
    json: "<=",
    label: "less than or equal to",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  GREATER: {
    text: ">",
    json: ">",
    label: "greater than",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  GREATER_EQUAL: {
    text: ">=",
    json: ">=",
    label: "greater than or equal to",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  // #endregion

  // #region arithmetic operators
  // https://docs.ogc.org/DRAFTS/21-065.html#arithmetic
  PLUS: {
    text: "+",
    json: "+",
    label: "addition",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "number",
    // inputTypes: ["number"],
  },
  MINUS: {
    text: "-",
    json: "-",
    label: "subtraction",
    arity: Arity.Binary,
    notation: "infix", // TODO
    // outputType: "number",
    // inputTypes: ["number"],
  },
  STAR: {
    text: "*",
    json: "*",
    label: "multiplication",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "number",
    // inputTypes: ["number"],
  },
  SLASH: {
    text: "/",
    json: "/",
    label: "division",
    arity: Arity.Binary,
    notation: "infix",
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
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  BETWEEN: {
    text: "BETWEEN",
    json: "between",
    label: "between",
    arity: Arity.Ternary,
    notation: "infix", // this one's a doozy
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
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["number"], // TODO
  },
  // #endregion

  // #region insensitive comparison operators
  // https://docs.ogc.org/is/21-065r2/21-065r2.html#case-insensitive-comparison
  // https://docs.ogc.org/is/21-065r2/21-065r2.html#accent-insensitive-comparison
  CASEI: {
    text: "CASEI",
    json: "casei",
    label: "Case-insensitive Comparison",
    arity: Arity.Unary,
    notation: "prefix",
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
    notation: "prefix",
    // outputType: "string",
    // inputTypes: ["string"],
    // minArgs: 1,
    // maxArgs: 1,
  },
  // #endregion
};

export const operatorMetadata = new Map<OperatorTokenType, OperatorMeta>(
  Object.entries(operatorMetadataObj) as [OperatorTokenType, OperatorMeta][],
);
