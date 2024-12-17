// import type { LiteralType } from "./types";

export enum Arity {
  Variadic,
  Unary,
  Binary,
  Ternary,
}

export type Notation = "prefix" | "infix" | "postfix";
// type InputOutputType = LiteralType | "unknown"; // unknown used for functions, and can't be validated

export interface OperatorMeta {
  label: string;
  arity: Arity;
  notation: Notation; // for CQL Text
  // outputType: InputOutputType;
  // inputTypes: InputOutputType[];
  // minArgs: number;
  // maxArgs: number;
}

// const allInputTypes: InputOutputType[] = ["null", "boolean", "number", "string", "date", "timestamp"] as const;

export const operatorMetadata: Record<string, OperatorMeta> = {
  // #region logical operators
  and: {
    label: "and",
    notation: "infix",
    arity: Arity.Variadic,
    // outputType: "boolean",
    // inputTypes: ["boolean"],
    // minArgs: 2,
    // maxArgs: Infinity,
  },
  or: {
    label: "or",
    notation: "infix",
    arity: Arity.Variadic,
    // outputType: "boolean",
    // inputTypes: ["boolean"],
    // minArgs: 2,
    // maxArgs: Infinity,
  },
  not: {
    label: "not",
    arity: Arity.Unary,
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["boolean"],
    // minArgs: 1,
    // maxArgs: 1,
  },
  // #endregion

  // #region comparison operators
  // https://docs.ogc.org/DRAFTS/21-065.html#advanced-comparison-operators
  "=": {
    label: "equal",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: allInputTypes,
    // minArgs: 2,
    // maxArgs: 2,
  },
  "<>": {
    label: "not equal to",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: allInputTypes,
  },
  isNull: {
    label: "is null",
    arity: Arity.Unary,
    notation: "postfix",
    // outputType: "boolean",
    // inputTypes: allInputTypes,
    // maxArgs: 1,
  },
  "<": {
    label: "less than",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  "<=": {
    label: "less than or equal to",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  ">": {
    label: "greater than",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  ">=": {
    label: "greater than or equal to",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "boolean",
    // inputTypes: ["number"],
  },
  // #endregion

  // #region arithmetic operators
  // https://docs.ogc.org/DRAFTS/21-065.html#arithmetic
  "+": {
    label: "addition",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "number",
    // inputTypes: ["number"],
  },
  "-": {
    label: "subtraction",
    arity: Arity.Binary,
    notation: "infix", // TODO
    // outputType: "number",
    // inputTypes: ["number"],
  },
  "*": {
    label: "multiplication",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "number",
    // inputTypes: ["number"],
  },
  "/": {
    label: "division",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "number",
    // inputTypes: ["number"],
  },
  "%": {
    label: "modulo",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "number",
    // inputTypes: ["number"],
  },
  div: {
    label: "integer division",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "number",
    // inputTypes: ["number"],
  },
  "^": {
    label: "exponention",
    arity: Arity.Binary,
    notation: "infix",
    // outputType: "number",
    // inputTypes: ["number"],
  },
  // #endregion

  // #region advanced comparison operators
  // https://docs.ogc.org/DRAFTS/21-065.html#advanced-comparison-operators
  // like: {
  //   label: "like",
  //   arity: Arity.Binary,
  //   notation: "infix",
  //   outputType: "boolean",
  //   inputTypes: ["number"], // TODO
  // },
  // between: {
  //   label: "between",
  //   arity: Arity.Ternary,
  //   outputType: "boolean",
  //   inputTypes: ["number"], // TODO
  //   // minArgs: 3,
  //   // maxArgs: 3,
  // },
  // in: {
  //   label: "in",
  //   arity: Arity.Binary,
  //   outputType: "boolean",
  //   inputTypes: ["number"], // TODO
  // },
  // #endregion
};
