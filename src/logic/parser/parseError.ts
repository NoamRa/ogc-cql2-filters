import Token from "../Entities/Token";

export default class ParseError extends Error {
  token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this.name = "ParseError";
    this.token = token;
  }
}
