import Token from "../Token";
import { TokenType } from "../types";

export default function scanText(input: string): Token[] {
  const tokens: Token[] = [];

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
      case "(": {
        addToken("LEFT_PAREN");
        break;
      }
      case ")": {
        addToken("RIGHT_PAREN");
        break;
      }
      case "{": {
        addToken("LEFT_BRACE");
        break;
      }
      case "}": {
        addToken("RIGHT_BRACE");
        break;
      }
      case "[": {
        addToken("LEFT_BRACKET");
        break;
      }
      case "]": {
        addToken("RIGHT_BRACKET");
        break;
      }
      case ".": {
        addToken("DOT");
        break;
      }
      case ",": {
        addToken("COMMA");
        break;
      }
      case "+": {
        addToken("PLUS");
        break;
      }
      case "-": {
        addToken("MINUS");
        break;
      }
    }
  }
  // helper functions

  function isAtEnd() {
    return current >= input.length;
  }

  function advance() {
    return input.charAt(current++);
  }

  function addToken(type: TokenType, literal?: Token["literal"]) {
    const text = literal ? input.substring(start, current) : "";
    tokens.push(new Token(start, type, text, literal));
  }
}
