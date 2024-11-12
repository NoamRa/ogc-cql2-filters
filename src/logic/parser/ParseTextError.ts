import Token from "../Entities/Token";

export default class ParseTextError extends Error {
  token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this.name = "ParseError";
    this.token = token;
  }
}
