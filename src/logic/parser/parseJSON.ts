import { Expression, LiteralExpression } from "../Entities/Expression";

export default function parseJSON(input: object): Expression {
  return new LiteralExpression(JSON.stringify(input)); // TODO
}
