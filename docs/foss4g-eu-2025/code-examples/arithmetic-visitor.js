import { parseText, parseJSON } from "cql2-filters-parser";

const expression = parseText("12 > 11");
expression.toJSON();
console.log(expression.accept);
// start
const arithmeticVisitor = {
  visitBinaryExpression(expr) {
    const op = expr.operator.accept(arithmeticVisitor);
    const left = expr.left.accept(arithmeticVisitor);
    const right = expr.right.accept(arithmeticVisitor);
    switch (op) {
      case "+": {
        return left + right;
      }
      case "*": {
        return left * right;
      }
      case "-": {
        return left - right;
      }
      case ">": {
        return left > right;
      }
    }
  },
  visitLiteralExpression(expr) {
    return expr.value;
  },
  visitOperatorExpression(expr) {
    return expr.toText();
  },
  visitPropertyExpression() {},
};
// end
const res = expression.accept(arithmeticVisitor);
console.log(res);
