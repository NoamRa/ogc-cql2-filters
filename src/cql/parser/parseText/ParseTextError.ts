import { Token } from "../../entities/Token";

export class ParseTextError extends Error {
  token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this.name = "ParseError";
    this.token = token;
  }
}
