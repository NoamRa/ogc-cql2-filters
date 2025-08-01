import { Token } from "../../../entities/Token";
import type { TokenType } from "../../../entities/TokenType";
import { ScanError } from "./scanError";

export function scanText(input: string): Token[] {
  const tokens: Token[] = [];

  const literalWrapper = "'";

  const keywords = new Set<TokenType>([
    "AND",
    "OR",
    "IS",
    "NOT",
    "NULL",
    "TRUE",
    "FALSE",
    "TIMESTAMP",
    "DATE",
    "INTERVAL",
    "LIKE",
    "BETWEEN",
    "IN",
    "CASEI",
    "ACCENTI",
    "BBOX",
    "POINT",
    "MULTIPOINT",
    "LINESTRING",
    "MULTILINESTRING",
    "POLYGON",
    "MULTIPOLYGON",
    "GEOMETRYCOLLECTION",
    "DIV",
  ]);

  /** Index of character in input where we currently read. */
  let current = 0;

  /** Start of current token. Used in multi character tokens. */
  let start = 0;

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
        processMinus();
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
      case "%": {
        addToken("PERCENT", "%");
        break;
      }
      case "^": {
        addToken("CARET", "^");
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
      processIdentifier();
      return;
    }
  }

  // #region helper functions

  function isAtEnd() {
    return current >= input.length;
  }

  /**
   * Get character at index, or \0 if out of bounds
   * @param {number} index, defaults to 0
   * @returns character or \0
   */
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

  function match(expectedChar: string): boolean {
    if (isAtEnd()) return false;
    if (look() !== expectedChar) return false;

    advance();
    return true;
  }

  function isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  function isAlpha(char: string): boolean {
    // very basic
    return /[a-zA-Z_]/.test(char);
  }

  function isAlphaNumeric(char: string): boolean {
    return isAlpha(char) || isDigit(char);
  }

  /** Note: omitting leading zero (ex. -.1) is not supported ATM */
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

  /**
   * Check if it's a minus or negative number
   * 3-5 -> [3, -, 5]
   * 3 -5 -> [3, -5]
   * 3- 5 -> [3, -, 5]
   * 3--5 -> [3, -, -5]
   */
  function processMinus() {
    // At this point, the minus char was already consumed.
    // After these token types a minus can be created. List may be expanded if needed
    const tokenTypes = ["NUMBER", "IDENTIFIER", "RIGHT_PAREN"];
    const prevToken = tokens.at(-1);
    const hasSpaceBeforeMinus = look(-2) !== " ";
    if (isDigit(look()) && !(prevToken && tokenTypes.includes(prevToken.type) && hasSpaceBeforeMinus)) {
      start = current - 1; // Include the minus sign
      processNumber();
    } else {
      addToken("MINUS", "-");
    }
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

  function processIdentifier() {
    while (isAlphaNumeric(look())) {
      advance();
    }

    const text = input.substring(start, current);
    const possibleType = text.toUpperCase() as TokenType;
    const type = keywords.has(possibleType) ? possibleType : "IDENTIFIER";

    switch (type) {
      case "TRUE": {
        addToken(type, true);
        return;
      }
      case "FALSE": {
        addToken(type, false);
        return;
      }
      default: {
        addToken(type, text);
      }
    }
  }

  // #region
}
