import Token from "../Entities/Token";
import { DATE_FORMATS, TIMESTAMP_FORMATS } from "../Time/time";
import { TokenType } from "../types";
import ScanError from "./scanError";

export default function scanText(input: string): Token[] {
  const tokens: Token[] = [];

  const literalWrapper = "'";

  const keywords: Record<string, TokenType> = {
    IS: "IS",
    NOT: "NOT",
    NULL: "NULL",

    // AND: TokenType.AND,
    // OR: TokenType.OR,
    // TRUE: "TRUE",
    // FALSE: "FALSE",
    TIMESTAMP: "TIMESTAMP",
    DATE: "DATE",
  };

  let current = 0; // index where we currently read
  let start = 0; // start of current token
  while (!isAtEnd()) {
    start = current;
    scanToken();
  }
  tokens.push(new Token(current, "EOF", ""));

  return tokens;

  function scanToken() {
    const char = advance();
    switch (char) {
      // Tokens with one character
      case "(": {
        addToken("LEFT_PAREN", "(");
        break;
      }
      case ")": {
        addToken("RIGHT_PAREN", ")");
        break;
      }
      case "{": {
        addToken("LEFT_BRACE", "{");
        break;
      }
      case "}": {
        addToken("RIGHT_BRACE", "}");
        break;
      }
      case "[": {
        addToken("LEFT_BRACKET", "[");
        break;
      }
      case "]": {
        addToken("RIGHT_BRACKET", "]");
        break;
      }
      case ".": {
        addToken("DOT", ".");
        break;
      }
      case ",": {
        addToken("COMMA", ",");
        break;
      }
      case "+": {
        addToken("PLUS", "+");
        break;
      }
      case "-": {
        addToken("MINUS", "-");
        break;
      }
      case "*": {
        addToken("STAR", "*");
        break;
      }
      case "=": {
        addToken("EQUAL", "=");
        break;
      }

      // Tokens with one or two characters
      case ">": {
        if (match("=")) {
          addToken("GREATER_EQUAL", ">=");
        } else {
          addToken("GREATER", ">");
        }
        break;
      }
      case "<": {
        if (match("=")) {
          addToken("LESS_EQUAL", "<=");
        } else if (match(">")) {
          addToken("NOT_EQUAL", "<>");
        } else {
          addToken("LESS", "<");
        }
        break;
      }

      case "/": {
        addToken("SLASH", "/");
        break;
      }

      // Whitespace and new line
      case " ":
      case "\r":
      case "\n":
      case "\t": {
        break;
      }

      // Literals
      case literalWrapper: {
        processString();
        break;
      }
    }

    if (isDigit(char)) {
      processNumber();
      return;
    }
    if (isAlpha(char)) {
      identifier();
      return;
    }
  }

  // #region helper functions

  function isAtEnd() {
    return current >= input.length;
  }

  function look(index = 0): string {
    if (isAtEnd()) return "\0";
    return input[current + index];
  }

  function advance(): string {
    return input.charAt(current++);
  }

  function addToken(type: TokenType, literal: Token["literal"]) {
    const lexeme = input.substring(start, current);
    tokens.push(new Token(start, type, lexeme, literal));
  }

  function match(expected: string): boolean {
    if (isAtEnd()) return false;
    if (look() !== expected) return false;

    advance();
    return true;
  }

  function isDigit(char: string): boolean {
    return char.length === 1 && !isNaN(Number.parseInt(char));
  }

  function isAlpha(char: string): boolean {
    // very basic
    return /[a-zA-Z_]/.test(char);
  }

  function isAlphaNumeric(char: string): boolean {
    return isAlpha(char) || isDigit(char);
  }

  function processNumber() {
    // At this point, the first digit was already consumed.
    while (isDigit(look())) {
      advance();
    }

    if (look() === "." && isDigit(look(1))) {
      advance();
      while (isDigit(look())) {
        advance();
      }
    }

    addToken("NUMBER", Number(input.substring(start, current)));
  }

  function processString() {
    // At this point, the first quote was already consumed.
    // Also assumes there's no escaped quote
    while (look() !== literalWrapper && !isAtEnd()) {
      advance();
    }

    if (isAtEnd()) {
      throw new ScanError(`Unterminated string at character index ${current}`);
    }

    // Found the closing double-quote:
    advance();

    // Trim the surrounding quotes.
    const literal = input.substring(start + 1, current - 1);
    addToken("STRING", literal);
  }

  function identifier() {
    while (isAlphaNumeric(look())) {
      advance();
    }

    const text = input.substring(start, current);
    const type: TokenType = keywords[text] ?? "IDENTIFIER";
    if (type === "DATE" || type === "TIMESTAMP") {
      processDate(type);
      return;
    }

    addToken(type, text);
  }

  function processDate(type: "DATE" | "TIMESTAMP") {
    // Scan DATE('1969-07-20') or TIMESTAMP('1969-07-20T20:17:40Z')
    // The entire date or timestamp phrase is going to be consumed into one token
    // At this point, DATE or TIMESTAMP have been consumed.

    if (!match("(")) throw new ScanError(`Expected open parenthesis after ${type} at character index ${current}`);
    if (!match("'")) throw new ScanError(`Expected quote after ${type}( at character index ${current}`);

    const formats = type === "DATE" ? DATE_FORMATS : TIMESTAMP_FORMATS;
    for (const format of formats) {
      // formats are sorted from longest to shortest, so the match is greedy
      const literal = input.substring(current, current + format.length);
      if (format.regex.test(literal)) {
        const date = new Date(literal);
        if (!Number.isNaN(date.getDate())) {
          current += format.length;
          if (!match("'")) {
            throw new ScanError(`Expected closing quote after ${type}('${literal} at character index ${current}`);
          }
          if (!match(")")) {
            throw new ScanError(
              `Expected closing parenthesis after ${type}('${literal}' at character index ${current}`,
            );
          }
          addToken(format.type, date);
          return;
        }
      }
    }

    throw new ScanError(
      // printing from current to +30 chars because we don't know how long the date lexeme is
      `Invalid ${type.toLowerCase()} value at character index ${current} - ${input.substring(current, current + 30)}`,
    );
  }

  // #region
}
